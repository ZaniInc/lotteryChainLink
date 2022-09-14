// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./VRFV2Consumer.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract LotteryChainLink is KeeperCompatible {
    enum LotteryState {
        OPEN,
        CLOSE
    } // 0 = OPEN , 1 = CALCULATE
    uint256 private immutable _entranceFee;
    address payable[] private members;
    uint256 private ticketsCount;
    address payable public lastWinner;
    uint256 private lastTimeStamp;
    uint256 public interval;

    VRFV2Consumer public VRFcontract;
    LotteryState private _lotteryActualState;

    event NewMember(address indexed memberAddress);
    event WinnerIs(address indexed requestId_);

    constructor(
        uint256 entranceFee_,
        uint256 interval_,
        address VRFcontract_
    ) {
        _entranceFee = entranceFee_;
        VRFcontract = VRFV2Consumer(VRFcontract_);
        interval = interval_;
        _lotteryActualState = LotteryState.OPEN;
    }

    function enterRaffle() external payable returns (uint256 ticket) {
        // require(msg.value != _entranceFee, "Error : your payment too low");
        require(
            _lotteryActualState == LotteryState.OPEN,
            "Error : Lottery is not start yet"
        );
        ticket = ticketsCount;
        members.push(payable(msg.sender));
        ticketsCount++;
        lastTimeStamp = block.timestamp;
        emit NewMember(msg.sender);
        return ticket;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (_lotteryActualState == LotteryState.OPEN);
        bool timeIsOk = ((block.timestamp - lastTimeStamp) > interval);
        bool playersIsOk = (members.length > 2);
        bool plusBalance = (address(this).balance > 0);
        upkeepNeeded = (isOpen && timeIsOk && playersIsOk && plusBalance);
        // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
    }

    function performUpkeep(bytes calldata) external override {
        // require(
        //     _lotteryActualState == LotteryState.OPEN &&
        //         (block.timestamp - lastTimeStamp) > interval &&
        //         members.length > 2 &&
        //         address(this).balance > 0
        // );
        VRFcontract.requestRandomWords();
        // uint256 randomNumber = VRFcontract.s_randomWords(1);
        // console.log(address(this).balance);
        // console.log(randomNumber);
        // uint256 winner = randomNumber % members.length;
        // lastWinner = members[winner];
        // delete members;
        // lastTimeStamp = block.timestamp;
        // (bool success, ) = lastWinner.call{value: address(this).balance}("");
        // if (!success) {
        //     revert("Not enough balance to transfer");
        // }
        // _lotteryActualState = LotteryState.CLOSE;
        // console.log(lastWinner);
        // emit WinnerIs(lastWinner);
    }

    function showFee() external view returns (uint256) {
        return _entranceFee;
    }

    function showMembers() external view returns (address payable[] memory) {
        return members;
    }
}
