import {DeployFunction} from 'hardhat-deploy/types';
import {AddressZero, CHAIN_ID_LOCAL2} from "../../helpers/constants";
import {getLzEndPointByChainId, getWethByChainId} from "../../helpers/utils";
import {run} from "hardhat";


const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, execute} = deployments;
    const {owner} = await getNamedAccounts();

    console.log(`>> deploying same on local chain 2 (test only) ...`);

    await deploy('OCPoolFactory2', {
        contract: 'OCPoolFactory',
        from: owner,
        args: [],
        log: true
    });

    await deploy('OCPOmniTokenManager2', {
        contract: "OCPOmniTokenManager",
        from: owner,
        args: [],
        log: true
    });

    let lzEndpoint = await getLzEndPointByChainId(CHAIN_ID_LOCAL2);
    await deploy('OCPBridge2', {
        contract: 'OCPBridge',
        from: owner,
        args: [AddressZero, lzEndpoint],
        log: true
    });

    await run("setup-local");
};
export default func;
func.tags = ['localChain2'];
