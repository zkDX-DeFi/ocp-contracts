import {formatEther, parseEther} from "ethers/lib/utils";
import {deployments, ethers, getNamedAccounts} from "hardhat";
import {ApproveAmount, CHAIN_ID_BASE_TEST, TYPE_DEPLOY_AND_MINT} from "../helpers/constants";
import {getLzChainIdByNetworkName} from "../helpers/lzUtils";

async function main() {

    const {deploy} = deployments;
    const {owner} = await getNamedAccounts();

    let usdc;
    try {
        usdc = await ethers.getContract("USDC");
    } catch (e) {
        console.log("deploying token...");
        const deployed = await deploy('USDC', {
            contract: 'Token',
            from: owner,
            args: ["USDC", 18, 0, parseEther("1000000"), parseEther("1000")],
            log: true
        });
        usdc = await ethers.getContractAt("Token", deployed.address);
    }

    let balance = await usdc.balanceOf(owner);
    let amountIn = parseEther("100");
    if (balance.lt(amountIn)) await usdc.faucet();

    const router = await ethers.getContract("OCPRouter");
    const factory = await ethers.getContract("OCPoolFactory");

    let remoteLzChainId = getLzChainIdByNetworkName("goerli");
    let allowance = await usdc.allowance(owner, router.address);
    if (allowance.lt(amountIn)){
        console.log("approving...");
        await (await usdc.approve(router.address, ApproveAmount)).wait();
    }

    let msgFee = await router.quoteLayerZeroFee(
        remoteLzChainId,
        TYPE_DEPLOY_AND_MINT,
        "0x",
        {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: '0x'
        });
    console.log(`Msg Fee: ${formatEther(msgFee[0])}`);

    // mint
    console.log("minting...")
    let tx = await router.omniMint(
        remoteLzChainId,
        usdc.address,
        amountIn,
        owner,
        true,
        owner,
        "0x",
        ({
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: '0x'
        }),
        {value: msgFee[0]}
    );
    console.log(`omniMint tx: ${tx.hash}`);
    // https://testnet.layerzeroscan.com/10165/address/0x31f88af2ef8d6bdf93b670ee12b1cbc4febf2be9/message/10121/address/0xb162d66707442bd48489be84eae4dd8dfc30c9db/nonce/1

    let pool = await factory.getPool(usdc.address);
    console.log(`pool address: ${pool}`);
}

main().then(() => process.exit(0))