const { task } = require("hardhat/config");
const CONFIG = require("../arguments.deploy.js");

task("deploy:ASIToken", "Deploys ASI token").setAction(async (taskArgs, hre) => {
    const { ASIToken: ASITokenArguments } = CONFIG[hre.network.name];

    await hre.run("clean&compile");

    const ASITokenAddress = await hre.run("deployment", {
        network: hre.network.name,
        arguments: ASITokenArguments,
        contract: "ASIToken",
    });

    await hre.run("verification", {
        contract: "ASIToken",
        address: ASITokenAddress,
        constructorArguments: Object.values(ASITokenArguments),
    });
});
