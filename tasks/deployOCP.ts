import {task} from "hardhat/config";
import {formatEther} from "ethers/lib/utils";

task("deployOCP").setAction(async function (taskArgs, hre) {

    let owner = (await hre.ethers.getSigners())[0].address;
    let balance = await hre.ethers.provider.getBalance(owner);
    console.log(`>>> start deploying from ${owner}, balance: ${formatEther(balance)}`);

    await hre.run("deploy", {tags: "router"});

    let balanceAfter = await hre.ethers.provider.getBalance(owner);
    console.log(`>>> finished. cost: ${formatEther(balance.sub(balanceAfter))} E`);
});


