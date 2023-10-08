import {task} from "hardhat/config";
import {getDeploymentAddresses, getLzChainIdByNetworkName} from "../helpers/lzUtils";

task("setupBridge").addParam("targetNetwork").setAction(async function (taskArgs, hre) {

    let targetNetwork = taskArgs.targetNetwork;

    // get local and remote
    let localContract, remoteAddress;
    if (targetNetwork == "local_chain2") {
        localContract = await hre.ethers.getContract("OCPBridge");
        remoteAddress = (await hre.ethers.getContract("OCPBridge2")).address;
    } else if (targetNetwork == "local_chain1") {
        localContract = await hre.ethers.getContract("OCPBridge2");
        remoteAddress = (await hre.ethers.getContract("OCPBridge")).address;
    } else {
        localContract = await hre.ethers.getContract("OCPBridge");
        remoteAddress = getDeploymentAddresses(targetNetwork)["OCPBridge"];
    }

    // set trusted remote
    let remoteLzChainId = getLzChainIdByNetworkName(targetNetwork);
    let remoteAndLocal = hre.ethers.utils.solidityPack(['address', 'address'], [remoteAddress, localContract.address])
    let isTrustedRemoteSet = await localContract.isTrustedRemote(remoteLzChainId, remoteAndLocal);
    if (!isTrustedRemoteSet) {
        try {
            await (await localContract.setTrustedRemote(remoteLzChainId, remoteAndLocal)).wait()
            console.log(`✅ [${hre.network.name}] setTrustedRemote(${remoteLzChainId}, ${remoteAndLocal})`)
        } catch (e) {
            if (e.error.message.includes("The chainId + address is already trusted")) {
                console.log("*source already set*")
            } else {
                console.log(`❌ [${hre.network.name}] setTrustedRemote(${remoteLzChainId}, ${remoteAndLocal})`)
            }
        }
    } else {
        console.log("*source already set*")
    }

    // set gasLookup
    await localContract.updateGasLookup([remoteLzChainId, remoteLzChainId, remoteLzChainId], [1, 2, 3], [4500000, 300000, 300000]);
});
