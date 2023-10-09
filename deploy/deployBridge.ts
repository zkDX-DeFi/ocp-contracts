import {DeployFunction} from 'hardhat-deploy/types';
import {getLzEndPointByChainId} from "../helpers/utils";
const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {
    const {deploy} = deployments;
    const {owner} = await getNamedAccounts();
    const chainId = await getChainId();
    console.log(`>> deploying OCPBridge...`);

    const lzEndpoint = await getLzEndPointByChainId(chainId);
    await deploy('OCPBridge', {
        from: owner,
        args: [lzEndpoint],
        log: true,
        waitConfirmations: 1,
    });
};
export default func;
func.tags = ['bridge'];
