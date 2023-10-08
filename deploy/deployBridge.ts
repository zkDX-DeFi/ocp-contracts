import {DeployFunction} from 'hardhat-deploy/types';
import {getLzEndPointByChainId} from "../helpers/utils";
import {AddressZero} from "../helpers/constants";

const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, get, execute} = deployments;
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
