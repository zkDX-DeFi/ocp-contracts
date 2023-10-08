// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract OCPool {
    IERC20 public token;
    address public router;
    /**
        * @dev Initializes the contract setting the deployer as the initial owner.

        * @param _token The address of the token contract.
    */
    constructor (address _token) {
        token = IERC20(_token);
    }

    /**
        * @dev Transfers tokens from sender to receiver on the same chain.

        * @param _receiver The address of the receiver.
        * @param _amount The amount of tokens to transfer.
    */
    function withdraw(address _receiver, uint256 _amount) external {

    }
}
