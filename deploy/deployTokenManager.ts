import {DeployFunction} from 'hardhat-deploy/types';
import {AddressZero} from "../helpers/constants";


const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, get, execute} = deployments;
    const {owner} = await getNamedAccounts();

    console.log(`>> deploying OCPOmniTokenManager...`);
    await deploy('OCPOmniTokenManager', {
        from: owner,
        args: [],
        log: true
    });

    await deploy('MockTM', {
        from: owner,
        args: [AddressZero],
        log: true
    });

};
export default func;
func.tags = ['tokenManager'];
