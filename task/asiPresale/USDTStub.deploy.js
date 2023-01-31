const { task } = require("hardhat/config");
const CONFIG = require("../arguments.deploy.js");

task("deploy:mock:USDT", "Deploys stub USDT token").setAction(async (taskArgs, hre) => {
    const { USDTMock: USDTMockArguments } = CONFIG[hre.network.name];

    await hre.run("clean&compile");

    const USDTStubAddress = await hre.run("deployment", {
        network: hre.network.name,
        arguments: USDTMockArguments,
        contract: "USDTMock",
    });

    await hre.run("verification", {
        contract: "USDTMock",
        address: USDTStubAddress,
        constructorArguments: Object.values(USDTMockArguments),
    });
});
