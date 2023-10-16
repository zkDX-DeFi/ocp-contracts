import {deployments, getNamedAccounts} from "hardhat";

async function runs() {

    const {deploy, read, execute, get} = deployments;
    const {owner} = await getNamedAccounts();

    let router = await read("OCPOmniTokenManager", "router");
    console.log(router);

    // const OCPRouter = await get("OCPRouter");
    // await execute('OCPOmniTokenManager', {from: owner, log: true}, "updateRouter", OCPRouter.address);
}

runs().then(() => process.exit(0))