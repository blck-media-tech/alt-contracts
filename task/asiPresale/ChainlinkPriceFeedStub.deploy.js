const { task } = require("hardhat/config");

task("deploy:mock:ChainlinkPriceFeed", "Deploys stub ChainlinkPriceFeed contract token").setAction(
    async (taskArgs, hre) => {
        const ChainlinkPriceFeedStubArguments = {};

        await hre.run("clean&compile");

        const ChainlinkPriceFeedStubAddress = await hre.run("deployment", {
            network: hre.network.name,
            arguments: ChainlinkPriceFeedStubArguments,
            contract: "ChainlinkPriceFeedMock",
        });

        await hre.run("verification", {
            contract: "ChainlinkPriceFeedMock",
            address: ChainlinkPriceFeedStubAddress,
            constructorArguments: Object.values(ChainlinkPriceFeedStubArguments),
        });
    }
);
