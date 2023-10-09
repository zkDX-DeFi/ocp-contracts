import {DeployFunction} from 'hardhat-deploy/types';
import {
    AddressZero,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2,
    DEFAULT_GAS_LIMIT_1,
    DEFAULT_GAS_LIMIT_2,
    DEFAULT_GAS_LIMIT_3
} from "../../helpers/constants";
import {getLzEndPointByChainId} from "../../helpers/utils";
import {ethers} from "hardhat";

const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, execute, get} = deployments;
    const {owner} = await getNamedAccounts();
    const OCPBridge = await get("OCPBridge");
    const lzEndpoint1 = await get("LZEndpoint");

    console.log(`>> deploying same on local chain 2 (test only) ...`);

    const OCPPoolFactory2 = await deploy('OCPoolFactory2', {
        contract: 'OCPoolFactory',
        from: owner,
        args: [],
        log: true
    });

    const OCPTokenManager2 = await deploy('OCPOmniTokenManager2', {
        contract: "OCPOmniTokenManager",
        from: owner,
        args: [],
        log: true
    });

    let lzEndpoint2Addr = await getLzEndPointByChainId(CHAIN_ID_LOCAL2);
    const OCPBridge2 = await deploy('OCPBridge2', {
        contract: 'OCPBridge',
        from: owner,
        args: [lzEndpoint2Addr],
        log: true
    });

    // const wethAddress2 = await getWethByChainId(CHAIN_ID_LOCAL2);
    const OCPRouter2 = await deploy('OCPRouter2', {
        contract: 'OCPRouter',
        from: owner,
        args: [OCPPoolFactory2.address, OCPTokenManager2.address, OCPBridge2.address, AddressZero],
        log: true
    });

    await execute('OCPBridge2', {from: owner, log: true}, "updateRouter", OCPRouter2.address);

    // set remote
    let path1 = ethers.utils.solidityPack(['address', 'address'], [OCPBridge2.address, OCPBridge.address])
    let path2 = ethers.utils.solidityPack(['address', 'address'], [OCPBridge.address, OCPBridge2.address])
    await execute('OCPBridge', {from: owner}, "setTrustedRemote", CHAIN_ID_LOCAL2, path1);
    await execute('OCPBridge2', {from: owner}, "setTrustedRemote", CHAIN_ID_LOCAL, path2);

    // update gasLookups
    await execute('OCPBridge', {from: owner}, "updateGasLookups", [CHAIN_ID_LOCAL2, CHAIN_ID_LOCAL2, CHAIN_ID_LOCAL2],
        [1, 2, 3], [DEFAULT_GAS_LIMIT_1, DEFAULT_GAS_LIMIT_2, DEFAULT_GAS_LIMIT_3]);
    await execute('OCPBridge2', {from: owner}, "updateGasLookups", [CHAIN_ID_LOCAL, CHAIN_ID_LOCAL, CHAIN_ID_LOCAL],
        [1, 2, 3], [DEFAULT_GAS_LIMIT_1, DEFAULT_GAS_LIMIT_2, DEFAULT_GAS_LIMIT_3]);

    // set dest endpoint (only local)
    await execute('LZEndpoint', {from: owner}, "setDestLzEndpoint", OCPBridge2.address, lzEndpoint2Addr);
    await execute('LZEndpoint2', {from: owner,}, "setDestLzEndpoint", OCPBridge.address, lzEndpoint1.address);
};
export default func;
func.tags = ['localChain2'];
