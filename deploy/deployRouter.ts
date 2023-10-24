import {DeployFunction} from 'hardhat-deploy/types';
import {getWethByChainId} from "../helpers/utils";

const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {
    const {deploy, get, execute} = deployments;
    const {owner} = await getNamedAccounts();
    console.log(`>> deploying OCPRouter...`);

    const OCPPoolFactory = await get("OCPoolFactory");
    const OCPTokenManager = await get("OCPOmniTokenManager");
    const OCPBridge = await get("OCPBridge");

    const chainId = await getChainId();
    const wethAddress = await getWethByChainId(chainId);
    const OCPRouter = await deploy('OCPRouter', {
        from: owner,
        args: [OCPPoolFactory.address, OCPTokenManager.address, OCPBridge.address, wethAddress],
        log: true,
        waitConfirmations: 1,
    });

    // update router
    await execute('OCPBridge', {from: owner, log: true, waitConfirmations: 1}, "updateRouter", OCPRouter.address);
    await execute('OCPOmniTokenManager', {
        from: owner,
        log: true,
        waitConfirmations: 1
    }, "updateRouter", OCPRouter.address);
};

export default func;
func.dependencies = ['poolFactory', 'tokenManager', 'bridge'];
func.tags = ['router'];
