import {DeployFunction} from 'hardhat-deploy/types';
import {AddressZero, CHAIN_ID_LOCAL2} from "../../helpers/constants";
import {getLzEndPointByChainId, getWethByChainId} from "../../helpers/utils";
import {run} from "hardhat";


const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, execute} = deployments;
    const {owner} = await getNamedAccounts();

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

    let lzEndpoint = await getLzEndPointByChainId(CHAIN_ID_LOCAL2);
    const OCPBridge2 = await deploy('OCPBridge2', {
        contract: 'OCPBridge',
        from: owner,
        args: [lzEndpoint],
        log: true
    });

    const wethAddress2 = await getWethByChainId(CHAIN_ID_LOCAL2);
    const OCPRouter2 = await deploy('OCPRouter2', {
        contract: 'OCPRouter',
        from: owner,
        args: [OCPPoolFactory2.address, OCPTokenManager2.address, OCPBridge2.address, wethAddress2],
        log: true
    });

    await execute('OCPBridge2', {from: owner, log: true}, "updateRouter", OCPRouter2.address);

    await run("setup-local");
};
export default func;
func.tags = ['localChain2'];
