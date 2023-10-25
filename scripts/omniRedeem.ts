import {ethers, getNamedAccounts} from "hardhat";
import {TYPE_REDEEM} from "../helpers/constants";
import {formatEther, parseEther} from "ethers/lib/utils";
import {getLzChainIdByNetworkName} from "../helpers/lzUtils";

async function main() {

    const {owner} = await getNamedAccounts();
    let tokenManager = await ethers.getContract("OCPOmniTokenManager")
    let redeemToken = "WETH";

    let list = await tokenManager.getOmniTokenList();
    let omniTokenAddr = "";
    for (let i = 0; i < list.length; i++) {
        let token = await ethers.getContractAt("Token", list[i]);
        let name = await token.name();
        if (name == redeemToken) {
            omniTokenAddr = token.address;
            break;
        }
    }
    if (omniTokenAddr == "") {
        console.log("token not found");
        return;
    }

    const router = await ethers.getContract("OCPRouter");
    let remoteLzChainId = getLzChainIdByNetworkName("zksync_testnet");

    let msgFee = await router.quoteLayerZeroFee(
        remoteLzChainId,
        TYPE_REDEEM,
        "0x",
        {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: '0x'
        });
    console.log(`Msg Fee: ${formatEther(msgFee[0])}`);

    // redeem
    console.log("redeeming...")
    let tx = await router.omniRedeem(
        remoteLzChainId,
        omniTokenAddr,
        parseEther("0.0001"),
        owner,
        owner,
        "0x",
        ({
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: '0x'
        }),
        {value: msgFee[0]}
    );
    console.log(`omniReem tx: ${tx.hash}`);

}

main().then(() => process.exit(0))