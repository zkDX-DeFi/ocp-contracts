import {ethers, getChainId} from "hardhat";
import {getDeploymentAddresses, getLzChainIdByNetworkName} from "../helpers/lzUtils";
import {getLzEndPointByChainId} from "../helpers/utils";

async function main() {

    const failedTx = "0xbb100f6d49101e48bd48bdbec39891ed15cc27dbcfd769f71d234abdee7ec084";
    const srcNetwork = "zksync_testnet";

    const chainId = await getChainId();
    let lzEndpointAddr = await getLzEndPointByChainId(chainId)
    let lzEndpoint = await ethers.getContractAt("LZEndpoint", lzEndpointAddr);
    let srcLzChainId = getLzChainIdByNetworkName(srcNetwork);

    let bridge = await ethers.getContract("OCPBridge");
    let remoteAddress = getDeploymentAddresses(srcNetwork)["OCPBridge"];
    let path = ethers.utils.solidityPack(['address', 'address'], [remoteAddress, bridge.address]);
    let hasStoredPayload = await lzEndpoint.hasStoredPayload(srcLzChainId, path);
    console.log("hasStoredPayload:", hasStoredPayload);

    if (hasStoredPayload) {
        let txReceipt = await ethers.provider.getTransactionReceipt(failedTx);
        let events = lzEndpoint.interface.parseLog(txReceipt.logs[1]);
        await lzEndpoint.retryPayload(srcLzChainId, path, events.args.payload);
    }

}

main().then(() => process.exit(0))