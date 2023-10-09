import {DeployFunction} from 'hardhat-deploy/types';
const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {
    const {deploy} = deployments;
    const {owner} = await getNamedAccounts();

    console.log(`>> deploying OCPOmniTokenManager...`);
    await deploy('OCPOmniTokenManager', {
        from: owner,
        args: [],
        log: true,
        waitConfirmations: 1,
    });
};
export default func;
func.tags = ['tokenManager'];
