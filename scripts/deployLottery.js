const { ethers } = require("hardhat")
const { deploy } = require("./deployGeneral")

deploy("LotteryChainLink", 0, 0, 0, 0, ethers.utils.parseEther("0.1"), 100, "0xb327dec59f9506cd19bce01482ed1cebea2f0d45");