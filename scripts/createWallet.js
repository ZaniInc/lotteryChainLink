const { ethers } = require("hardhat")

async function createWallet() {
    let provider = await new ethers.providers.JsonRpcProvider("");
    const wallet = await ethers.Wallet.createRandom(provider)
    console.log('address:', wallet.address)
    console.log('mnemonic:', wallet.mnemonic.phrase)
    console.log('privateKey:', wallet.privateKey)
}

createWallet()