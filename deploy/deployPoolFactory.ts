import {DeployFunction} from 'hardhat-deploy/types';


const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy} = deployments;
    const {owner} = await getNamedAccounts();

    console.log(`>> deploying OCPPoolFactory...`);
    await deploy('OCPoolFactory', {
        from: owner,
        args: [],
        log: true,
        waitConfirmations: 1,
    });

};
export default func;
func.tags = ['poolFactory'];
