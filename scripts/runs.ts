import {deployments, ethers, getNamedAccounts} from "hardhat";
import {parseEther} from "ethers/lib/utils";

async function runs() {

    const {deploy, read, execute, get} = deployments;
    const {owner} = await getNamedAccounts();

    let tokenManager = await ethers.getContract("OCPOmniTokenManager")

    // ==================== check router address ====================
    // let router = await get("OCPRouter");
    // let router1 = await read("OCPBridge", "router");
    // let router2 = await read("OCPOmniTokenManager", "router");
    // console.log(`router: ${router.address}, router1: ${router1}, router2: ${router2}`);
    // expect(router.address).to.equal(router1);
    // expect(router.address).to.equal(router2);

    // ==================== getOmniTokenList  ====================
    // let list = await tokenManager.getOmniTokenList();
    // for (let i = 0; i < list.length; i++) {
    //     let token = await ethers.getContractAt("Token", list[i]);
    //     console.log(`token: ${token.address}, name: ${await token.name()}`);
    // }

    // ==================== getOmniTokenInfo  ====================

    let exZKDX = await ethers.getContract("esZKDX")
    await exZKDX.mint("0x4e8730f175811C3079C411309DB823E62a4f9598", parseEther("10000"));
}

runs().then(() => process.exit(0))