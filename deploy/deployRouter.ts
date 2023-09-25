import {DeployFunction} from 'hardhat-deploy/types';
import {getWethByChainId} from "../helpers/utils";


const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, get, execute} = deployments;
    const {owner} = await getNamedAccounts();
    const chainId = await getChainId();

    console.log(`>> deploying OCPRouter...`);

    const OCPPoolFactory = await get("OCPPoolFactory");
    const OCPTokenManager = await get("OCPTokenManager");
    const wethAddress = await getWethByChainId(chainId);

    const OCPRouter = await deploy('OCPRouter', {
        from: owner,
        args: [OCPPoolFactory.address, OCPTokenManager.address, wethAddress],
        log: true
    });

    await execute('OCPPoolFactory', {from: owner, log: true}, "updateRouter", OCPRouter.address);
    await execute('OCPTokenManager', {from: owner, log: true}, "updateRouter", OCPRouter.address);
};

export default func;
func.dependencies = ['poolFactory', 'tokenManager'];
func.tags = ['router'];
