// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OCPool {
    address public factory;
    IERC20 public token;
    bool internal initialized;

    /* todo: add onlyRouter */
    function redeem(address _receiver, uint256 _amount) external {

    }
}
