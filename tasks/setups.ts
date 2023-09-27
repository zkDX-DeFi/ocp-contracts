import {task} from "hardhat/config";
import {CHAIN_ID_LOCAL, CHAIN_ID_LOCAL2} from "../helpers/constants";

task("setup-local",).setAction(async function (taskArgs, hre) {
    await hre.run("setRemote", {targetContract: "OCPBridge", targetNetwork: "local_chain1"});
    await hre.run("setRemote", {targetContract: "OCPBridge", targetNetwork: "local_chain2"});

    let lzEndpoint1 = await hre.ethers.getContract("LZEndpoint");
    let lzEndpoint2 = await hre.ethers.getContract("LZEndpoint2");
    let ocpBridge1 = await hre.ethers.getContract("OCPBridge");
    let ocpBridge2 = await hre.ethers.getContract("OCPBridge2");

    // set dest endpoint (only local)
    await lzEndpoint1.setDestLzEndpoint(ocpBridge2.address, lzEndpoint2.address);
    await lzEndpoint2.setDestLzEndpoint(ocpBridge1.address, lzEndpoint1.address);

    // set gasLookup
    await ocpBridge1.updateGasLookup([CHAIN_ID_LOCAL2, CHAIN_ID_LOCAL2, CHAIN_ID_LOCAL2], [1, 2, 3], [6000000, 300000, 300000]);
    await ocpBridge2.updateGasLookup([CHAIN_ID_LOCAL, CHAIN_ID_LOCAL, CHAIN_ID_LOCAL], [1, 2, 3], [6000000, 300000, 300000]);
});

