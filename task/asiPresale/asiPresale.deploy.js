const { task } = require("hardhat/config");
const CONFIG = require("../arguments.deploy.js");

task("deploy:ASIPresale", "Deploys ASI presale contract").setAction(async (taskArgs, hre) => {
    const { ASIPresale: ASIPresaleArguments } = CONFIG[hre.network.name];

    await hre.run("clean&compile");

    const ASIPresaleAddress = await hre.run("deployment", {
        network: hre.network.name,
        arguments: ASIPresaleArguments,
        contract: "ASIPresale",
    });

    await hre.run("verification", {
        contract: "ASIPresale",
        address: ASIPresaleAddress,
        constructorArguments: Object.values(ASIPresaleArguments),
    });
});
