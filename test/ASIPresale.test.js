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
        let currentTimeCorrector = 0;
        async function deployPresaleFixture() {
            //setup values
            const saleStartTime = Math.floor(new Date().getTime() / 1000) + currentTimeCorrector + DAY_IN_SECONDS;
            const saleEndTime = Math.floor(new Date().getTime() / 1000) + currentTimeCorrector + DAY_IN_SECONDS * 2;
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
                stageAmount,
                stagePrice,
                users: {
                    creator,
                    presaleOwner,
                    Alice,
                },
            };
        }

        async function purchaseTokensFixture(contract, signer, amount) {
            const priceInWei = await contract.connect(signer).calculateWeiPrice(amount);
            await contract.connect(signer).buyWithEth(amount, { value: priceInWei });
        }

        async function timeTravelFixture(targetTime) {
            const block = await hre.ethers.provider.getBlock("latest");
            await hre.network.provider.send("evm_setNextBlockTimestamp", [targetTime]);
            currentTimeCorrector = targetTime - block.timestamp;
        }

        async function startClaimFixture(presale, ASI, creator, presaleOwner, claimStartTime, tokensAmount) {
            await ASI.connect(creator).transfer(presale.address, tokensAmount);
            await presale.connect(presaleOwner).startClaim(claimStartTime, tokensAmount);
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

        describe("'changeSaleStartTime' function", function () {
            it("should set sales start time", async function () {
                //Set values
                const { presale, users } = await deployPresaleFixture();

                const saleStartTimeModifier = DAY_IN_SECONDS;

                //Get sale start time before transaction
                const saleStartTimeBefore = await presale.saleStartTime();

                //Change sale start time
                const changeSaleStartTimeTx = presale
                    .connect(users.presaleOwner)
                    .changeSaleStartTime(saleStartTimeBefore.add(saleStartTimeModifier));

                //Assert transaction was successful
                await expect(changeSaleStartTimeTx).not.to.be.reverted;

                //Get sales start time after transaction
                const saleStartTimeAfter = await presale.saleStartTime();

                //Assert sale start time after transaction with expected
                expect(saleStartTimeAfter).to.equal(saleStartTimeBefore.add(saleStartTimeModifier));
            });

            it("should revert if called not by the owner", async function () {
                //Set values
                const { presale } = await deployPresaleFixture();

                //Change sale start time
                const changeSaleStartTimeTx = presale.changeSaleStartTime(0);

                //Assert transaction is reverted
                await expect(changeSaleStartTimeTx).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("should emit SaleStartTimeUpdated event", async function () {
                //Set values
                const { presale, users } = await deployPresaleFixture();

                const saleStartTimeModifier = DAY_IN_SECONDS;

                //Get sale start time before transaction
                const saleStartTimeBefore = await presale.saleStartTime();

                //Change sale start time
                const changeSaleStartTimeTx = presale
                    .connect(users.presaleOwner)
                    .changeSaleStartTime(saleStartTimeBefore.add(saleStartTimeModifier));

                //Assert transaction was successful
                await expect(changeSaleStartTimeTx).not.to.be.reverted;

                //Assert SaleStartTimeUpdated event was emitted
                expect(changeSaleStartTimeTx)
                    .to.emit(presale, "SaleStartTimeUpdated")
                    .withArgs(saleStartTimeBefore.add(saleStartTimeModifier));
            });
        });

        describe("'changeSaleEndTime' function", function () {
            it("should set sales start time", async function () {
                //Set values
                const { presale, users } = await deployPresaleFixture();

                const saleEndTimeModifier = DAY_IN_SECONDS;

                //Get sale end time before transaction
                const saleEndTimeBefore = await presale.saleEndTime();

                //Change sale end time
                const changeSaleEndTimeTx = presale
                    .connect(users.presaleOwner)
                    .changeSaleEndTime(saleEndTimeBefore.add(saleEndTimeModifier));

                //Assert transaction was successful
                await expect(changeSaleEndTimeTx).not.to.be.reverted;

                //Get sale end time after transaction
                const saleEndTimeAfter = await presale.saleEndTime();

                //Assert sale end time after transaction with expected
                expect(saleEndTimeAfter).to.equal(saleEndTimeBefore.add(saleEndTimeModifier));
            });

            it("should revert if called not by the owner", async function () {
                //Set values
                const { presale } = await deployPresaleFixture();

                //Change sale start time
                const changeSaleEndTimeTx = presale.changeSaleEndTime(0);

                //Assert transaction is reverted
                await expect(changeSaleEndTimeTx).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("should emit SaleStartTimeUpdated event", async function () {
                //Set values
                const { presale, users } = await deployPresaleFixture();

                const saleStartTimeModifier = DAY_IN_SECONDS;

                //Get sales start time before transaction
                const saleStartTimeBefore = await presale.saleStartTime();

                //Change sale start time
                const changeSaleStartTimeTx = presale
                    .connect(users.presaleOwner)
                    .changeSaleStartTime(saleStartTimeBefore.add(saleStartTimeModifier));

                //Assert transaction was successful
                await expect(changeSaleStartTimeTx).not.to.be.reverted;

                //Assert SaleEndTimeUpdated event was emitted
                expect(changeSaleStartTimeTx)
                    .to.emit(presale, "SaleEndTimeUpdated")
                    .withArgs(saleStartTimeBefore.add(saleStartTimeModifier));
            });
        });

        describe("'startClaim' function", function () {
            it("should set claim start time", async function () {
                //Set values
                const { presale, users, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensAmount = 100;

                //Get claim start time before transaction
                const claimStartTimeBefore = await presale.claimStartTime();

                //Transfer tokens to presale contract
                await ASI.connect(users.creator).transfer(presale.address, tokensAmount);

                //Start claim
                const startClaimTx = presale
                    .connect(users.presaleOwner)
                    .startClaim(saleEndTime + DAY_IN_SECONDS, tokensAmount);

                //Assert transaction was successful
                await expect(startClaimTx).not.to.be.reverted;

                //Get sales start time after transaction
                const claimStartTimeAfter = await presale.claimStartTime();

                //Assert claim start time after transaction with expected
                expect(claimStartTimeBefore).to.equal(0);
                expect(claimStartTimeAfter).to.equal(saleEndTime + DAY_IN_SECONDS);
            });

            it("should revert if called not by the owner", async function () {
                //Set values
                const { presale, users, ASI } = await deployPresaleFixture();
                const tokensAmount = 100;

                //Transfer tokens to presale contract
                await ASI.connect(users.creator).transfer(presale.address, tokensAmount);

                //Change claim start time
                const startClaimTx = presale.startClaim(0, tokensAmount);

                //Assert transaction is reverted
                await expect(startClaimTx).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("should revert if claim start time less than sale end time", async function () {
                //Set values
                const { presale, users, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensAmount = 100;

                //Transfer tokens to presale contract
                await ASI.connect(users.creator).transfer(presale.address, tokensAmount);

                //Start claim
                const startClaimTx = presale.connect(users.presaleOwner).startClaim(saleEndTime, tokensAmount);

                //Assert transaction was reverted
                await expect(startClaimTx).to.be.revertedWith("Invalid claim start time");
            });

            it("should revert if claim start time less than current block timestamp", async function () {
                //Set values
                const { presale, users, ASI } = await deployPresaleFixture();
                const tokensAmount = 100;

                //Transfer tokens to presale contract
                await ASI.connect(users.creator).transfer(presale.address, tokensAmount);

                //Start claim
                const startClaimTx = presale.connect(users.presaleOwner).startClaim(0, tokensAmount);

                //Assert transaction was reverted
                await expect(startClaimTx).to.be.revertedWith("Invalid claim start time");
            });

            it("should revert if claim already set", async function () {
                //Set values
                const { presale, users, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensAmount = 100;

                //Transfer tokens to presale contract
                await ASI.connect(users.creator).transfer(presale.address, tokensAmount);

                //Start claim for first time
                await presale.connect(users.presaleOwner).startClaim(saleEndTime + DAY_IN_SECONDS, tokensAmount);

                //Start claim for second time
                const startClaimTx = presale
                    .connect(users.presaleOwner)
                    .startClaim(saleEndTime + DAY_IN_SECONDS, tokensAmount);

                //Assert transaction was reverted
                await expect(startClaimTx).to.be.revertedWith("Claim already set");
            });

            it("should revert if transferred not enough tokens", async function () {
                //Set values
                const { presale, users, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensAmount = 100;

                //Transfer tokens to presale contract
                await ASI.connect(users.creator).transfer(presale.address, tokensAmount / 2);

                //Start claim
                const startClaimTx = presale
                    .connect(users.presaleOwner)
                    .startClaim(saleEndTime + DAY_IN_SECONDS, tokensAmount);

                //Assert transaction was reverted
                await expect(startClaimTx).to.be.revertedWith("Not enough balance");
            });

            it("should emit SaleStartTimeUpdated event", async function () {
                //Set values
                const { presale, users, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensAmount = 100;

                const claimStartTimeModifier = DAY_IN_SECONDS;

                //Get claim start time before transaction
                const claimStartTimeBefore = await presale.claimStartTime();

                //Transfer tokens to presale contract
                await ASI.connect(users.creator).transfer(presale.address, tokensAmount);

                //Claim start time
                const claimStartTimeTx = presale
                    .connect(users.presaleOwner)
                    .startClaim(saleEndTime + DAY_IN_SECONDS, tokensAmount);

                //Assert transaction was successful
                await expect(claimStartTimeTx).not.to.be.reverted;

                //Assert SaleEndTimeUpdated event was emitted
                expect(claimStartTimeTx)
                    .to.emit(presale, "ClaimStartTimeUpdated")
                    .withArgs(claimStartTimeBefore.add(claimStartTimeModifier));
            });

            it("should revert if passed amount of tokens less than sold amount", async function () {
                //Set values
                const { presale, users, saleEndTime, saleStartTime, ASI } = await deployPresaleFixture();
                const tokensAmount = 100;

                //Transfer tokens to presale contract
                await ASI.connect(users.creator).transfer(presale.address, tokensAmount);

                //Time travel to sales period
                await timeTravelFixture(saleStartTime + 1);

                //Purchase some tokens
                await purchaseTokensFixture(presale, users.creator, tokensAmount);

                //Start claim
                const startClaimTx = presale
                    .connect(users.presaleOwner)
                    .startClaim(saleEndTime + DAY_IN_SECONDS, tokensAmount / 2);

                //Assert transaction was reverted
                await expect(startClaimTx).to.be.revertedWith("Tokens less than sold");
            });
        });

        describe("'changeClaimStartTime' function", function () {
            it("should set claim start time", async function () {
                //Set values
                const { presale, ASI, users, saleEndTime } = await deployPresaleFixture();
                const claimStartTimeModifier = DAY_IN_SECONDS;

                //Start claim
                await startClaimFixture(
                    presale,
                    ASI,
                    users.creator,
                    users.presaleOwner,
                    saleEndTime + DAY_IN_SECONDS,
                    100
                );

                //Get claim start time before transaction
                const claimStartTimeBefore = await presale.claimStartTime();

                //Change claim start time
                const changeClaimStartTimeTx = presale
                    .connect(users.presaleOwner)
                    .changeClaimStartTime(claimStartTimeBefore.add(claimStartTimeModifier));

                //Assert transaction was successful
                await expect(changeClaimStartTimeTx).not.to.be.reverted;

                //Get claim start time after transaction
                const claimStartTimeAfter = await presale.claimStartTime();

                //Assert claim start time after transaction with expected
                expect(claimStartTimeAfter).to.equal(claimStartTimeBefore.add(claimStartTimeModifier));
            });

            it("should revert if called not by the owner", async function () {
                //Set values
                const { presale, ASI, users, saleEndTime } = await deployPresaleFixture();
                const claimStartTimeModifier = DAY_IN_SECONDS;

                //Start claim
                await startClaimFixture(
                    presale,
                    ASI,
                    users.creator,
                    users.presaleOwner,
                    saleEndTime + claimStartTimeModifier,
                    100
                );

                //Get claim start time before transaction
                const claimStartTimeBefore = await presale.claimStartTime();

                //Change claim start time
                const changeClaimStartTimeTx = presale.changeClaimStartTime(
                    claimStartTimeBefore.add(claimStartTimeModifier)
                );

                //Assert transaction is reverted
                await expect(changeClaimStartTimeTx).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("should revert if passed time is in sale period", async function () {
                //Set values
                const { presale, ASI, users, saleEndTime } = await deployPresaleFixture();

                //Start claim
                await startClaimFixture(
                    presale,
                    ASI,
                    users.creator,
                    users.presaleOwner,
                    saleEndTime + DAY_IN_SECONDS,
                    100
                );

                //Change claim start time
                const changeClaimStartTimeTx = presale.connect(users.presaleOwner).changeClaimStartTime(saleEndTime);

                //Assert transaction is reverted
                await expect(changeClaimStartTimeTx).to.be.revertedWith("Sale in progress");
            });

            it("should revert if claim is not set", async function () {
                //Set values
                const { presale, users, saleEndTime } = await deployPresaleFixture();

                //Change claim start time
                const changeClaimStartTimeTx = presale
                    .connect(users.presaleOwner)
                    .changeClaimStartTime(saleEndTime + 1);

                //Assert transaction is reverted
                await expect(changeClaimStartTimeTx).to.be.revertedWith("Initial claim data not set");
            });

            it("should emit SaleStartTimeUpdated event", async function () {
                //Set values
                const { presale, ASI, users, saleEndTime } = await deployPresaleFixture();
                const claimStartTimeModifier = DAY_IN_SECONDS;

                //Start claim
                await startClaimFixture(
                    presale,
                    ASI,
                    users.creator,
                    users.presaleOwner,
                    saleEndTime + claimStartTimeModifier,
                    100
                );

                //Get claim start time before transaction
                const claimStartTimeBefore = await presale.claimStartTime();

                //Change claim start time
                const changeClaimStartTimeTx = presale
                    .connect(users.presaleOwner)
                    .changeClaimStartTime(claimStartTimeBefore.add(claimStartTimeModifier));

                //Assert transaction was successful
                await expect(changeClaimStartTimeTx).not.to.be.reverted;

                //Assert ClaimStartTimeUpdated event was emitted
                expect(changeClaimStartTimeTx)
                    .to.emit(presale, "ClaimStartTimeUpdated")
                    .withArgs(claimStartTimeBefore.add(claimStartTimeModifier));
            });
        });

        describe("'getCurrentPrice' function", function () {
            it("should return stage price for current stage", async function () {
                //Set values
                const { presale, stagePrice } = await deployPresaleFixture();

                //Get current stage
                const stage = await presale.currentStage();

                //Get current stage price
                const getCurrentPriceTx = presale.getCurrentPrice();

                //Assert transaction was successful
                await expect(getCurrentPriceTx).not.to.be.reverted;

                //Assert current stage price with expected
                expect(await getCurrentPriceTx).to.equal(stagePrice[stage]);
            });
        });
    });
});
