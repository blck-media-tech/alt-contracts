// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ChainlinkPriceFeed {
    function latestRoundData()
    external
    view
    returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract ASIPresale is Initializable, Pausable, Ownable, ReentrancyGuard {
    address public immutable saleToken;

    uint256 public totalTokensSold;
    uint256 public claimStartTime;
    uint256 public saleStartTime;
    uint256 public saleEndTime;

    uint256[4] stageAmount;
    uint256[4] stagePrice;
    uint8 constant maxStageIndex = 3;
    uint8 public currentStage;

    IERC20 public USDTToken;
    ChainlinkPriceFeed public oracle;

    mapping(address => uint256) public purchasedTokens;

    event ClaimStartTimeUpdated(
        uint256 newValue,
        uint256 timestamp
    );

    event SaleStartTimeUpdated(
        uint256 newValue,
        uint256 timestamp
    );

    event SaleEndTimeUpdated(
        uint256 newValue,
        uint256 timestamp
    );

    event TokensClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event TokensBought(
        address indexed user,
        bytes32 indexed currency,
        uint256 amount,
        uint256 totalCostInUsd,
        uint256 totalCostInCurrency,
        uint256 timestamp
    );

    modifier checkSaleState(uint256 amount) {
        require(
            block.timestamp >= saleStartTime && block.timestamp <= saleEndTime,
            "Invalid time for buying"
        );
        require(amount > 0, "Invalid amount: you should buy at least one token");
        require(amount + totalTokensSold <= stageAmount[maxStageIndex], "Invalid amount: pre-sale limit exceeded");
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
    )
    Ownable()
    ReentrancyGuard()
    Pausable()
    {
        require(_oracle != address(0), "Zero aggregator address");
        require(_usdt != address(0), "Zero USDT address");
        require(_saleToken != address(0), "Zero sale token address");
        require(
            _saleStartTime > block.timestamp && _saleEndTime > _saleStartTime,
            "Invalid time"
        );

        saleToken = _saleToken;
        oracle = ChainlinkPriceFeed(_oracle);
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

    function pause()
    external
    onlyOwner
    {
        _pause();
    }

    function unpause()
    external
    onlyOwner
    {
        _unpause();
    }

    function changeSaleStartTime(uint256 _saleStartTime)
    external
    onlyOwner
    {
        saleStartTime = _saleStartTime;
        emit SaleStartTimeUpdated(
            _saleStartTime,
            block.timestamp
        );
    }

    function changeSaleEndTime(uint256 _saleEndTime)
    external
    onlyOwner
    {
        saleEndTime = _saleEndTime;
        emit SaleEndTimeUpdated(
            _saleEndTime,
            block.timestamp
        );
    }

    function startClaim(
        uint256 _claimStartTime,
        uint256 amount
    )
    external
    onlyOwner
    {
        require(_claimStartTime > saleEndTime && _claimStartTime > block.timestamp, "Invalid claim start time");
        require(amount >= totalTokensSold, "Tokens less than sold");
        require(claimStartTime == 0, "Claim already set");
        require(IERC20(saleToken).balanceOf(address(this)) < 0, "Not enough balance");
        claimStartTime = _claimStartTime;
        emit ClaimStartTimeUpdated(
            _claimStartTime,
            block.timestamp
        );
    }

    function changeClaimStartTime(uint256 _claimStartTime)
    external
    onlyOwner
    returns (bool)
    {
        require(claimStartTime > 0, "Initial claim data not set");
        require(_claimStartTime > saleEndTime, "Sale in progress");
        claimStartTime = _claimStartTime;
        emit ClaimStartTimeUpdated(
            _claimStartTime,
            block.timestamp
        );
        return true;
    }

    function getCurrentPrice()
    external
    view
    returns (uint256)
    {
        return stagePrice[currentStage];
    }

    function getTotalPresaleAmount()
    external
    view
    returns (uint256)
    {
        return stageAmount[maxStageIndex];
    }

    function totalSoldPrice()
    external
    view
    returns (uint256)
    {
        return _calculateInternalCostForConditions(totalTokensSold, 0 ,0);
    }

    function buyWithEth(uint256 amount)
    external
    payable
    checkSaleState(amount)
    whenNotPaused
    nonReentrant
    {
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

    function buyWithUSDT(uint256 amount)
    external
    checkSaleState(amount)
    whenNotPaused
    nonReentrant
    {
        uint256 usdtPrice = calculateUSDTPrice(amount);
        uint256 allowance = USDTToken.allowance(
            _msgSender(),
            address(this)
        );
        require(usdtPrice <= allowance, "Make sure to add enough allowance");
        (bool success,) = address(USDTToken).call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                _msgSender(),
                owner(),
                usdtPrice
            )
        );
        require(success, "Token payment failed");
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

    function claim()
    external
    whenNotPaused
    {
        require(block.timestamp >= claimStartTime, "Claim has not started yet");
        uint256 amount = purchasedTokens[_msgSender()];
        require(amount > 0, "Nothing to claim");
        purchasedTokens[_msgSender()] -= amount;
        IERC20(saleToken).transfer(_msgSender(), amount);
        emit TokensClaimed(_msgSender(), amount, block.timestamp);
    }

    function getLatestPrice()
    public
    view
    returns (uint256)
    {
        (, int256 price, , ,) = oracle.latestRoundData();
        return uint256(price * 1e10);
    }

    function calculateWeiPrice(uint256 amount)
    public
    view
    returns (uint256 ethAmount)
    {
        ethAmount = _calculateInternalCost(amount) * 1e18  / getLatestPrice();
    }

    function calculateUSDTPrice(uint256 amount)
    public
    view
    returns (uint256 usdtPrice)
    {
        usdtPrice = _calculateInternalCost(amount) / 1e12;
    }

    function _calculateInternalCost(uint256 _amount)
    internal
    view
    returns (uint256)
    {
        require(_amount + totalTokensSold <= stageAmount[maxStageIndex], "Invalid amount: pre-sale limit exceeded");
        return _calculateInternalCostForConditions(_amount, currentStage, totalTokensSold);
    }

    function _sendValue(address payable recipient, uint256 amount)
    internal
    {
        require(address(this).balance >= amount, "Low balance");
        (bool success,) = recipient.call{value : amount}("");
        require(success, "ETH Payment failed");
    }

    function _calculateInternalCostForConditions(uint256 _amount, uint256 _currentStage, uint256 _totalTokensSold)
    internal
    view
    returns (uint256 cost)
    {
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

    function _getStageByTotalSoldAmount()
    internal
    view
    returns (uint8)
    {
        uint8 stageIndex = maxStageIndex;
        while (stageIndex > 0) {
            if (stageAmount[stageIndex - 1] < totalTokensSold) break;
            stageIndex -= 1;
        }
        return stageIndex;
    }
}
