// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract LotteryChainLink is KeeperCompatible, Ownable, VRFConsumerBaseV2 {
    using Address for address;

    enum LotteryState {
        OPEN,
        CLOSE
    } // 0 = OPEN , 1 = CALCULATE

    VRFCoordinatorV2Interface COORDINATOR;
    LotteryState private _lotteryActualState;

    // uint256[] public s_randomWords;

    uint256 public prizePool;
    uint256 public interval;
    uint256 public immutable _entranceFee;
    uint256 public s_requestId;
    address public lastWinner;

    bytes32 private keyHash =
        0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15;
    uint32 private callbackGasLimit = 500000;
    uint16 private requestConfirmations = 3;
    uint32 private numWords = 1;
    uint64 private s_subscriptionId;
    uint256 private _lastTimeStamp;

    address payable[] private _members;

    event EnterRaffle(address indexed memberAddress, uint256 paymentAmount);
    event WinnerIs(address indexed requestId);
    event ManageLotteryState(LotteryState indexed lotteryState);

    constructor(
        uint256 entranceFee_,
        uint256 interval_,
        uint64 subscriptionId_,
        address vrfCoordinator_
    ) VRFConsumerBaseV2(vrfCoordinator_) {
        require(
            vrfCoordinator_.isContract(),
            "Lottery : set correct address for VRFCoordinator"
        );
        _entranceFee = entranceFee_;
        interval = interval_;
        _lotteryActualState = LotteryState.OPEN;
        _lastTimeStamp = block.timestamp;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator_);
        s_subscriptionId = subscriptionId_;
    }

    function enterRaffle() external payable {
        require(
            msg.value == _entranceFee,
            "Lottery : your payment value incorrect"
        );
        require(
            _lotteryActualState == LotteryState.OPEN,
            "Lottery : Lottery is not start yet"
        );
        _members.push(payable(msg.sender));
        prizePool += msg.value;
        emit EnterRaffle(msg.sender, msg.value);
    }

    function manageLotteryState() external onlyOwner {
        _lotteryActualState == LotteryState.OPEN
            ? _lotteryActualState = LotteryState.CLOSE
            : _lotteryActualState = LotteryState.OPEN;
        _lastTimeStamp = block.timestamp;
        emit ManageLotteryState(_lotteryActualState);
    }

    function performUpkeep(bytes calldata) external override {
        require(
            _lotteryActualState == LotteryState.OPEN &&
                (block.timestamp - _lastTimeStamp) > interval &&
                _members.length >= 2 &&
                address(this).balance > 0,
            "Lottery : requires not completed"
        );
        uint256 requestId = requestRandomWords();
        s_requestId = requestId;
    }

    function showMembers() external view returns (address payable[] memory) {
        return _members;
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (_lotteryActualState == LotteryState.OPEN);
        bool timeIsOk = ((block.timestamp - _lastTimeStamp) > interval);
        bool playersIsOk = (_members.length >= 2);
        bool positiveBalance = (address(this).balance > 0);
        upkeepNeeded = (isOpen && timeIsOk && playersIsOk && positiveBalance);
        return (upkeepNeeded, "0x00");
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        uint256 winnerIndex = (randomWords[0] % _members.length);
        address payable winner = _members[winnerIndex];
        delete _members;
        delete prizePool;
        lastWinner = winner;
        (bool success, ) = winner.call{value: address(this).balance}("");
        if (!success) {
            revert("Lottery : Not enough balance to transfer");
        }
        _lotteryActualState = LotteryState.CLOSE;
        emit WinnerIs(winner);
    }

    function requestRandomWords() internal returns (uint256) {
        return
            s_requestId = COORDINATOR.requestRandomWords(
                keyHash,
                s_subscriptionId,
                requestConfirmations,
                callbackGasLimit,
                numWords
            );
    }
}
