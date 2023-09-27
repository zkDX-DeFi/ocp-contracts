import {DeployFunction} from 'hardhat-deploy/types';


const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, get, execute} = deployments;
    const {owner} = await getNamedAccounts();

    console.log(`>> deploying OCPTokenManager...`);
    const OCPTokenFactory = await get('OCPOmniTokenFactory');
    const OCPTokenManager = await deploy('OCPTokenManager', {
        from: owner,
        args: [OCPTokenFactory.address],
        log: true
    });

    await execute('OCPOmniTokenFactory', {from: owner, log: true}, "updateTokenManager", OCPTokenManager.address);
};
export default func;
func.dependencies = ['tokenFactory']
func.tags = ['tokenManager'];
