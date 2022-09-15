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

    VRFCoordinatorV2 = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    vRFCoordinatorV2Instance = await VRFCoordinatorV2.deploy(gasFee_, gasPriceLink_);
    // await ethers.providers.wait(1)
    console.log("VRFCoordinatorV2", vRFCoordinatorV2Instance.address);

    let tx = await vRFCoordinatorV2Instance.createSubscription();
    const receipt = await tx.wait(1);
    subId_ = receipt.events[0].args.subId;
    console.log(subId_);
    await vRFCoordinatorV2Instance.fundSubscription(subId_, ethers.utils.parseEther("100000000") );
    balance = await vRFCoordinatorV2Instance.getSubscription(subId_);
    console.log(balance)


    // VRFConsumer = await ethers.getContractFactory("VRFV2Consumer");
    // VRFConsumerInstance = await VRFConsumer.deploy(subId_, vRFCoordinatorV2Instance.address);
    // await VRFConsumerInstance.deployed();
    // // await VRFConsumerInstance.wait(1);
    // console.log("VRFConsumerInstance", VRFConsumerInstance.address);
    // balancee = await vRFCoordinatorV2Instance.getSubscription(22099);
    // console.log(balancee);
    // await VRFConsumerInstance.requestRandomWords();
    // let words = await VRFConsumerInstance.getWinner();
    // console.log(words.toString());

    Lottery = await ethers.getContractFactory("LotteryChainLink");
    lotteryInstance = await Lottery.deploy(entranceFee_, interval_, subId_, vRFCoordinatorV2Instance.address);
    // Create a transaction object
    // let val = ethers.utils.parseEther(ethers.utils.parseEther("1"))
    // let txx = {
    //     to: VRFConsumerInstance.address,
    //     // Convert currency unit from ether to wei
    //     value: ethers.utils.parseEther("1").toString()
    // }
    // // Send a transaction
    // const signers = await ethers.getSigners();
    // await signers[0].sendTransaction(txx)
    console.log("lotteryInstance", lotteryInstance.address);
    const providerr = await new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    const waller = await new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", providerr)
    await lotteryInstance.connect(waller).enterRaffle({ value: ethers.utils.parseEther("0.1") });
    await lotteryInstance.enterRaffle({ value: ethers.utils.parseEther("1") });
    await lotteryInstance.requestRandomWords();
    await vRFCoordinatorV2Instance.fulfillRandomWords(1, lotteryInstance.address);
    console.log("1");
    // await VRFConsumerInstance.requestRandomWords();
    let words = await lotteryInstance.getRandomWords();
    console.log(words.toString());
    let txxx = await lotteryInstance.performUpkeep("0x00");
    let txReceipt = await txxx.wait(1);
    let winner = txReceipt.events[1].args.requestId_;
    console.log(winner.toString());
    balancee = await vRFCoordinatorV2Instance.getSubscription(subId_);
    console.log(balancee)
    99980644499999999000000000
    1000000000000000000

    // Lottery = await ethers.getContractFactory("LotteryChainLink");
    // lotteryInstance = await Lottery.deploy(entranceFee_, interval_, VRFConsumerContractAddress_);
    // console.log("Fuck you", lotteryInstance.address);

}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });