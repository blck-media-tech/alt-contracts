// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract ASIToken is ERC20Capped {
    constructor(uint _initialSupply, uint256 _cap)
    ERC20("AltSignals", "ASI")
    ERC20Capped(_cap * 10**decimals()) {
        _mint(msg.sender, _initialSupply * 10**decimals());
    }

    function burn(uint256 amount) public virtual {
        _burn(msg.sender, amount);
    }
}
