# AltSignals presale

## What is AltSignals?
Established in 2017, AltSignals is a market leader in providing signals and developing algorithm-based indicators. Born amidst the rapid development on the cryptocurrency markets, AltSignals offers trading signals indicators across crypto and Binance futures, as well as Forex, CFD and shares.

Over the past five years, we have built trusted relationships with customers all over the world who use our products on a daily basis. To back up our business and user satisfaction, we have almost 500 excellent reviews on Trustpilot, with an average score of 4.9/5.

AltSignals was founded in 2017. The creation of the AltSignals brand was initiated from the rapid development of the cryptocurrency market, and services related to trading on traditional markets such as Forex, CFD, futures, and shares.

You can read more in the [whitepaper](./assets/whitepaper.pdf).

## Repo description

This is environment for alt-signals token and presale contracts.

### Setup repo

You may configure this repo with variables in the `.env` file
```shell
    ETHERSCAN_API_KEY     - Etherscan api key
    DEPLOYER_PRIVATE_KEY  - Private key of wallet that should deploy contract
    REPORT_GAS            - Sets up whether tests should report gas usage or not
```

Also, there are some commands to use:

For compiling contracts
```shell
npm run compile
```

For executing tests
```shell
npm run test
```

For exporting contracts abi in standard and minimized forms
```shell
npm run export-abi
```

For clearing already exported abi (automatically called before exporting abi)
```shell
npm run clear-abi
```
***
### Deployment
There are some tasks for deployment contracts
<br>To configure deployment you should set values in `task/arguments.deploy.js` file.

<br>

#### Deploying tasks for core contracts
For deploying token
```shell
npx hardhat deploy:ASIToken
```

For deploying presale
```shell
npx hardhat deploy:ASIPresale
```
<br>

#### Deploying tasks for test support contracts
For deploying USDT mock
```shell
npx hardhat deploy:mock:USDT
```

For deploying chainlink price feed mock
```shell
npx hardhat deploy:mock:ChainlinkPriceFeed
```
