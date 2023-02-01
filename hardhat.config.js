require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./task/subtasks");
require("hardhat-abi-exporter");
require("hardhat-gas-reporter");

require("./task/asiToken/asiToken.deploy");
require("./task/asiPresale/asiPresale.deploy");
require("./task/asiPresale/USDTStub.deploy");
require("./task/asiPresale/ChainlinkPriceFeedStub.deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
            {
                version: "0.4.17",
            },
        ],
    },
    compiler: [],
    mocha: {
        timeout: 5000,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    networks: {
        hardhat: {},
        testnet: {
            accounts: [process.env.DEPLOYER_PRIVATE_KEY],
            url: "https://goerli.infura.io/v3/",
        },
        mainnet: {
            accounts: [process.env.DEPLOYER_PRIVATE_KEY],
            url: "https://eth.llamarpc.com",
        },
    },
    abiExporter: [
        {
            runOnCompile: true,
            clear: true,
            path: "./abi/json",
            format: "json",
        },
        {
            runOnCompile: true,
            clear: true,
            path: "./abi/minimal",
            format: "minimal",
        },
    ],
    gasReporter: {
        enabled: !!process.env.REPORT_GAS,
        noColors: false,
        showTimeSpent: true,
    },
};
