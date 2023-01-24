// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IPresale {
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
}
