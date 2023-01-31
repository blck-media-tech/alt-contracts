const { BigNumber } = require("ethers");
module.exports = {
    testnet: {
        ASIToken: {
            initialSupply: "500000000",
            cap: "250000000",
        },
        ASIPresale: {
            saleToken: "0x8549Fe48955e86E265311B79A494279dc4a0Eb9a",
            oracle: "0x853684B7C69Ff1f58e9c41F82119d7eFf2D86a7C",
            USDTAddress: "0xBCef3C761f76C7c77De20ED393E19e61aa9D7a9a",
            saleStartTime: Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24,
            saleEndTime: Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 2,
            stageAmount: [
                BigNumber.from("40000000"),
                BigNumber.from("102500000"),
                BigNumber.from("175000000"),
                BigNumber.from("250000000"),
            ],
            stagePrice: [
                BigNumber.from("15000000000000000"),
                BigNumber.from("18750000000000000"),
                BigNumber.from("21010000000000000"),
                BigNumber.from("22740000000000000"),
            ],
        },
        USDTMock: {
            initialSupply: "500000000000000000",
            _name: "Tether USD",
            _symbol: "USDT",
            _decimals: "6",
        },
    },
    mainnet: {
        ASIToken: {
            initialSupply: "",
            cap: "",
        },
        ASIPresale: {
            saleToken: "",
            oracle: "",
            USDTAddress: "",
            saleStartTime: "",
            saleEndTime: "",
            stageAmount: "",
            stagePrice: "",
        },
    },
};
