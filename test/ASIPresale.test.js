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
            const block = await hre.ethers.provider.getBlock("latest");
            const saleStartTime = block.timestamp + DAY_IN_SECONDS;
            const saleEndTime = saleStartTime + DAY_IN_SECONDS;
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
            await hre.network.provider.send("evm_setNextBlockTimestamp", [targetTime]);
        }

        async function startClaimFixture(presale, ASI, creator, presaleOwner, claimStartTime, tokensAmount) {
            const valueToTransfer = BigNumber.from(tokensAmount).mul(BigNumber.from(10).pow(await ASI.decimals()));
            await ASI.connect(creator).transfer(presale.address, valueToTransfer);
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
                await ASI.connect(users.creator).transfer(
                    presale.address,
                    BigNumber.from(tokensAmount).mul(BigNumber.from(10).pow(await ASI.decimals()))
                );

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
                await ASI.connect(users.creator).transfer(
                    presale.address,
                    BigNumber.from(tokensAmount).mul(BigNumber.from(10).pow(await ASI.decimals()))
                );

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
                await ASI.connect(users.creator).transfer(
                    presale.address,
                    BigNumber.from(tokensAmount).mul(BigNumber.from(10).pow(await ASI.decimals()))
                );

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

        describe("'getTotalPresaleAmount' function", function () {
            it("should return total presale limit", async function () {
                //Set values
                const { presale, stageAmount } = await deployPresaleFixture();

                //Get total presale amount
                const getTotalPresaleAmountTx = presale.getTotalPresaleAmount();

                //Assert transaction was successful
                await expect(getTotalPresaleAmountTx).not.to.be.reverted;

                //Assert total presale amount with expected
                expect(await getTotalPresaleAmountTx).to.equal(stageAmount[stageAmount.length - 1]);
            });
        });

        describe("'totalSoldPrice' function", function () {
            it("should return total cost of sold tokens", async function () {
                //Set values
                const { presale, users, saleStartTime, stagePrice, stageAmount } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Purchase some tokens
                await purchaseTokensFixture(presale, users.creator, tokensToPurchase);

                //Get total token sold amount
                const tokensSold = await presale.totalTokensSold();

                //Calculate expected price
                let price = BigNumber.from(0);
                let tokensCalculated = 0;
                for (let i = 0; tokensSold <= stageAmount[i]; i++) {
                    const tokensForStage = Math.min(tokensSold, stageAmount[i]) - tokensCalculated;
                    price = price.add(stagePrice[i].mul(tokensForStage));
                    tokensCalculated += tokensForStage;
                }

                //Get total sold price
                const totalSoldPriceTx = presale.totalSoldPrice();

                //Assert transaction was successful
                await expect(totalSoldPriceTx).not.to.be.reverted;

                //Assert total sold price with expected
                expect(await totalSoldPriceTx).to.equal(price);
            });
        });

        describe("'buyWithEth' function", function () {
            it("should increase purchased tokens amount and transfer payment to owner", async function () {
                //Set values
                const { presale, users, saleStartTime, ASI } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Get wei price
                const weiPrice = await presale.calculateWeiPrice(tokensToPurchase);

                //Get values before transaction
                const purchaseTokensAmountBefore = await presale.purchasedTokens(users.creator.address);
                const ETHAmountBefore = await hre.ethers.provider.getBalance(users.presaleOwner.address);

                //Buy with eth
                const buyWithEthTx = presale.connect(users.creator).buyWithEth(tokensToPurchase, { value: weiPrice });

                //Assert transaction was successful
                await expect(buyWithEthTx).not.to.be.reverted;

                //Get values after transaction
                const purchaseTokensAmountAfter = await presale.purchasedTokens(users.creator.address);
                const ETHAmountAfter = await hre.ethers.provider.getBalance(users.presaleOwner.address);
                const decimals = await ASI.decimals();

                //Assert values with expected
                expect(purchaseTokensAmountAfter).to.equal(
                    purchaseTokensAmountBefore.add(BigNumber.from(10).pow(decimals).mul(tokensToPurchase))
                );
                expect(ETHAmountAfter).to.equal(ETHAmountBefore.add(weiPrice));
            });

            it("should revert if trying to buy before sales start", async function () {
                //Set values
                const { presale, users } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Get wei price
                const weiPrice = await presale.calculateWeiPrice(tokensToPurchase);

                //Buy with eth
                const buyWithEthTx = presale.connect(users.creator).buyWithEth(tokensToPurchase, { value: weiPrice });

                //Assert transaction was reverted
                await expect(buyWithEthTx).to.be.revertedWith("Invalid time for buying");
            });

            it("should revert if not enough value", async function () {
                //Set values
                const { presale, users, saleStartTime } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Get wei price
                const weiPrice = await presale.calculateWeiPrice(tokensToPurchase);

                //Buy with eth
                const buyWithEthTx = presale
                    .connect(users.creator)
                    .buyWithEth(tokensToPurchase, { value: weiPrice.sub(1) });

                //Assert transaction was reverted
                await expect(buyWithEthTx).to.be.revertedWith("Not enough wei");
            });

            it("should revert if try to buy more tokens than presale limit", async function () {
                //Set values
                const { presale, users, saleStartTime, stageAmount } = await deployPresaleFixture();
                const tokensToPurchase = stageAmount[stageAmount.length - 1];

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Get wei price
                const weiPrice = await presale.calculateWeiPrice(tokensToPurchase);

                //Buy with eth
                const buyWithEthTx = presale
                    .connect(users.creator)
                    .buyWithEth(tokensToPurchase + 1, { value: weiPrice });

                //Assert transaction was reverted
                await expect(buyWithEthTx).to.be.revertedWith("Invalid amount: pre-sale limit exceeded");
            });

            it("should revert if try to buy 0 tokens", async function () {
                //Set values
                const { presale, users, saleStartTime } = await deployPresaleFixture();
                const tokensToPurchase = 0;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Get wei price
                const weiPrice = await presale.calculateWeiPrice(tokensToPurchase);

                //Buy with eth
                const buyWithEthTx = presale.connect(users.creator).buyWithEth(tokensToPurchase, { value: weiPrice });

                //Assert transaction was reverted
                await expect(buyWithEthTx).to.be.revertedWith("Invalid amount: you should buy at least one token");
            });

            it("should emit TokensBought event", async function () {
                //Set values
                const { presale, users, saleStartTime } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Get wei price
                const weiPrice = await presale.calculateWeiPrice(tokensToPurchase);
                const USDTPrice = await presale.calculateUSDTPrice(tokensToPurchase);

                //Buy with eth
                const buyWithEthTx = presale.connect(users.creator).buyWithEth(tokensToPurchase, { value: weiPrice });

                //Assert transaction was successful
                await expect(buyWithEthTx).not.to.be.reverted;

                //Assert TokensBought event was emitted
                expect(await buyWithEthTx)
                    .to.emit(presale, "TokensBought")
                    .withArgs(users.creator.address, "ETH", tokensToPurchase, USDTPrice, weiPrice);
            });
        });

        describe("'buyWithUSDT' function", function () {
            it("should increase purchased tokens amount and transfer payment to owner", async function () {
                //Set values
                const { presale, users, saleStartTime, ASI, USDT } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Get usdt price
                const USDTPrice = await presale.calculateUSDTPrice(tokensToPurchase);

                //Add allowance to contract
                await USDT.connect(users.creator).increaseAllowance(presale.address, USDTPrice);

                //Get values before transaction
                const purchaseTokensAmountBefore = await presale.purchasedTokens(users.creator.address);
                const USDTAmountBefore = await USDT.balanceOf(users.presaleOwner.address);

                //Buy with USDT
                const buyWithUSDTTx = presale.connect(users.creator).buyWithUSDT(tokensToPurchase);

                //Assert transaction was successful
                await expect(buyWithUSDTTx).not.to.be.reverted;

                //Get values after transaction
                const purchaseTokensAmountAfter = await presale.purchasedTokens(users.creator.address);
                const USDTAmountAfter = await USDT.balanceOf(users.presaleOwner.address);
                const decimals = await ASI.decimals();

                //Assert total sold price with expected
                expect(purchaseTokensAmountAfter).to.equal(
                    purchaseTokensAmountBefore.add(BigNumber.from(10).pow(decimals).mul(tokensToPurchase))
                );
                expect(USDTAmountAfter).to.equal(USDTAmountBefore.add(USDTPrice));
            });

            it("should revert if trying to buy before sales start", async function () {
                //Set values
                const { presale, users, USDT } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Get usdt price
                const USDTPrice = await presale.calculateUSDTPrice(tokensToPurchase);

                //Add allowance to contract
                await USDT.connect(users.creator).increaseAllowance(presale.address, USDTPrice);

                //Buy with USDT
                const buyWithUSDTTx = presale.connect(users.creator).buyWithUSDT(tokensToPurchase);

                //Assert transaction was reverted
                await expect(buyWithUSDTTx).to.be.revertedWith("Invalid time for buying");
            });

            it("should revert if not enough allowance", async function () {
                //Set values
                const { presale, users, saleStartTime } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Buy with USDT
                const buyWithUSDTTx = presale.connect(users.creator).buyWithUSDT(tokensToPurchase);

                //Assert transaction was reverted
                await expect(buyWithUSDTTx).to.be.revertedWith("Make sure to add enough allowance");
            });

            it("should revert if try to buy more tokens than presale limit", async function () {
                //Set values
                const { presale, users, saleStartTime, stageAmount, USDT } = await deployPresaleFixture();
                const tokensToPurchase = stageAmount[stageAmount.length - 1];

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Get usdt price
                const USDTPrice = await presale.calculateUSDTPrice(tokensToPurchase);

                //Add allowance to contract
                await USDT.connect(users.creator).increaseAllowance(presale.address, USDTPrice);

                //Buy with USDT
                const buyWithUSDTTx = presale.connect(users.creator).buyWithUSDT(tokensToPurchase);

                //Assert transaction was reverted
                await expect(buyWithUSDTTx).to.be.revertedWith("Invalid amount: pre-sale limit exceeded");
            });

            it("should revert if try to buy 0 tokens", async function () {
                //Set values
                const { presale, users, saleStartTime, USDT } = await deployPresaleFixture();
                const tokensToPurchase = 0;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Get usdt price
                const USDTPrice = await presale.calculateUSDTPrice(tokensToPurchase);

                //Add allowance to contract
                await USDT.connect(users.creator).increaseAllowance(presale.address, USDTPrice);

                //Buy with USDT
                const buyWithUSDTTx = presale.connect(users.creator).buyWithUSDT(tokensToPurchase);

                //Assert transaction was reverted
                await expect(buyWithUSDTTx).to.be.revertedWith("Invalid amount: you should buy at least one token");
            });

            it("should emit TokensBought event", async function () {
                //Set values
                const { presale, users, saleStartTime, USDT } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Get usdt price
                const USDTPrice = await presale.calculateUSDTPrice(tokensToPurchase);

                //Add allowance to contract
                await USDT.connect(users.creator).increaseAllowance(presale.address, USDTPrice);

                //Buy with USDT
                const buyWithUSDTTx = presale.connect(users.creator).buyWithUSDT(tokensToPurchase);

                //Assert transaction was successful
                await expect(buyWithUSDTTx).not.to.be.reverted;

                expect(await buyWithUSDTTx)
                    .to.emit(presale, "TokensBought")
                    .withArgs(users.creator.address, "USDT", tokensToPurchase, USDTPrice, USDTPrice);
            });
        });

        describe("'claim' function", function () {
            it("should increase purchased tokens amount and transfer payment to owner", async function () {
                //Set values
                const { presale, users, saleStartTime, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensToPurchase = 1000;
                const claimStartTime = saleEndTime + 1;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Start claim
                await startClaimFixture(
                    presale,
                    ASI,
                    users.creator,
                    users.presaleOwner,
                    claimStartTime,
                    tokensToPurchase
                );

                //Purchase some tokens
                await purchaseTokensFixture(presale, users.creator, tokensToPurchase);

                //Get values before transaction
                const purchaseTokensAmountBefore = await presale.purchasedTokens(users.creator.address);
                const tokenBalanceBefore = await ASI.balanceOf(users.creator.address);

                //Timeshift to claim period
                await timeTravelFixture(claimStartTime + 1);

                //Claim tokens
                const claimTx = presale.connect(users.creator).claim();

                //Assert transaction was successful
                await expect(claimTx).not.to.be.reverted;

                //Get values after transaction
                const purchaseTokensAmountAfter = await presale.purchasedTokens(users.creator.address);
                const tokenBalanceAfter = await ASI.balanceOf(users.creator.address);
                const decimals = await ASI.decimals();

                //Assert values with expected
                expect(purchaseTokensAmountAfter).to.equal(
                    purchaseTokensAmountBefore.sub(BigNumber.from(10).pow(decimals).mul(tokensToPurchase))
                );
                expect(tokenBalanceAfter).to.equal(
                    tokenBalanceBefore.add(BigNumber.from(10).pow(decimals).mul(tokensToPurchase))
                );
            });

            it("should revert if called before claim start time", async function () {
                //Set values
                const { presale, users, saleStartTime, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensToPurchase = 1000;
                const claimStartTime = saleEndTime + 1;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Start claim
                await startClaimFixture(
                    presale,
                    ASI,
                    users.creator,
                    users.presaleOwner,
                    claimStartTime,
                    tokensToPurchase
                );

                //Purchase some tokens
                await purchaseTokensFixture(presale, users.creator, tokensToPurchase);

                //Claim tokens
                const claimTx = presale.connect(users.creator).claim();

                //Assert transaction was reverted
                await expect(claimTx).to.be.revertedWith("Claim has not started yet");
            });

            it("should revert if claim start time is not set", async function () {
                //Set values
                const { presale, users, saleStartTime } = await deployPresaleFixture();
                const tokensToPurchase = 1000;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Purchase some tokens
                await purchaseTokensFixture(presale, users.creator, tokensToPurchase);

                //Claim tokens
                const claimTx = presale.connect(users.creator).claim();

                //Assert transaction was reverted
                await expect(claimTx).to.be.revertedWith("Claim has not started yet");
            });

            it("should revert if no tokens purchased", async function () {
                //Set values
                const { presale, users, saleStartTime, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensToPurchase = 1000;
                const claimStartTime = saleEndTime + 1;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Start claim
                await startClaimFixture(
                    presale,
                    ASI,
                    users.creator,
                    users.presaleOwner,
                    claimStartTime,
                    tokensToPurchase
                );

                //Timeshift to claim period
                await timeTravelFixture(claimStartTime + 1);

                //Claim tokens
                const claimTx = presale.connect(users.creator).claim();

                //Assert transaction was reverted
                await expect(claimTx).to.be.revertedWith("Nothing to claim");
            });

            it("should revert if already claimed", async function () {
                //Set values
                const { presale, users, saleStartTime, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensToPurchase = 1000;
                const claimStartTime = saleEndTime + 1;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Start claim
                await startClaimFixture(
                    presale,
                    ASI,
                    users.creator,
                    users.presaleOwner,
                    claimStartTime,
                    tokensToPurchase
                );

                //Purchase some tokens
                await purchaseTokensFixture(presale, users.creator, tokensToPurchase);

                //Timeshift to claim period
                await timeTravelFixture(claimStartTime + 1);

                //Claim tokens
                await presale.connect(users.creator).claim();

                //Claim tokens again
                const claimTx = presale.connect(users.creator).claim();

                //Assert transaction was reverted
                await expect(claimTx).to.be.revertedWith("Nothing to claim");
            });

            it("should emit TokensClaimed event", async function () {
                //Set values
                const { presale, users, saleStartTime, saleEndTime, ASI } = await deployPresaleFixture();
                const tokensToPurchase = 1000;
                const claimStartTime = saleEndTime + 1;

                //Timeshift to sale period
                await timeTravelFixture(saleStartTime + 1);

                //Start claim
                await startClaimFixture(
                    presale,
                    ASI,
                    users.creator,
                    users.presaleOwner,
                    claimStartTime,
                    tokensToPurchase
                );

                //Purchase some tokens
                await purchaseTokensFixture(presale, users.creator, tokensToPurchase);

                //Timeshift to claim period
                await timeTravelFixture(claimStartTime + 1);

                //Claim tokens
                const claimTx = presale.connect(users.creator).claim();

                //Assert transaction was successful
                await expect(claimTx).not.to.be.reverted;

                //Assert event was emitted
                expect(claimTx).to.emit(presale, "TokensClaimed").withArgs(users.creator.address, tokensToPurchase);
            });
        });
    });
});
