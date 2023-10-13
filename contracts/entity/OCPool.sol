// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OCPool {

    using SafeERC20 for IERC20;
    IERC20 public token;
    address public factory;

    /**
        * @dev Initializes the contract setting the deployer as the initial owner.

        * @param _token The address of the token contract.
    */
    constructor (address _token) {
        token = IERC20(_token);
        factory = msg.sender;
    }

    /**
        * @dev Transfers tokens from sender to receiver on the same chain.

        * @param _receiver The address of the receiver.
        * @param _amount The amount of tokens to transfer.
    */
    function withdraw(address _receiver, uint256 _amount) external {
        require(msg.sender == factory, "OCPool: caller is not the factory");
        require(token.balanceOf(address(this)) >= _amount, "OCPool: insufficient balance");
        token.safeTransfer(_receiver, _amount);
    }
}
