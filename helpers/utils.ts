import {deployments, ethers, run} from "hardhat";
import {
    CHAIN_ID_BASE_TEST,
    CHAIN_ID_GOERLI,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2, CHAIN_ID_ZKSYNC_TESTNET,
    ENDPOINT_BASE_TESTNET,
    ENDPOINT_GOERLI, ENDPOINT_ZKSYNC_TESTNET
} from "./constants";

export async function deployFixture() {

    await deployments.fixture();

    const users = {
        owner: await ethers.getNamedSigner("owner"),
        user1: await ethers.getNamedSigner("user1"),
        user2: await ethers.getNamedSigner("user2")
    }

    const contracts = {
        poolFactory: await ethers.getContract("OCPoolFactory"),
        tokenManager: await ethers.getContract("OCPOmniTokenManager"),
        bridge: await ethers.getContract("OCPBridge"),
        router: await ethers.getContract("OCPRouter"),
        lzEndpoint: await ethers.getContract("LZEndpoint"),
        weth: await ethers.getContract("WETH"),

        poolFactory2: await ethers.getContract("OCPoolFactory2"),
        tokenManager2: await ethers.getContract("OCPOmniTokenManager2"),
        bridge2: await ethers.getContract("OCPBridge2"),
        router2: await ethers.getContract("OCPRouter2"),
        lzEndpoint2: await ethers.getContract("LZEndpoint2"),
        weth2: await ethers.getContract("WETH2"),
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
    } else if (chainId == CHAIN_ID_GOERLI) {
        return ENDPOINT_GOERLI;
    } else if (chainId == CHAIN_ID_BASE_TEST) {
        return ENDPOINT_BASE_TESTNET;
    } else if (chainId == CHAIN_ID_ZKSYNC_TESTNET) {
        return ENDPOINT_ZKSYNC_TESTNET;
    }
    if (!endpoint)
        throw new Error("lzEndpoint not found on network " + chainId);
    return endpoint.address;
}

export async function getWethByChainId(chainId: any) {
    let weth: any;
    const {deploy} = deployments;
    const owner = await ethers.getNamedSigner("owner");
    if (chainId == CHAIN_ID_LOCAL2) {
        weth = await deploy("WETH2", {
            contract: "Token",
            from: owner.address,
            args: ["WETH2", 18, 0, 0, 0],
            log: true
        });
    } else {
        weth = await deploy("WETH", {
            contract: "Token",
            from: owner.address,
            args: ["WETH", 18, 0, 0, 0],
            log: true
        });
    }
    if (!weth)
        throw new Error("Weth not found on network " + chainId);
    return weth.address;
}

export function newWallet() {
    return ethers.Wallet.createRandom()
}

export async function reportGasUsed(tx: any, label: any) {
    const {gasUsed} = await ethers.provider.getTransactionReceipt(tx.hash)
    console.info(label, gasUsed.toString())
    return gasUsed
}
