require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.17",
    mocha: {
        timeout: 5000,
    },
    forking: {
        url: "https://eth.llamarpc.com",
    },
    network: {
        hardhat: {
            url: "http://127.0.0.1:8545/"
        }
    }
};
