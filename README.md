# Alt signals presale

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