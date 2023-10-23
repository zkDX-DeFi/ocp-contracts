import {formatEther, parseEther} from "ethers/lib/utils";
import {deployments, ethers, getNamedAccounts} from "hardhat";
import {ApproveAmount, TYPE_DEPLOY_AND_MINT, TYPE_MINT} from "../helpers/constants";
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

    let remoteLzChainId = getLzChainIdByNetworkName("base_testnet");
    let allowance = await usdc.allowance(owner, router.address);
    if (allowance.lt(amountIn)){
        console.log("approving...");
        await (await usdc.approve(router.address, ApproveAmount)).wait();
    }

    let executeType = TYPE_MINT;
    let msgFee = await router.quoteLayerZeroFee(
        remoteLzChainId,
        executeType,
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
        executeType,
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
    // https://testnet.layerzeroscan.com

    let pool = await factory.getPool(usdc.address);
    console.log(`pool address: ${pool}`);
}

main().then(() => process.exit(0))