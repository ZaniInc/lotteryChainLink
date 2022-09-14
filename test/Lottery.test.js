const { ethers } = require("hardhat");
const { expect } = require("chai");


describe("LotteryChainLink", () => {

    let lotteryInstance;
    let vrfInsctance;

    let owner, acc1, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9;

    before("Deploy contracts", async () => {
        [owner, acc1, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9] = await ethers.getSigners();
        const vrfConsumerContract = await ethers.getContractFactory("VRFV2Consumer");
        vrfInsctance = await vrfConsumerContract.deploy("235");

        const lotteryContract = await ethers.getContractFactory("LotteryChainLink");
        lotteryInstance = await lotteryContract.deploy("1", vrfInsctance.address);
    })

    it("Work ?", async () => {
        let a = await lotteryInstance.lastWinner();
        expect(a).to.be.equal(0);
    })
})