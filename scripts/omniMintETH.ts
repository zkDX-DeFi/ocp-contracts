import {formatEther, parseEther} from "ethers/lib/utils";
import {ethers, getNamedAccounts} from "hardhat";
import {TYPE_DEPLOY_AND_MINT} from "../helpers/constants";
import {getLzChainIdByNetworkName} from "../helpers/lzUtils";

async function main() {

    const {owner} = await getNamedAccounts();
    const router = await ethers.getContract("OCPRouter");
    const factory = await ethers.getContract("OCPoolFactory");
    const weth = await ethers.getContract("WETH");

    let remoteLzChainId = getLzChainIdByNetworkName("linea_testnet");

    let executeType = TYPE_DEPLOY_AND_MINT;
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

    // mint eth
    console.log("minting eth...")
    let amountIn = parseEther("0.0005");
    let tx = await router.omniMintETH(
        remoteLzChainId,
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
        {value: msgFee[0].add(amountIn)}
    );
    console.log(`omniMintETH tx: ${tx.hash}`);
    // 0xf7ce122d5cc01ab33fc6bf71cd4e607a5e1145d89dd77bfd364cdd42d6684168
    // https://testnet.layerzeroscan.com

    let pool = await factory.getPool(weth.address);
    console.log(`pool address: ${pool}`);
}

main().then(() => process.exit(0))