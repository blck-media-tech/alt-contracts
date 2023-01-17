require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./task/subtasks");

require("./task/asiToken/asiToken.deploy");
require("./task/asiPresale/asiPresale.deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.17",
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
};
