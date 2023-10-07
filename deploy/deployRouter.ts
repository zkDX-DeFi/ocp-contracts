import {DeployFunction} from 'hardhat-deploy/types';
import {getWethByChainId} from "../helpers/utils";
import {AddressZero} from "../helpers/constants";


const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, get, execute} = deployments;
    const {owner} = await getNamedAccounts();
    const chainId = await getChainId();

    console.log(`>> deploying OCPRouter...`);

    const OCPPoolFactory = await get("OCPoolFactory");
    const OCPTokenManager = await get("OCPOmniTokenManager");
    // const wethAddress = await getWethByChainId(chainId);
    const OCPBridge = await get("OCPBridge");

    const OCPRouter = await deploy('OCPRouter', {
        from: owner,
        args: [OCPPoolFactory.address, OCPTokenManager.address, OCPBridge.address, AddressZero],
        log: true
    });

    await execute('OCPBridge', {from: owner, log: true}, "updateRouter", OCPRouter.address);
    // await execute('OCPoolFactory', {from: owner, log: true}, "updateRouter", OCPRouter.address);
    // await execute('OCPTokenManager', {from: owner, log: true}, "updateRouter", OCPRouter.address);
};

export default func;
func.dependencies = ['poolFactory', 'tokenManager', 'bridge'];
func.tags = ['router'];
