// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OCPool {
    IERC20 public token;
    address public router;

    /* todo: add onlyRouter */
    function withdraw(address _receiver, uint256 _amount) external {

    }
}
