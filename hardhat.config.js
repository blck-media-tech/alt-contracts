require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.17",
    mocha: {
        timeout: 5000,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    forking: {
        url: "https://eth.llamarpc.com",
    },
    networks: {
        hardhat: {
            url: "http://127.0.0.1:8545/"
        },
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
