import {DeployFunction} from 'hardhat-deploy/types';
import {getLzEndPointByChainId} from "../helpers/utils";
import {AddressZero} from "../helpers/constants";

const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, get, execute} = deployments;
    const {owner} = await getNamedAccounts();
    const chainId = await getChainId();

    console.log(`>> deploying OCPBridge...`);

    const OCPRouter = await get("OCPRouter");
    // const lzEndpoint = await getLzEndPointByChainId(chainId);
    const lzEndpoint = AddressZero;
    const OCPBridge = await deploy('OCPBridge', {
        from: owner,
        args: [OCPRouter.address, lzEndpoint],
        log: true
    });

    await execute('OCPRouter', {from: owner, log: true}, "updateBridge", OCPBridge.address);
    // await execute('OCPTokenManager', {from: owner, log: true}, "updateBridge", OCPBridge.address);
};
export default func;
func.dependencies = ['router'];
func.tags = ['bridge'];
