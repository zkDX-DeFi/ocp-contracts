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

    let remoteLzChainId = getLzChainIdByNetworkName("base_testnet");
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
    // https://testnet.layerzeroscan.com/10121/address/0x1a763e0ee00944edcd45d9bd318b7d56ddddb75c/message/10160/address/0x19ba7df61960ecb07a24e5abd5227374eca9ce2d/nonce/1
}

main().then(() => process.exit(0))