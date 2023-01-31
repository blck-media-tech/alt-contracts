// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IChainlinkPriceFeed.sol";
import "./interfaces/IPresale.sol";

contract ASIPresale is IPresale, Pausable, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    address public immutable saleToken;

    uint256 public totalTokensSold;
    uint256 public claimStartTime;
    uint256 public saleStartTime;
    uint256 public saleEndTime;

    uint256[4] public stageAmount;
    uint256[4] public stagePrice;
    uint8 constant maxStageIndex = 3;
    uint8 public currentStage;

    IERC20 public USDTToken;
    IChainlinkPriceFeed public oracle;

    mapping(address => uint256) public purchasedTokens;
    mapping(address => bool) public blacklist;

    modifier checkSaleState(uint256 amount) {
        require(
            block.timestamp >= saleStartTime && block.timestamp <= saleEndTime,
            "Invalid time for buying"
        );
        require(amount > 0, "You should buy at least one token");
        require(amount + totalTokensSold <= stageAmount[maxStageIndex], "Insufficient funds");
        _;
    }

    modifier notBlacklisted() {
        require(!blacklist[_msgSender()], "You are in blacklist");
        _;
    }

    /**
     * @dev Creates the contract
     * @param _saleToken       - Address of presailing token
     * @param _oracle          - Address of Chainlink ETH/USD price feed
     * @param _usdt            - Address of USDT token
     * @param _stageAmount     - Array of prices for each presale stage
     * @param _stagePrice      - Array of totalTokenSold limit for each stage
     * @param _saleStartTime   - Sale start time
     * @param _saleEndTime     - Sale end time
     */
    constructor(
        address _saleToken,
        address _oracle,
        address _usdt,
        uint256 _saleStartTime,
        uint256 _saleEndTime,
        uint256[4] memory _stageAmount,
        uint256[4] memory _stagePrice
    ) {
        require(_oracle != address(0), "Zero aggregator address");
        require(_usdt != address(0), "Zero USDT address");
        require(_saleToken != address(0), "Zero sale token address");
        require(
            _saleStartTime > block.timestamp && _saleEndTime > _saleStartTime,
            "Invalid time"
        );

        saleToken = _saleToken;
        oracle = IChainlinkPriceFeed(_oracle);
        USDTToken = IERC20(_usdt);
        stageAmount = _stageAmount;
        stagePrice = _stagePrice;
        saleStartTime = _saleStartTime;
        saleEndTime = _saleEndTime;

        emit SaleStartTimeUpdated(
            _saleStartTime,
            block.timestamp
        );

        emit SaleEndTimeUpdated(
            _saleEndTime,
            block.timestamp
        );
    }

    /**
     * @dev To pause the presale
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev To unpause the presale
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev To add users to blacklist
     * @param _users - Array of addresses to add in blacklist
     */
    function addToBlacklist(address[] calldata _users) external onlyOwner {
        uint256 usersAmount = _users.length;
        uint256 i = 0;
        while(i<usersAmount) blacklist[_users[i++]] = true;
    }

    /**
     * @dev To remove users from blacklist
     * @param _users - Array of addresses to remove from blacklist
     */
    function removeFromBlacklist(address[] calldata _users) external onlyOwner {
        uint256 usersAmount = _users.length;
        uint256 i = 0;
        while(i<usersAmount) blacklist[_users[i++]] = false;
    }
    /**
     * @dev Returns total price of sold tokens
     * @param _tokenAddress - Address of token to resque
     * @param _amount       - Amount of tokens to resque
     */
    function resqueERC20(address _tokenAddress, uint256 _amount) external onlyOwner {
        IERC20(_tokenAddress).safeTransfer(_msgSender(), _amount);
    }


    /**
     * @dev To update the sale start time
     * @param _saleStartTime - New sales start time
     */
    function changeSaleStartTime(uint256 _saleStartTime) external onlyOwner {
        saleStartTime = _saleStartTime;
        emit SaleStartTimeUpdated(
            _saleStartTime,
            block.timestamp
        );
    }


    /**
     * @dev To update the sale end time
     * @param _saleEndTime - sales New end time
     */
    function changeSaleEndTime(uint256 _saleEndTime) external onlyOwner {
        saleEndTime = _saleEndTime;
        emit SaleEndTimeUpdated(
            _saleEndTime,
            block.timestamp
        );
    }

    /**
     * @dev To set the claim start time
     * @param _claimStartTime - claim start time
     * @notice Function also makes sure that presale have enough sale token balance
     */
    function configureClaim(
        uint256 _claimStartTime
    ) external onlyOwner {
        require(_claimStartTime >= block.timestamp && _claimStartTime > saleEndTime, "Invalid claim start time");
        require(IERC20(saleToken).balanceOf(address(this)) >= totalTokensSold * 1e18, "Not enough balance");
        claimStartTime = _claimStartTime;
        emit ClaimStartTimeUpdated(_claimStartTime, block.timestamp);
    }

    /**
     * @dev Returns price for current step
     */
    function getCurrentPrice() external view returns (uint256) {
        return stagePrice[currentStage];
    }

    /**
     * @dev Returns amount of tokens sold on current step
     */
    function getSoldOnCurrentStage() external view returns (uint256 soldOnCurrentStage) {
        soldOnCurrentStage = totalTokensSold - ((currentStage == 0)? 0 : stageAmount[currentStage]);
    }

    /**
     * @dev Returns presale last stage token amount limit
     */
    function getTotalPresaleAmount() external view returns (uint256) {
        return stageAmount[maxStageIndex];
    }

    /**
     * @dev Returns total price of sold tokens
     */
    function totalSoldPrice() external view returns (uint256) {
        return _calculateInternalCostForConditions(totalTokensSold, 0 ,0);
    }

    /**
     * @dev To buy into a presale using ETH
     * @param _amount - Amount of tokens to buy
     */
    function buyWithEth(uint256 _amount) external payable notBlacklisted checkSaleState(_amount) whenNotPaused nonReentrant {
        uint256 ethPrice = calculateETHPrice(_amount);
        require(msg.value >= ethPrice, "Not enough wei");
        _sendValue(payable(owner()), ethPrice);
        uint256 excess = msg.value - ethPrice;
        if (excess > 0) _sendValue(payable(_msgSender()), excess);
        totalTokensSold += _amount;
        purchasedTokens[_msgSender()] += _amount * 1e18;
        uint8 stageAfterPurchase = _getStageByTotalSoldAmount();
        if (stageAfterPurchase>currentStage) currentStage = stageAfterPurchase;
        emit TokensBought(
            _msgSender(),
            "ETH",
            _amount,
            calculateUSDTPrice(_amount),
            ethPrice,
            block.timestamp
        );
    }

    /**
     * @dev To buy into a presale using ETH
     * @param _amount - Amount of tokens to buy
     */
    function buyWithEth2(uint256 _amount) external payable notBlacklisted checkSaleState(_amount) whenNotPaused {
        uint256 ethPrice = calculateETHPrice(_amount);
        require(msg.value >= ethPrice, "Not enough wei");
        _sendValue(payable(owner()), ethPrice);
        uint256 excess = msg.value - ethPrice;
        if (excess > 0) _sendValue(payable(_msgSender()), excess);
        totalTokensSold += _amount;
        purchasedTokens[_msgSender()] += _amount * 1e18;
        uint8 stageAfterPurchase = _getStageByTotalSoldAmount();
        if (stageAfterPurchase>currentStage) currentStage = stageAfterPurchase;
        emit TokensBought(
            _msgSender(),
            "ETH",
            _amount,
            calculateUSDTPrice(_amount),
            ethPrice,
            block.timestamp
        );
    }

    /**
     * @dev To buy into a presale using ETH
     * @param _amount - Amount of tokens to buy
     */
    function buyWithEth3(uint256 _amount) external payable notBlacklisted checkSaleState(_amount) whenNotPaused {
        uint256 ethPrice = calculateETHPrice(_amount);
        require(msg.value >= ethPrice, "Not enough wei");
        uint256 excess = msg.value - ethPrice;
        totalTokensSold += _amount;
        purchasedTokens[_msgSender()] += _amount * 1e18;
        uint8 stageAfterPurchase = _getStageByTotalSoldAmount();
        if (stageAfterPurchase>currentStage) currentStage = stageAfterPurchase;
        emit TokensBought(
            _msgSender(),
            "ETH",
            _amount,
            calculateUSDTPrice(_amount),
            ethPrice,
            block.timestamp
        );
        _sendValue(payable(owner()), ethPrice);
        if (excess > 0) _sendValue(payable(_msgSender()), excess);
    }

    /**
     * @dev To buy into a presale using USDT
     * @param _amount - Amount of tokens to buy
     */
    function buyWithUSDT(uint256 _amount) external notBlacklisted checkSaleState(_amount) whenNotPaused nonReentrant {
        uint256 usdtPrice = calculateUSDTPrice(_amount);
        uint256 allowance = USDTToken.allowance(
            _msgSender(),
            address(this)
        );
        require(usdtPrice <= allowance, "Make sure to add enough allowance");
        USDTToken.safeTransferFrom(
                _msgSender(),
                owner(),
                usdtPrice
        );
        totalTokensSold += _amount;
        purchasedTokens[_msgSender()] += _amount * 1e18;
        uint8 stageAfterPurchase = _getStageByTotalSoldAmount();
        if (stageAfterPurchase>currentStage) currentStage = stageAfterPurchase;
        emit TokensBought(
            _msgSender(),
            "USDT",
            _amount,
            calculateUSDTPrice(_amount),
            usdtPrice,
            block.timestamp
        );
    }

    /**
     * @dev To claim tokens after claiming starts
     */
    function claim() external whenNotPaused {
        require(block.timestamp >= claimStartTime && claimStartTime > 0, "Claim has not started yet");
        uint256 amount = purchasedTokens[_msgSender()];
        require(amount > 0, "Nothing to claim");
        purchasedTokens[_msgSender()] -= amount;
        IERC20(saleToken).safeTransfer(_msgSender(), amount);
        emit TokensClaimed(_msgSender(), amount, block.timestamp);
    }

    /**
     * @dev To get latest ethereum price in 10**18 format
     * @notice Will return value in 1e18 format
     */
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , ,) = oracle.latestRoundData();
        return uint256(price * 1e10);
    }

    /**
     * @dev Helper function to calculate ETH price for given amount
     * @param _amount - Amount of tokens to buy
     * @notice Will return value in 1e18 format
     */
    function calculateETHPrice(uint256 _amount) public view returns (uint256 ethAmount) {
        ethAmount = _calculateInternalCost(_amount) * 1e18  / getLatestPrice();
    }

    /**
     * @dev Helper function to calculate USDT price for given amount
     * @param _amount No of tokens to buy
     * @notice Will return value in 1e6 format
     */
    function calculateUSDTPrice(uint256 _amount) public view returns (uint256 usdtPrice) {
        usdtPrice = _calculateInternalCost(_amount) / 1e12;
    }

    /**
     * @dev Calculate cost for specified conditions
     * @param _amount - Amount of tokens to calculate price
     */
    function _calculateInternalCost(uint256 _amount) internal view returns (uint256) {
        require(_amount + totalTokensSold <= stageAmount[maxStageIndex], "Insufficient funds");
        return _calculateInternalCostForConditions(_amount, currentStage, totalTokensSold);
    }

    /**
     * @dev For sending ETH from contract
     * @param _recipient - Recipient address
     * @param _ethAmount - Amount of ETH to send in wei
     */
    function _sendValue(address payable _recipient, uint256 _ethAmount) internal {
        require(address(this).balance >= _ethAmount, "Low balance");
        (bool success,) = _recipient.call{value : _ethAmount}("");
        require(success, "ETH Payment failed");
    }

    /**
     * @dev Recursively calculate cost for specified conditions
     * @param _amount          - Amount of tokens to calculate price
     * @param _currentStage     - Starting step to calculate price
     * @param _totalTokensSold - Starting total token sold amount to calculate price
     */
    function _calculateInternalCostForConditions(uint256 _amount, uint256 _currentStage, uint256 _totalTokensSold) internal view returns (uint256 cost){
        if (_totalTokensSold + _amount <= stageAmount[_currentStage]) {
            cost = _amount * stagePrice[_currentStage];
        }
        else {
            uint256 currentStageAmount = stageAmount[_currentStage] - _totalTokensSold;
            uint256 nextStageAmount = _amount - currentStageAmount;
            cost = currentStageAmount * stagePrice[_currentStage] + _calculateInternalCostForConditions(nextStageAmount, _currentStage + 1, stageAmount[_currentStage]);
        }

        return cost;
    }

    /**
     * @dev Calculate current step amount from total tokens sold amount
     */
    function _getStageByTotalSoldAmount() internal view returns (uint8) {
        uint8 stageIndex = maxStageIndex;
        while (stageIndex > 0) {
            if (stageAmount[stageIndex - 1] < totalTokensSold) break;
            stageIndex -= 1;
        }
        return stageIndex;
    }
}
