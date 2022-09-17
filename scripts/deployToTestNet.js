const {ethers} = require("hardhat")

let entranceFee_ = ethers.utils.parseEther("0.01").toString()
let interval_ = 100
let subscriptionId_ = 1665
let vrfCoordinator_ = "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D"

async function deploy () {
    let lotteryContract = await ethers.getContractFactory("LotteryChainLink");
    console.log("Deploying contract ...");
    let lotteryInstance = await lotteryContract.deploy(entranceFee_,interval_,subscriptionId_,vrfCoordinator_);
    await lotteryInstance.deployed();
    console.log("Deploy success :" , lotteryInstance.address);
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });