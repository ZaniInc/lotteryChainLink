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
    goerli :{
      url:"https://goerli.infura.io/v3/0122fcb2a3c34d0680d96252cb53da8a",
      accounts:["9be42bee0c2f36ebd989f374854d160879bfb2038bf317a4d1857f0085b9a028"]
    }
  },
  gasReporter: {
    enabled: true
  },
  etherscan:{
    apiKey:"MKFNMTKZE4IC6K1YCSS7TFFME1YY6UR9PI"
  },
  solidity: "0.8.9",
};
