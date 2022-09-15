// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract VRFV2Consumer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;

    uint256[] public s_randomWords;

    //subscription ID.
    bytes32 private keyHash =
        0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15;
    uint32 private callbackGasLimit = 100000;
    uint16 private requestConfirmations = 3;
    uint32 private numWords = 2;
    uint64 private s_subscriptionId;
    uint256 private s_requestId;

    constructor(uint64 subscriptionId, address vrfCoordinator)
        VRFConsumerBaseV2(vrfCoordinator)
    {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }

    function getRandomWords() public view returns (uint256[] memory) {
        return s_randomWords;
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

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        s_randomWords = randomWords;
    }
}
