const { expect } = require("chai");
const hre = require("hardhat");
const { BigNumber, getSigners } = hre.ethers;
const { ZERO_ADDRESS, DAY_IN_SECONDS } = require("./consts");

describe("ASIPresale", function () {
    //setup values
    const oracleAddress = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
    const stageAmount = [
        BigNumber.from("40000000"),
        BigNumber.from("102500000"),
        BigNumber.from("175000000"),
        BigNumber.from("250000000"),
    ];
    const stagePrice = [
        BigNumber.from("15000000000000000"),
        BigNumber.from("18750000000000000"),
        BigNumber.from("21010000000000000"),
        BigNumber.from("22740000000000000"),
    ];

    async function deployASITokenFixture(creator) {
        const ASIFactory = await hre.ethers.getContractFactory("ASIToken");
        return await ASIFactory.connect(creator).deploy(250000000, 500000000);
    }

    async function deployUSDTStubFixture(creator) {
        const USDTFactory = await hre.ethers.getContractFactory("USDTStub");
        return await USDTFactory.connect(creator).deploy(500000000);
    }

    it("should be correctly deployed", async function () {
        //setup values
        const saleStartTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
        const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS * 2;

        const [creator] = await getSigners();

        //Deploy necessary contracts
        const ASI = await deployASITokenFixture(creator);
        const USDT = await deployUSDTStubFixture(creator);

        //Deploy contract
        const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
        const presale = presaleFactory
            .connect(creator)
            .deploy(ASI.address, oracleAddress, USDT.address, saleStartTime, saleEndTime, stageAmount, stagePrice);

        //Assert deploy was successful
        await expect(presale).not.to.be.reverted;
        expect((await presale).address).not.equal(ZERO_ADDRESS);
    });

    it("should be reverted if oracle address is zero address", async function () {
        //setup values
        const saleStartTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
        const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS * 2;

        const [creator] = await getSigners();

        //Deploy necessary contracts
        const ASI = await deployASITokenFixture(creator);
        const USDT = await deployUSDTStubFixture(creator);

        //Deploy contract
        const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
        const presale = presaleFactory
            .connect(creator)
            .deploy(ASI.address, ZERO_ADDRESS, USDT.address, saleStartTime, saleEndTime, stageAmount, stagePrice);

        //Assert was reverted
        await expect(presale).to.be.rejectedWith("Zero aggregator address");
    });

    it("should be reverted if USDT address is zero address", async function () {
        //setup values
        const saleStartTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
        const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS * 2;

        const [creator] = await getSigners();

        //Deploy necessary contracts
        const ASI = await deployASITokenFixture(creator);

        //Deploy contract
        const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
        const presale = presaleFactory
            .connect(creator)
            .deploy(ASI.address, oracleAddress, ZERO_ADDRESS, saleStartTime, saleEndTime, stageAmount, stagePrice);

        //Assert was reverted
        await expect(presale).to.be.rejectedWith("Zero USDT address");
    });

    it("should be reverted if sale token address is zero address", async function () {
        //setup values
        const saleStartTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
        const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS * 2;

        const [creator] = await getSigners();

        //Deploy necessary contracts
        const USDT = await deployUSDTStubFixture(creator);

        //Deploy contract
        const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
        const presale = presaleFactory
            .connect(creator)
            .deploy(ZERO_ADDRESS, oracleAddress, USDT.address, saleStartTime, saleEndTime, stageAmount, stagePrice);

        //Assert was reverted
        await expect(presale).to.be.rejectedWith("Zero sale token address");
    });

    it("should be reverted if saleEndTime less than saleStartTime", async function () {
        //setup values
        const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
        const saleStartTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS * 2;

        const [creator] = await getSigners();

        //Deploy necessary contracts
        const ASI = await deployASITokenFixture(creator);
        const USDT = await deployUSDTStubFixture(creator);

        //Deploy contract
        const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
        const presale = presaleFactory
            .connect(creator)
            .deploy(ASI.address, oracleAddress, USDT.address, saleStartTime, saleEndTime, stageAmount, stagePrice);

        //Assert was reverted
        await expect(presale).to.be.rejectedWith("Invalid time");
    });

    it("should be reverted if saleStartTime is in past", async function () {
        //setup values
        const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
        const saleStartTime = Math.floor(new Date().getTime() / 1000) - DAY_IN_SECONDS * 2;

        const [creator] = await getSigners();

        //Deploy necessary contracts
        const ASI = await deployASITokenFixture(creator);
        const USDT = await deployUSDTStubFixture(creator);

        //Deploy contract
        const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
        const presale = presaleFactory
            .connect(creator)
            .deploy(ASI.address, oracleAddress, USDT.address, saleStartTime, saleEndTime, stageAmount, stagePrice);

        //Assert was reverted
        await expect(presale).to.be.rejectedWith("Invalid time");
    });

    it("should emit SaleStartTimeUpdated", async function () {
        //setup values
        const saleStartTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
        const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS * 2;

        const [creator] = await getSigners();

        //Deploy necessary contracts
        const ASI = await deployASITokenFixture(creator);
        const USDT = await deployUSDTStubFixture(creator);

        //Deploy contract
        const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
        const presale = presaleFactory
            .connect(creator)
            .deploy(ASI.address, oracleAddress, USDT.address, saleStartTime, saleEndTime, stageAmount, stagePrice);

        //Assert deploy was successful
        await expect(presale).not.to.be.reverted;
        expect((await presale).address).not.equal(ZERO_ADDRESS);

        //Assert SaleStartTimeUpdated event was emitted
        expect(presale)
            .to.emit(await presale, "SaleStartTimeUpdated")
            .withArgs(saleStartTime);
    });

    it("should emit SaleEndTimeUpdated", async function () {
        //setup values
        const saleStartTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
        const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS * 2;

        const [creator] = await getSigners();

        //Deploy necessary contracts
        const ASI = await deployASITokenFixture(creator);
        const USDT = await deployUSDTStubFixture(creator);

        //Deploy contract
        const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
        const presale = presaleFactory
            .connect(creator)
            .deploy(ASI.address, oracleAddress, USDT.address, saleStartTime, saleEndTime, stageAmount, stagePrice);

        //Assert deploy was successful
        await expect(presale).not.to.be.reverted;
        expect((await presale).address).not.equal(ZERO_ADDRESS);

        //Assert SaleEndTimeUpdated event was emitted
        expect(presale)
            .to.emit(await presale, "SaleEndTimeUpdated")
            .withArgs(saleEndTime);
    });

    it("should have correct values after deploy", async function () {
        //setup values
        const saleStartTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
        const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS * 2;

        const [creator] = await getSigners();

        //Deploy necessary contracts
        const ASI = await deployASITokenFixture(creator);
        const USDT = await deployUSDTStubFixture(creator);

        //Deploy contract
        const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
        const presaleTx = presaleFactory
            .connect(creator)
            .deploy(ASI.address, oracleAddress, USDT.address, saleStartTime, saleEndTime, stageAmount, stagePrice);

        //Assert deploy was successful
        await expect(presaleTx).not.to.be.reverted;
        expect((await presaleTx).address).not.equal(ZERO_ADDRESS);

        const presale = await presaleTx;

        //Get contract values
        const presaleTotalTokensSold = await presale.totalTokensSold();
        const presaleClaimStartTime = await presale.claimStartTime();
        const presaleSaleStartTime = await presale.saleStartTime();
        const presaleSaleEndTime = await presale.saleEndTime();
        const presaleCurrentStage = await presale.currentStage();
        const presaleUSDTToken = await presale.USDTToken();
        const presaleOracle = await presale.oracle();

        //Assert deploy was successful
        await expect(presale).not.to.be.reverted;
        expect((await presale).address).not.equal(ZERO_ADDRESS);

        //Assert contract values are equal to expected
        expect(presaleTotalTokensSold).to.equal(0);
        expect(presaleClaimStartTime).to.equal(0);
        expect(presaleSaleStartTime).to.equal(saleStartTime);
        expect(presaleSaleEndTime).to.equal(saleEndTime);
        expect(presaleCurrentStage).to.equal(0);
        expect(presaleUSDTToken).to.equal(USDT.address);
        expect(presaleOracle).to.equal(oracleAddress);
    });

    describe("Token functions", function () {
        async function deployPresaleFixture() {
            //setup values
            const saleStartTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS;
            const saleEndTime = Math.floor(new Date().getTime() / 1000) + DAY_IN_SECONDS * 2;
            const stageAmount = [
                BigNumber.from("40000000"),
                BigNumber.from("102500000"),
                BigNumber.from("175000000"),
                BigNumber.from("250000000"),
            ];
            const stagePrice = [
                BigNumber.from("15000000000000000"),
                BigNumber.from("18750000000000000"),
                BigNumber.from("21010000000000000"),
                BigNumber.from("22740000000000000"),
            ];

            const [creator, presaleOwner, Alice] = await getSigners();

            //Deploy necessary contracts
            const ASI = await deployASITokenFixture(creator);
            const USDT = await deployUSDTStubFixture(creator);

            //Deploy presale contract
            const presaleFactory = await hre.ethers.getContractFactory("ASIPresale");
            const presale = await presaleFactory
                .connect(creator)
                .deploy(ASI.address, oracleAddress, USDT.address, saleStartTime, saleEndTime, stageAmount, stagePrice);

            //Transfer presale contract ownership to specified address
            await presale.transferOwnership(presaleOwner.address);

            return {
                USDT,
                ASI,
                presale,
                saleStartTime,
                saleEndTime,
                users: {
                    creator,
                    presaleOwner,
                    Alice,
                },
            };
        }

        describe("'pause' function", function () {
            it("should pause contract if called by the owner", async function () {
                //Set values
                const { presale, users } = await deployPresaleFixture();

                //Get paused status before transaction
                const pauseStatusBefore = await presale.paused();

                //Pause contract
                const pauseTx = presale.connect(users.presaleOwner).pause();

                //Assert transaction was successful
                await expect(pauseTx).not.to.be.reverted;

                //Get paused status after transaction
                const pauseStatusAfter = await presale.paused();

                //Assert transaction results
                expect(pauseStatusBefore).to.equal(false);
                expect(pauseStatusAfter).to.equal(true);
            });

            it("should revert if called not by the owner", async function () {
                //Set values
                const { presale } = await deployPresaleFixture();

                //Pause contract
                const pauseTx = presale.pause();

                //Assert transaction is reverted
                await expect(pauseTx).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("should revert if contract already paused", async function () {
                //Set values
                const { presale, users } = await deployPresaleFixture();

                //Preliminarily pause contract
                await presale.connect(users.presaleOwner).pause();

                //Pause contract
                const pauseTx = presale.connect(users.presaleOwner).pause();

                //Assert transaction is reverted
                await expect(pauseTx).to.be.revertedWith("Pausable: paused");
            });
        });

        describe("'unpause' function", function () {
            it("should unpause contract if called by the owner", async function () {
                //Set values
                const { presale, users } = await deployPresaleFixture();

                //Preliminarily pause contract
                await presale.connect(users.presaleOwner).pause();

                //Get paused status before transaction
                const pauseStatusBefore = await presale.paused();

                //Unpause contract
                const pauseTx = presale.connect(users.presaleOwner).unpause();

                //Assert transaction was successful
                await expect(pauseTx).not.to.be.reverted;

                //Get paused status after transaction
                const pauseStatusAfter = await presale.paused();

                //Assert transaction results
                expect(pauseStatusBefore).to.equal(true);
                expect(pauseStatusAfter).to.equal(false);
            });

            it("should revert if called not by the owner", async function () {
                //Set values
                const { presale } = await deployPresaleFixture();

                //Pause contract
                const pauseTx = presale.unpause();

                //Assert transaction is reverted
                await expect(pauseTx).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("should revert if contract already unpaused", async function () {
                //Set values
                const { presale, users } = await deployPresaleFixture();

                //Unpause contract
                const unpauseTx = presale.connect(users.presaleOwner).unpause();

                //Assert transaction is reverted
                await expect(unpauseTx).to.be.revertedWith("Pausable: not paused");
            });
        });
    });
});
