// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OCPPool {

    address public factory;
    IERC20 public token;
    uint256 public sharedDecimals;
    uint256 public convertRate;
    bool internal initialized;

    function redeem(address _receiver, uint256 _amount) external {
        //
    }
}
