import {ethers, getChainId} from "hardhat";
import {getDeploymentAddresses, getLzChainIdByNetworkName} from "../helpers/lzUtils";
import {getLzEndPointByChainId} from "../helpers/utils";
import {HASH_256_ZERO} from "../helpers/constants";

async function main() {

    const failedTx = "0x63d235759b5aef00cec827f6604b7b4cb72fc3361de973aeee7cc936eafef866";
    const srcNetwork = "zksync_testnet";

    const chainId = await getChainId();
    let lzEndpointAddr = await getLzEndPointByChainId(chainId)
    let lzEndpoint = await ethers.getContractAt("LZEndpoint", lzEndpointAddr);
    let srcLzChainId = getLzChainIdByNetworkName(srcNetwork);

    let bridge = await ethers.getContract("OCPBridge");
    let remoteAddress = getDeploymentAddresses(srcNetwork)["OCPBridge"];
    let path = ethers.utils.solidityPack(['address', 'address'], [remoteAddress, bridge.address]);
    let hasStoredPayload = await lzEndpoint.hasStoredPayload(srcLzChainId, path);

    if (hasStoredPayload) {
        let txReceipt = await ethers.provider.getTransactionReceipt(failedTx);
        let events = lzEndpoint.interface.parseLog(txReceipt.logs[1]);
        await lzEndpoint.retryPayload(srcLzChainId, path, events.args.payload);
    }

    let failedMsg = await bridge.failedMessages(srcLzChainId, path, 1);
    if (failedMsg != HASH_256_ZERO) {
        let txReceipt = await ethers.provider.getTransactionReceipt(failedTx);
        let events = bridge.interface.parseLog(txReceipt.logs[1]);
        // console.log(events);
        await bridge.retryMessage(srcLzChainId, path, 1, events.args._payload, {gasLimit: 1000000});
    }

}

main().then(() => process.exit(0))