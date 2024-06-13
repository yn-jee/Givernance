import { GiversTokenABI, GiversTokenBytecode, GiverABI, GiverBytecode } from "./tokenConfig.js";

// async function deployGiversToken(initialOwner) {
//     const GiversTokenFactory = new ethers.ContractFactory(GiversTokenABI, GiversTokenBytecode, wallet);
//     const giversToken = await GiversTokenFactory.deploy(initialOwner);
//     await giversToken.deployed();
//     console.log("GiversToken deployed at:", giversToken.address);
//     return giversToken.address;
// }


async function deployGiversToken(initialOwner) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const GiversTokenFactory = new ethers.ContractFactory(GiversTokenABI, GiversTokenBytecode, signer);
    const giversToken = await GiversTokenFactory.deploy(initialOwner);
    await giversToken.deployed();
    console.log("GiversToken deployed at:", giversToken.address);
    return giversToken.address;
}


async function deployGiver(tokenAddress, timelockAddress) {
    const GiverFactory = new ethers.ContractFactory(GiverABI, GiverBytecode, wallet);
    const giver = await GiverFactory.deploy(tokenAddress, timelockAddress);
    await giver.deployed();
    console.log("Giver deployed at:", giver.address);
    return giver.address;
}

export { deployGiversToken, deployGiver, GiversTokenABI, GiversTokenBytecode, GiverABI, GiverBytecode };