import {deployments, ethers, run} from "hardhat";
import {CHAIN_ID_LOCAL, CHAIN_ID_LOCAL2} from "./constants";

export async function deployFixture() {

    await deployments.fixture();

    const users = {
        owner: await ethers.getNamedSigner("owner"),
        user1: await ethers.getNamedSigner("user1"),
        user2: await ethers.getNamedSigner("user2")
    }

    const contracts = {
        poolFactory: await ethers.getContract("OCPPoolFactory"),
        tokenFactory: await ethers.getContract("OCPTokenFactory"),
        tokenManager: await ethers.getContract("OCPTokenManager"),
        router: await ethers.getContract("OCPRouter"),
        bridge: await ethers.getContract("OCPBridge"),
        lzEndpoint: await ethers.getContract("LZEndpoint"),
        weth: await ethers.getContract("WETH"),

        poolFactory2: await ethers.getContract("OCPPoolFactory2"),
        tokenFactory2: await ethers.getContract("OCPTokenFactory2"),
        tokenManager2: await ethers.getContract("OCPTokenManager2"),
        router2: await ethers.getContract("OCPRouter2"),
        bridge2: await ethers.getContract("OCPBridge2"),
        lzEndpoint2: await ethers.getContract("LZEndpoint2"),
        weth2: await ethers.getContract("WETH2"),

        ocpTokenFactory: await ethers.getContract("OCPTokenFactory"),
    }

    return {...users, ...contracts};
}

export async function deployNew(name: any, args: any) {
    const contractFactory = await ethers.getContractFactory(name)
    return await contractFactory.deploy(...args);
}

export async function getLzEndPointByChainId(chainId: any) {
    let endpoint: any;
    if (chainId == CHAIN_ID_LOCAL || chainId == CHAIN_ID_LOCAL2) {
        let contractName = chainId == CHAIN_ID_LOCAL ? "LZEndpoint" : "LZEndpoint2";
        const {deploy} = deployments;
        const owner = await ethers.getNamedSigner("owner");
        endpoint = await deploy(contractName, {
            contract: "LZEndpoint",
            from: owner.address,
            args: [chainId],
            log: true
        });
    }
    if (!endpoint)
        throw new Error("lzEndpoint not found on network " + chainId);
    return endpoint.address;
}

export async function getWethByChainId(chainId: any) {
    let endpoint: any;
    if (chainId == CHAIN_ID_LOCAL || chainId == CHAIN_ID_LOCAL2) {
        let contractName = chainId == CHAIN_ID_LOCAL ? "WETH" : "WETH2";
        const {deploy} = deployments;
        const owner = await ethers.getNamedSigner("owner");
        endpoint = await deploy(contractName, {
            contract: "Token",
            from: owner.address,
            args: ["WETH", 18, 0, 0, 0],
            log: true
        });
    }
    if (!endpoint)
        throw new Error("Weth not found on network " + chainId);
    return endpoint.address;
}

export function newWallet() {
    return ethers.Wallet.createRandom()
}

export async function reportGasUsed(tx: any, label: any) {
    const {gasUsed} = await ethers.provider.getTransactionReceipt(tx.hash)
    console.info(label, gasUsed.toString())
    return gasUsed
}
