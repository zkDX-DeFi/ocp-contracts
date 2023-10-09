import {DeployFunction} from 'hardhat-deploy/types';
import {AddressZero, CHAIN_ID_LOCAL2} from "../../helpers/constants";
import {getLzEndPointByChainId, getWethByChainId} from "../../helpers/utils";
import {ethers, run} from "hardhat";

const func: DeployFunction = async function ({deployments, getNamedAccounts, network, getChainId}) {

    const {deploy, execute, get} = deployments;
    const {owner} = await getNamedAccounts();

    console.log(`>> deploying same on local chain 2 (test only) ...`);

    const OCPPoolFactory2 = await deploy('OCPoolFactory2', {
        contract: 'OCPoolFactory',
        from: owner,
        args: [],
        log: true
    });

    const OCPTokenManager2 = await deploy('OCPOmniTokenManager2', {
        contract: "OCPOmniTokenManager",
        from: owner,
        args: [],
        log: true
    });

    let lzEndpoint2Addr = await getLzEndPointByChainId(CHAIN_ID_LOCAL2);
    const OCPBridge2 = await deploy('OCPBridge2', {
        contract: 'OCPBridge',
        from: owner,
        args: [lzEndpoint2Addr],
        log: true
    });

    // const wethAddress2 = await getWethByChainId(CHAIN_ID_LOCAL2);
    const OCPRouter2 = await deploy('OCPRouter2', {
        contract: 'OCPRouter',
        from: owner,
        args: [OCPPoolFactory2.address, OCPTokenManager2.address, OCPBridge2.address, AddressZero],
        log: true
    });

    await execute('OCPBridge2', {from: owner, log: true}, "updateRouter", OCPRouter2.address);

    // set remote
    await run("setupBridge", {targetNetwork: "local_chain1"});

    console.log(`HELLO WORLD`);
    console.log(`HELLO WORLD`);
    console.log(`HELLO WORLD`);
    console.log(`HELLO WORLD`);
    console.log(`HELLO WORLD`);
    console.log(`HELLO WORLD`);
    console.log(`HELLO WORLD`);
    console.log(`HELLO WORLD`);
    console.log(`HELLO WORLD`);

    await run("setupBridge", {targetNetwork: "local_chain2"});

    // set dest endpoint (only local)
    let OCPBridge = await get("OCPBridge");
    let lzEndpoint1 = await get("LZEndpoint");
    await execute('LZEndpoint', {from: owner}, "setDestLzEndpoint", OCPBridge2.address, lzEndpoint2Addr);
    await execute('LZEndpoint2', {from: owner,}, "setDestLzEndpoint", OCPBridge.address, lzEndpoint1.address);
};
export default func;
func.tags = ['localChain2'];
