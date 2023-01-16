const hre = require("hardhat");

describe("ASIPresale", function () {
    async function deployASITokenFixture(creator) {
        const ASIFactory = await hre.ethers.getContractFactory("ASIToken");
        return await ASIFactory.connect(creator).deploy(250000000, 500000000);
    }

    async function deployUSDTStubFixture(creator) {
        const USDTFactory = await hre.ethers.getContractFactory("USDTStub");
        return await USDTFactory.connect(creator).deploy(500000000);
    }
});
