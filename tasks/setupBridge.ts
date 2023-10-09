import {task} from "hardhat/config";
import {getDeploymentAddresses, getLzChainIdByNetworkName} from "../helpers/lzUtils";
import {DEFAULT_GAS_LIMIT_1, DEFAULT_GAS_LIMIT_2, DEFAULT_GAS_LIMIT_3} from "../helpers/constants";

task("setupBridge").addParam("targetNetworks").setAction(async function (taskArgs, hre) {

    let targetNetworks = taskArgs.targetNetworks;
    let networks = targetNetworks.split(",");

    let bridge = await hre.ethers.getContract("OCPBridge");
    let chainIds = [], paths = [];
    for (let i = 0; i < networks.length; i++) {
        let network = networks[i];
        chainIds.push(getLzChainIdByNetworkName(networks[i]));

        let remoteAddress = getDeploymentAddresses(network)["OCPBridge"];
        let path = hre.ethers.utils.solidityPack(['address', 'address'], [remoteAddress, bridge.address])
        paths.push(path);
    }

    try {
        // update trusted remotes
        await (await bridge.updateTrustedRemotes(chainIds, paths)).wait()
        console.log(`✅ [${hre.network.name}] updateTrustedRemotes(${networks})`)
    } catch (e) {
        console.log('update remotes error:', e);
    }

    // update gasLookups
    let gasParams = buildGasParams(chainIds);
    console.log(gasParams)
    await bridge.updateGasLookups(gasParams.chainIds, gasParams.types, gasParams.gases);
});


function buildGasParams(chainIds: number[]) {

    let baseTypes = [1, 2, 3];
    let baseGases = [DEFAULT_GAS_LIMIT_1, DEFAULT_GAS_LIMIT_2, DEFAULT_GAS_LIMIT_3];

    let result: any = {
        chainIds: [],
        types: [],
        gases: []
    }

    chainIds.forEach(chainId => {
        for (let i = 0; i < baseTypes.length; i++) {
            result.chainIds.push(chainId);
            result.types = baseTypes.concat(baseTypes)
            result.gases = baseGases.concat(baseGases)
        }
    })
    return result;
}