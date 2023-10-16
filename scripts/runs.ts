import {deployments, ethers, getNamedAccounts} from "hardhat";

async function runs() {

    const {deploy, read, execute, get} = deployments;
    const {owner} = await getNamedAccounts();

    let tokenManager = await ethers.getContract("OCPOmniTokenManager");
    let token = "0xAE592C96f7dD8095D824a1dA0D3CFab81663dEDB";
    let omniToken = await tokenManager.omniTokens(token, 10165);
    console.log("omniToken: %s", omniToken);
}

runs().then(() => process.exit(0))