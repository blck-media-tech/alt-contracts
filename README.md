# AltSignals presale

## What is AltSignals?
Established in 2017, AltSignals is a market leader in providing signals and developing algorithm-based indicators. Born amidst the rapid development on the cryptocurrency markets, AltSignals offers trading signals indicators across crypto and Binance futures, as well as Forex, CFD and shares.

Over the past five years, we have built trusted relationships with customers all over the world who use our products on a daily basis. To back up our business and user satisfaction, we have almost 500 excellent reviews on Trustpilot, with an average score of 4.9/5.

AltSignals was founded in 2017. The creation of the AltSignals brand was initiated from the rapid development of the cryptocurrency market, and services related to trading on traditional markets such as Forex, CFD, futures, and shares.

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

## Introduction
Welcome to AltSignals. In this document, we will introduce you to who we are, what we do, why we created the AltAlgo™, and how we engage with our community to pursue continuous development and growth.

## Why we decided to create the AltAlgo™
At the turn of 2020/2021, we noticed users' great interest in scalping indicators. Everyone wanted to enter and exit the market quickly. They needed the right tool for this.

AltAlgo™ is a one of a kind signal that was first released in March 2021. We knew that this part of our business would be crucial for the AltSignals brand in the future. The excellent reception of our algorithm encouraged us to allocate more resources to its development.  Due to the continuous development and improvement, the AltAlgo™ became what it is today.

## How we decided to build the AltAlgo™

At the turn of 2020/2021, we noticed users' great interest in scalping indicators. Everyone wanted to enter and exit the market quickly. They needed the right tool for this. In response to this demand, we devoted several months of hard work and created the first version of our script. This script was straightforward from the user's side - it had one parameter to determine signal sensitivity and some essential other settings related to defining take profit levels, stop loss, and visual settings. At this stage, AltAlgo™ users could only use it for manual trading.

We changed this later on, fulfilling our users’ wishes of making the AltAlgo™ fully compliant with auto-trading systems like Cornix.

Interest in the AltAlgo™ exceeded even our own expectations. We received a lot of positive messages and feedback from the community as we developed the algorithm with many additional options and filters, some requested by our own users, resulting in one of the most advanced products on the market.

## Blockchain
We will build the AltSignals ($ASI) token on the ethereum blockchain. The ethereum network will allow the $ASI token to be purchased through our own DEX during pre-sale and also on Uniswap once the token goes live.

## Token Benefits

### Trade
Once launched, you'll have the opportunity to engage in what we all love and trade the $ASI token.

### Exclusive Pre/Private Sale Access
As a holder of $ASI tokens, active investors and speculators within the AltSignals community will be at a significant advantage. AltSignals has secured an exclusive agreement that will grant our community of $ASI holders priority access to private and pre-sale opportunities in the crypto market, positioning them to capitalize on the next bull run.

### The AltSignals Innovation Group
We are thrilled to announce that you can now earn $ASI tokens by working with us to enhance the products you love and optimize your trading experience.

By participating in this program, you will not only play an active role in the development of current and upcoming products at AltSignals, but you will also receive exclusive beta access to all new releases, giving you a competitive advantage in the market.

It is an opportunity to not just be a customer but a collaborator and a member of the AltSignals' community who can shape the future of the product and benefit from it as well. The program is a win-win for all parties and we are excited to bring this experience to you.

### Prize Draws / Trading Tournaments
Being traders, we understand the importance of adding an element of fun and excitement to the trading experience. That's why at AltSignals, we regularly host engaging competitions, trading tournaments, and prize draws. These events not only increase the excitement but also provide an opportunity to reward top performers with valuable prizes and $ASI tokens. These events will not only add a unique component to your AltSignals experience, but also give you an opportunity to showcase your trading skills and potentially earn rewards. We believe in creating a lively and rewarding community experience for all of our traders.

### Governance
As AltSignals continues to grow and evolve, there will be important decisions to be made regarding our products, community, and team. Engaging $ASI token holders will be a crucial aspect of this process, as it will allow us to establish effective decision-making and provide opportunities for community members to become more involved.

Additionally, as we continue to expand and build our team, we anticipate making key hires from within the community. Holding $ASI tokens will allow you to apply for these opportunities and potentially be voted in. We believe that by giving our community a direct say in these important decisions and opportunities, we can create a more engaged and invested community, resulting in a win-win for all parties involved.

### Business Revenues
The trading signals market is exploding and AltSignals has led the charge with impressive sales and product development since its inception in 2017. We will continue to do that by expanding the team to deliver an incredible product development roadmap. We will sustain and grow the business by utilizing the following revenue streams;
- New Customer Acquisition
- Expanding capabilities and product lines to existing and new customers
- Affiliate Marketing
- White-label opportunities

The number of revenue streams will continue to expand over time as the product roadmap is delivered and we explore more opportunities in the trading signal space and further afield.

### Product Roadmap
The AltSignals Team was established in 2017 and has never looked back. The existing team and the new team members have combined to produce a fully transparent roadmap to deliver the best experience for the community and value for token holders.  This roadmap will develop over time as we look to build the best trading and community experience in the industry.

#### Q1 2023 Presale
- Presale launch of the AltSignals token
- Release website, White Paper and tokenomics
- Rebrand
- Expand existing team
- KYC Team
- Solid Proof - Full Security Audit
- Introduce the AltSignals team to the community in existing groups and channels?
- Launch the AltSignals Innovation Group

#### Q2 2023
Token launch
- Token listing on Uniswap
- Release automation for the best performing signal
- 1st Bounty Project for the AltSignals Innovation Group
- Private Sale Opportunity for $ASI Holders
- Token listing on CoinGecko & CoinMarketCap

#### Q3 2023
- Develop & release furthers automations across Alt Signal products
- Launch Cross-Chain Bridge (Rubics)
- Second Bounty Project for the AltSignals Innovation Group
- Integrate and launch our own exchange within the AltSignals platform
- Private Sale Opportunity for $ASI Holders
- Start CEX Listing process with 3-5 leading names

#### Q4 2023
- Introduction of prop trading to the AltSignals Platform
- Expand assets and markets for all automated signals
- 3rd Bounty Project for the AltSignals Innovation Group
- Private Sale Opportunity for $ASI Holders

## Socials

Coming soon

## Tokenomics

The AltSignals community love trading and succeeding every day in the markets. The tokenomics should always focus on rewarding community contribution but also give exclusive access to new opportunities just for holding the token and supporting the business.

#### Accounting and Value Transfer
$ASI is the central unit of account and value transfer between the various stakeholders within the AltSignals community.
- _Holding in wallet_  - $ASI can be used to secure a place on whitelists for up and coming private sales of new projects who have partnered with AltSignals.
- _Win Transactions_ - Token holders will be able to win $ASI tokens in prize draws and trading tournaments set up by the AltSignals Team.
- _Reward Transactions_ - Community members can be rewarded with the $ASI token for joining the Innovation Group and contributing to bounty projects which will include product development, testing and road map conversations.

#### Token Supply
In total there will be a fixed supply of 500,000,000 (million) $ASI tokens. There will be a total of 250,000,000 tokens (50%) made available for the presale event and these will be released in 4 stages.
Once the presale is complete the token allocation will be as follows:
- 20% (100 Million) tokens will be available for product development and the innovation group.
- 10% (50 Million) will be used for Liquidity provision for Decentralised Exchange listings.
- 20% (100 Million) will be used for Marketing and listings on Centralised Exchanges

#### Burn/Buy Back Mechanism
Once the $ASI token is live and in circulation we will start to introduce a token burning mechanism or a buy back strategy. Token burns result in tokens being permanently pulled out of circulation over time, thus lowering the overall circulating supply.

Token buybacks allow the protocol to reduce the token supply in circulation should the community feel it is a productive measure at the chosen moment. A good example of why we would buy back the token is to provide bounties for the AltSignals Innovation Group whilst increasing buy pressure in the market.

## Safety

#### Security Mechanisms
In order to achieve maximum security for AltSignals and its stakeholders, we will be completely transparent with all actions and token transactions made by AltSignals. We are working closely with a trusted and renowned third-party auditor to ensure the highest level of security, transparency and professional standards are maintained at all times.

#### Multi-Signature Wallets
Multi-signature wallets are another way we maintain safety and security of all assets under management. This is a risk-management mechanism we have implemented. Alt Signal’s treasury assets are to be managed by multiple keyholders. Two or more private key signatures are required to send transactions. This will ensure maintenance of the security and integrity of the treasury function.