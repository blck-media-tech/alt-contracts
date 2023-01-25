// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IChainlinkPriceFeed.sol";
import "../interfaces/IPresale.sol";

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

    function pause() external onlyOwner {
        _pause();
    }

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

    function changeSaleStartTime(uint256 _saleStartTime) external onlyOwner {
        saleStartTime = _saleStartTime;
        emit SaleStartTimeUpdated(
            _saleStartTime,
            block.timestamp
        );
    }

    function changeSaleEndTime(uint256 _saleEndTime) external onlyOwner {
        saleEndTime = _saleEndTime;
        emit SaleEndTimeUpdated(
            _saleEndTime,
            block.timestamp
        );
    }

    function startClaim(
        uint256 _claimStartTime,
        uint256 amount
    ) external onlyOwner {
        require(_claimStartTime > saleEndTime && _claimStartTime > block.timestamp, "Invalid claim start time");
        require(amount >= totalTokensSold, "Tokens less than sold");
        require(claimStartTime == 0, "Claim already set");
        require(IERC20(saleToken).balanceOf(address(this)) >= amount * 1e18, "Not enough balance");
        claimStartTime = _claimStartTime;
        emit ClaimStartTimeUpdated(
            _claimStartTime,
            block.timestamp
        );
    }

    function changeClaimStartTime(uint256 _claimStartTime) external onlyOwner returns (bool) {
        require(claimStartTime > 0, "Initial claim data not set");
        require(_claimStartTime > saleEndTime, "Sale in progress");
        claimStartTime = _claimStartTime;
        emit ClaimStartTimeUpdated(
            _claimStartTime,
            block.timestamp
        );
        return true;
    }

    function getCurrentPrice() external view returns (uint256) {
        return stagePrice[currentStage];
    }

    function getSoldOnCurrentStage() external view returns (uint256 soldOnCurrentStage) {
        soldOnCurrentStage = totalTokensSold - ((currentStage == 0)? 0 : stageAmount[currentStage]);
    }

    function getTotalPresaleAmount() external view returns (uint256) {
        return stageAmount[maxStageIndex];
    }

    function totalSoldPrice() external view returns (uint256) {
        return _calculateInternalCostForConditions(totalTokensSold, 0 ,0);
    }

    function buyWithEth(uint256 amount) external payable notBlacklisted checkSaleState(amount) whenNotPaused nonReentrant {
        uint256 weiAmount = calculateWeiPrice(amount);
        require(msg.value >= weiAmount, "Not enough wei");
        _sendValue(payable(owner()), weiAmount);
        uint256 excess = msg.value - weiAmount;
        if (excess > 0) _sendValue(payable(_msgSender()), excess);
        totalTokensSold += amount;
        purchasedTokens[_msgSender()] += amount * 1e18;
        uint8 stageAfterPurchase = _getStageByTotalSoldAmount();
        if (stageAfterPurchase>currentStage) currentStage = stageAfterPurchase;
        emit TokensBought(
            _msgSender(),
            "ETH",
            amount,
            calculateUSDTPrice(amount),
            weiAmount,
            block.timestamp
        );
    }

    function buyWithUSDT(uint256 amount) external notBlacklisted checkSaleState(amount) whenNotPaused nonReentrant {
        uint256 usdtPrice = calculateUSDTPrice(amount);
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
        totalTokensSold += amount;
        purchasedTokens[_msgSender()] += amount * 1e18;
        uint8 stageAfterPurchase = _getStageByTotalSoldAmount();
        if (stageAfterPurchase>currentStage) currentStage = stageAfterPurchase;
        emit TokensBought(
            _msgSender(),
            "USDT",
            amount,
            calculateUSDTPrice(amount),
            usdtPrice,
            block.timestamp
        );
    }

    function claim() external whenNotPaused {
        require(block.timestamp >= claimStartTime && claimStartTime > 0, "Claim has not started yet");
        uint256 amount = purchasedTokens[_msgSender()];
        require(amount > 0, "Nothing to claim");
        purchasedTokens[_msgSender()] -= amount;
        IERC20(saleToken).transfer(_msgSender(), amount);
        emit TokensClaimed(_msgSender(), amount, block.timestamp);
    }

    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , ,) = oracle.latestRoundData();
        return uint256(price * 1e10);
    }

    function calculateWeiPrice(uint256 amount) public view returns (uint256 ethAmount) {
        ethAmount = _calculateInternalCost(amount) * 1e18  / getLatestPrice();
    }

    function calculateUSDTPrice(uint256 amount) public view returns (uint256 usdtPrice) {
        usdtPrice = _calculateInternalCost(amount) / 1e12;
    }

    function _calculateInternalCost(uint256 _amount) internal view returns (uint256) {
        require(_amount + totalTokensSold <= stageAmount[maxStageIndex], "Insufficient funds");
        return _calculateInternalCostForConditions(_amount, currentStage, totalTokensSold);
    }

    function _sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Low balance");
        (bool success,) = recipient.call{value : amount}("");
        require(success, "ETH Payment failed");
    }

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

    function _getStageByTotalSoldAmount() internal view returns (uint8) {
        uint8 stageIndex = maxStageIndex;
        while (stageIndex > 0) {
            if (stageAmount[stageIndex - 1] < totalTokensSold) break;
            stageIndex -= 1;
        }
        return stageIndex;
    }
}
