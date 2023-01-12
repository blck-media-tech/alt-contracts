const { expect } = require("chai");
const hre = require("hardhat");
const { BigNumber, getSigners } = hre.ethers;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("ASIToken", function () {
    //Setup values
    const cap = 1_000_000;
    let totalSupply;

    it("should be correctly deployed if total supply is under cap", async function () {
        //Setup values
        totalSupply = cap / 2;

        //Deploy contract
        const ASIFactory = await hre.ethers.getContractFactory("ASIToken");
        const ASI = await ASIFactory.deploy(totalSupply, cap);

        //Assert deploy was successful
        await expect(ASI).not.to.be.reverted;
        expect(!!ASI).to.equal(true);
    });

    it("should be correctly deployed if total supply is equal to cap", async function () {
        //Setup values
        totalSupply = cap;

        //Deploy contract
        const ASIFactory = await hre.ethers.getContractFactory("ASIToken");
        const ASI = await ASIFactory.deploy(totalSupply, cap);

        //Assert deploy was successful
        await expect(ASI).not.to.be.reverted;
        expect(!!ASI).to.equal(true);
    });

    it("should revert deploy if total supply is over cap", async function () {
        //Setup values
        totalSupply = cap * 2;

        //Deploy contract
        const ASIFactory = await hre.ethers.getContractFactory("ASIToken");
        const ASI = ASIFactory.deploy(totalSupply, cap);

        //Assert deploy was reverted
        await expect(ASI).to.be.revertedWith("ERC20Capped: cap exceeded");
    });

    it("should have correct values after deploying", async function () {
        //Setup values
        totalSupply = cap;
        const [creator] = await getSigners();

        //Deploy contract
        const ASIFactory = await hre.ethers.getContractFactory("ASIToken");
        const ASI = await ASIFactory.connect(creator).deploy(totalSupply, cap);

        //Assert deploy was successful
        await expect(ASI).not.to.be.reverted;
        expect(!!ASI).to.equal(true);

        //Get contract values
        const ASITotalSupply = await ASI.totalSupply();
        const ASIDecimals = await ASI.decimals();
        const creatorBalance = await ASI.balanceOf(creator.address);

        //Assert contract values with passed params
        expect(ASITotalSupply).to.equal(BigNumber.from(totalSupply).mul(BigNumber.from(10).pow(ASIDecimals)));
        expect(ASIDecimals).to.equal(BigNumber.from(18));
        expect(creatorBalance).to.equal(ASITotalSupply);
    });

    describe("Token functions", function () {
        async function deployContractFixture() {
            //Setup values
            const cap = 1_000_000;
            const totalSupply = 1_000_000;
            const [creator, Alice] = await getSigners();

            //Deploy contract
            const ASIFactory = await hre.ethers.getContractFactory("ASIToken");
            const ASI = await ASIFactory.connect(creator).deploy(totalSupply, cap);

            return {
                ASI,
                users: {
                    creator,
                    Alice,
                },
            };
        }

        it("'transfer' to zero account should be reverted", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();
            const valueToTransfer = 1;

            //Running transaction
            const transferTX = ASI.connect(users.creator).transfer(ZERO_ADDRESS, valueToTransfer);

            //Asserting final with expected balances
            await expect(transferTX).to.be.revertedWith("ERC20: transfer to the zero address");
        });

        it("'transfer' function should revert if not enough tokens", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();
            const valueToTransfer = BigNumber.from(2).pow(255);

            //Running transaction
            const transferTX = ASI.connect(users.creator).transfer(users.Alice.address, valueToTransfer);

            //Asserting final with expected balances
            await expect(transferTX).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("'transfer' function should correctly transfer tokens", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();
            const valueToTransfer = 100;

            //Getting balances before transaction
            const creatorStartBalance = await ASI.balanceOf(users.creator.address);
            const AliceStartBalance = await ASI.balanceOf(users.Alice.address);

            //Calculating expecting balances
            const creatorExpectedBalance = creatorStartBalance.sub(valueToTransfer);
            const AliceExpectedBalance = AliceStartBalance.add(valueToTransfer);

            //Running transaction
            const transferTX = ASI.connect(users.creator).transfer(users.Alice.address, valueToTransfer);

            //Assert transactions was successful
            await expect(transferTX).not.to.be.reverted;

            //Assert transactions emit Transfer event
            await expect(transferTX)
                .to.emit(ASI, "Transfer")
                .withArgs(users.creator.address, users.Alice.address, valueToTransfer);

            //Getting balances after transactions
            const creatorEndBalance = await ASI.balanceOf(users.creator.address);
            const AliceEndBalance = await ASI.balanceOf(users.Alice.address);

            //Asserting final with expected balances
            expect(creatorEndBalance).to.equal(creatorExpectedBalance);
            expect(AliceEndBalance).to.equal(AliceExpectedBalance);
        });

        it("'increaseAllowance' function should correctly increase allowance", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();
            const valueToAllow = 100;

            //Getting allowance before transaction
            const startAllowance = await ASI.allowance(users.creator.address, users.Alice.address);

            //Calculating expecting allowance
            const expectedAllowance = startAllowance.add(valueToAllow);

            //Running transaction
            const increaseAllowanceTX = ASI.connect(users.creator).increaseAllowance(users.Alice.address, valueToAllow);

            //Assert transactions was successful
            await expect(increaseAllowanceTX).not.to.be.reverted;

            //Assert transactions emit Approval event
            await expect(increaseAllowanceTX)
                .to.emit(ASI, "Approval")
                .withArgs(users.creator.address, users.Alice.address, valueToAllow);

            //Getting allowance after transactions
            const endAllowance = await ASI.allowance(users.creator.address, users.Alice.address);

            //Asserting final with expected allowance
            expect(endAllowance).to.equal(expectedAllowance);
        });

        it("'decreaseAllowance' function should be reverted if not enough allowance", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();
            const valueToDecreaseAllowance = 100;

            //Running transaction
            const decreaseAllowanceTX = ASI.connect(users.creator).decreaseAllowance(
                users.Alice.address,
                valueToDecreaseAllowance
            );

            //Assert transactions was reverted
            await expect(decreaseAllowanceTX).to.be.revertedWith("ERC20: decreased allowance below zero");
        });

        it("'decreaseAllowance' function should correctly decrease allowance", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();
            const allowanceAtStart = 500;
            const valueToDecreaseAllowance = 100;

            await ASI.connect(users.creator).increaseAllowance(users.Alice.address, allowanceAtStart);

            //Getting allowance before transaction
            const startAllowance = await ASI.allowance(users.creator.address, users.Alice.address);

            //Calculating expecting allowance
            const expectedAllowance = startAllowance.sub(valueToDecreaseAllowance);

            //Running transaction
            const decreaseAllowanceTX = ASI.connect(users.creator).decreaseAllowance(
                users.Alice.address,
                valueToDecreaseAllowance
            );

            //Assert transactions was successful
            await expect(decreaseAllowanceTX).not.to.be.reverted;

            //Assert transactions emit Approval event
            await expect(decreaseAllowanceTX)
                .to.emit(ASI, "Approval")
                .withArgs(users.creator.address, users.Alice.address, allowanceAtStart - valueToDecreaseAllowance);

            //Getting allowance after transactions
            const endAllowance = await ASI.allowance(users.creator.address, users.Alice.address);

            //Asserting final with expected allowance
            expect(endAllowance).to.equal(expectedAllowance);
        });

        it("'approve' function should correctly set allowance to specific value", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();
            const valueToAllow = 100;

            //Adding starting allowance
            await ASI.connect(users.creator).increaseAllowance(users.Alice.address, 50);

            //Running transaction
            const approveTX = ASI.connect(users.creator).approve(users.Alice.address, valueToAllow);

            //Assert transactions was successful
            await expect(approveTX).not.to.be.reverted;

            //Assert transactions emit Approval event
            await expect(approveTX)
                .to.emit(ASI, "Approval")
                .withArgs(users.creator.address, users.Alice.address, valueToAllow);

            //Getting allowance after transactions
            const endAllowance = await ASI.allowance(users.creator.address, users.Alice.address);

            //Asserting final with expected allowance
            expect(endAllowance).to.equal(BigNumber.from(valueToAllow));
        });

        it("'transferFrom' function should reverted if no enough allowance", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();
            const valueToTransfer = 100;

            //Running transaction
            const transferFromTx = ASI.connect(users.Alice).transferFrom(
                users.creator.address,
                users.Alice.address,
                valueToTransfer
            );

            //Assert transaction was reverted
            await expect(transferFromTx).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("'transferFrom' function should transfer tokens if allowance are enough", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();
            const valueToTransfer = 100;
            const valueToAllow = 100;

            //Adding allowance
            await ASI.connect(users.creator).increaseAllowance(users.Alice.address, valueToAllow);

            //Getting balances before transaction
            const creatorStartBalance = await ASI.balanceOf(users.creator.address);
            const AliceStartBalance = await ASI.balanceOf(users.Alice.address);

            //Calculating expecting balances
            const creatorExpectedBalance = creatorStartBalance.sub(valueToTransfer);
            const AliceExpectedBalance = AliceStartBalance.add(valueToTransfer);

            //Running transaction
            const transferFromTX = ASI.connect(users.Alice).transferFrom(
                users.creator.address,
                users.Alice.address,
                valueToTransfer
            );

            //Assert transactions was successful
            await expect(transferFromTX).not.to.be.reverted;

            //Assert transactions emit Transfer event
            await expect(transferFromTX)
                .to.emit(ASI, "Transfer")
                .withArgs(users.creator.address, users.Alice.address, valueToTransfer);

            //Assert transactions emit Approval event
            await expect(transferFromTX)
                .to.emit(ASI, "Approval")
                .withArgs(users.creator.address, users.Alice.address, valueToAllow - valueToTransfer);

            //Getting balances after transactions
            const creatorEndBalance = await ASI.balanceOf(users.creator.address);
            const AliceEndBalance = await ASI.balanceOf(users.Alice.address);

            //Asserting final with expected balances
            expect(creatorEndBalance).to.equal(creatorExpectedBalance);
            expect(AliceEndBalance).to.equal(AliceExpectedBalance);
        });

        it("'burn' function should revert if not enough tokens", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();

            //Getting balances before transaction
            const creatorStartBalance = await ASI.balanceOf(users.creator.address);
            const valueToBurn = creatorStartBalance.add(1);

            //Running transaction
            const burnTX = ASI.connect(users.Alice).burn(valueToBurn);

            //Asserting final with expected balances
            await expect(burnTX).to.be.revertedWith("ERC20: burn amount exceeds balance");
        });

        it("'burn' function should decrease balance and tokenSupply", async function () {
            //Setup values
            const { ASI, users } = await deployContractFixture();

            //Getting balance and totalSupply before transaction
            const creatorStartBalance = await ASI.balanceOf(users.creator.address);
            const startTokenSupply = await ASI.totalSupply();
            const valueToBurn = creatorStartBalance.sub(1);

            //Calculating expecting balance and totalSupply
            const creatorExpectedBalance = creatorStartBalance.sub(valueToBurn);
            const expectedTokenSupply = startTokenSupply.sub(valueToBurn);

            //Running transaction
            const burnTX = ASI.connect(users.creator).burn(valueToBurn);

            //Assert transactions was successful
            await expect(burnTX).not.to.be.reverted;

            //Assert transactions emit Transfer event
            await expect(burnTX).to.emit(ASI, "Transfer").withArgs(users.creator.address, ZERO_ADDRESS, valueToBurn);

            //Getting balances and totalSupply after transactions
            const creatorEndBalance = await ASI.balanceOf(users.creator.address);
            const endTokenSupply = await ASI.totalSupply();

            //Asserting final with expected balances
            expect(creatorEndBalance).to.equal(creatorExpectedBalance);
            expect(endTokenSupply).to.equal(expectedTokenSupply);
        });
    });
});
