const { ethers } = require("hardhat");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    constants
} = require("@openzeppelin/test-helpers");


describe("LotteryChainLink", () => {

    let lotteryInstance;
    let VRFCoordinatorV2;

    let owner, acc1, acc2;
    let subId_;

    before("Deploy contracts", async () => {
        [owner, acc1, acc2] = await ethers.getSigners();


        VRFCoordinatorV2 = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        VRFCoordinatorV2Instance = await VRFCoordinatorV2.deploy(1e7, ethers.utils.parseEther("0.25").toString());
        let subIdResponce = await VRFCoordinatorV2Instance.createSubscription();
        let subIdReceipt = await subIdResponce.wait();
        subId_ = subIdReceipt.events[0].args.subId;
        await VRFCoordinatorV2Instance.fundSubscription(subId_, ethers.utils.parseEther("100000000").toString());



        const lotteryContract = await ethers.getContractFactory("LotteryChainLink");
        lotteryInstance = await lotteryContract.deploy(ethers.utils.parseEther("1").toString(),
            100, subId_, VRFCoordinatorV2Instance.address);
        await lotteryInstance.deployed();
    })

    describe("enterRaffle", async () => {
        it("Enter to Lottery by acc1", async () => {
            let balanceBefore = await acc1.getBalance();

            console.log(ethers.utils.parseEther("0.0002").toString(),);
            await lotteryInstance.connect(acc1).enterRaffle({ value: ethers.utils.parseEther("1") });
        })
        it("Enter to Lottery by acc2", async () => {
            let balanceBefore = await acc2.getBalance();
            console.log(balanceBefore);
            await lotteryInstance.connect(acc2).enterRaffle({ value: ethers.utils.parseEther("1") });
        })
    });

    describe("performUpkeep", async () => {
        it("performUpkeep", async () => {
            await time.increase(100);
            const {id} = await lotteryInstance.callStatic.requestRandomWords();
            console.log("1");
            await VRFCoordinatorV2Instance.fulfillRandomWords(subId_, lotteryInstance.address);
            console.log("1");
            await lotteryInstance.performUpkeep("0x00");
        });
    })
})