// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat/console.sol";
import "./VRFV2Consumer.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LotteryChainLink is KeeperCompatible, VRFV2Consumer, Ownable {
    using Address for address;

    enum LotteryState {
        OPEN,
        CLOSE
    } // 0 = OPEN , 1 = CALCULATE

    address public lastWinner;
    uint256 public interval;
    uint256 public immutable _entranceFee;
    uint256 private _lastTimeStamp;

    address payable[] private _members;

    VRFV2Consumer public VRFcontract;
    LotteryState private _lotteryActualState;

    event EnterRaffle(address indexed memberAddress, uint256 paymentAmount);
    event WinnerIs(address indexed requestId);
    event ManageLotteryState(LotteryState indexed lotteryState);

    constructor(
        uint256 entranceFee_,
        uint256 interval_,
        uint64 subscriptionId_,
        address vrfCoordinator_
    ) VRFV2Consumer(subscriptionId_, vrfCoordinator_) {
        require(
            !vrfCoordinator_.isContract(),
            "Lottery : set correct address for VRFCoordinator"
        );
        _entranceFee = entranceFee_;
        interval = interval_;
        _lotteryActualState = LotteryState.OPEN;
        _members.push(payable(msg.sender));
    }

    function manageLotteryState() external onlyOwner {
        if (_lotteryActualState == LotteryState.OPEN) {
            _lotteryActualState = LotteryState.CLOSE;
        } else {
            _lotteryActualState == LotteryState.OPEN;
        }
        emit ManageLotteryState(_lotteryActualState);
    }

    function enterRaffle() external payable {
        require(msg.value != _entranceFee, "Lottery : your payment too low");
        require(
            _lotteryActualState == LotteryState.OPEN,
            "Lottery : Lottery is not start yet"
        );
        _members.push(payable(msg.sender));
        _lastTimeStamp = block.timestamp;
        emit EnterRaffle(msg.sender, msg.value);
    }

    function performUpkeep(bytes calldata) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        require(upkeepNeeded, "Lottery : requires not completed yet");
        uint256 winnerIndex = pickRandomWinner();
        address payable winner = _members[winnerIndex];
        delete _members;
        lastWinner = winner;
        _lastTimeStamp = block.timestamp;
        (bool success, ) = winner.call{value: address(this).balance}("");
        if (!success) {
            revert("Lottery : Not enough balance to transfer");
        }
        _lotteryActualState = LotteryState.CLOSE;
        console.log(winner);
        emit WinnerIs(winner);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (_lotteryActualState == LotteryState.OPEN);
        bool timeIsOk = ((block.timestamp - _lastTimeStamp) > interval);
        bool playersIsOk = (_members.length > 2);
        bool positiveBalance = (address(this).balance > 0);
        upkeepNeeded = (isOpen && timeIsOk && playersIsOk && positiveBalance);
    }

    function showFee() external view returns (uint256) {
        return _entranceFee;
    }

    function showMembers() external view returns (address payable[] memory) {
        return _members;
    }

    function pickRandomWinner() internal returns (uint256) {
        uint256 requestId = requestRandomWords();
        uint256 randomNumber = s_randomWords[requestId--];
        console.log(address(this).balance);
        console.log(randomNumber);
        uint256 winner = (randomNumber % _members.length) + 1;
        return winner;
    }
}
