import {task} from "hardhat/config";

task("deploy-ocp",).setAction(async function (taskArgs, hre) {

    await hre.run("deploy", {tags: "tokenManager"});
    await hre.run("deploy", {tags: "poolFactory"});
    await hre.run("deploy", {tags: "bridge"});
    await hre.run("deploy", {tags: "router"});

});


