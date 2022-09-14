const { ethers, network } = require("hardhat");

let Lottery, VRFCoordinatorV2, VRFConsumer;
let subId_, vrfCoordinatorAddress_, gasFee_, gasPriceLink_, entranceFee_, interval_;

async function deploy() {

    let chainID = network.config.chainId;
    gasPriceLink_ = ethers.utils.parseEther("0.25");
    gasFee_ = 1e9;
    vrfCoordinatorAddress_ = "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D";
    entranceFee_ = ethers.utils.parseEther("0.1");
    interval_ = 100;
    if (chainID == 31337) {
        VRFCoordinatorV2 = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        vRFCoordinatorV2Instance = await VRFCoordinatorV2.deploy(gasFee_, gasPriceLink_);
        // await ethers.providers.wait(1)
        console.log("VRFCoordinatorV2", vRFCoordinatorV2Instance.address);

        let tx = await vRFCoordinatorV2Instance.createSubscription();
        const receipt = await tx.wait(1);
        subId_ = receipt.events[0].args.subId;
        console.log(subId_);
        await vRFCoordinatorV2Instance.fundSubscription(subId_, ethers.utils.parseEther("30"));
        balance = await vRFCoordinatorV2Instance.getSubscription(subId_);
        console.log(balance)


        VRFConsumer = await ethers.getContractFactory("VRFV2Consumer");
        VRFConsumerInstance = await VRFConsumer.deploy(subId_, vRFCoordinatorV2Instance.address);
        // await VRFConsumerInstance.wait(1);
        console.log("VRFConsumerInstance", VRFConsumerInstance.address);
        balancee = await vRFCoordinatorV2Instance.getSubscription(subId_);
        console.log(balancee)

        Lottery = await ethers.getContractFactory("LotteryChainLink");
        lotteryInstance = await Lottery.deploy(entranceFee_, interval_, VRFConsumerInstance.address);
        // Create a transaction object
        // let txx = {
        //     to: lotteryInstance.address,
        //     // Convert currency unit from ether to wei
        //     value: ethers.utils.parseEther(ethers.utils.parseEther("1"))
        // }
        // Send a transaction
        // const signers = await ethers.getSigners();
        // signers[0].sendTransaction(txx)
        console.log("lotteryInstance", lotteryInstance.address);
        const providerr = await new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const waller = await new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", providerr)
        // await lotteryInstance.connect(waller).enterRaffle({ value: ethers.utils.parseEther("0.1") });
        await lotteryInstance.enterRaffle({ value: ethers.utils.parseEther("1") });
        await lotteryInstance.performUpkeep("0x00");
    }
    else {
        // Lottery = await ethers.getContractFactory("LotteryChainLink");
        // lotteryInstance = await Lottery.deploy(entranceFee_, interval_, VRFConsumerContractAddress_);
        // console.log("Fuck you", lotteryInstance.address);
    }
}