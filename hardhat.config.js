require("@nomicfoundation/hardhat-toolbox");
require("solhint");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("dotenv").config({ path: "./.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localHost: {
      url: "http://127.0.0.1:8545/",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"],
      chainId: 31337
    },
    goerli: {
      url: process.env.goerliApi,
      accounts: [process.env.privateKey]
    }
  },
  gasReporter: {
    enabled: true
  },
  etherscan: {
    apiKey: process.env.etherscanApi
  },
  solidity: "0.8.9",
};
