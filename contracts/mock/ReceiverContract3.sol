// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IOCPReceiver.sol";
import "hardhat/console.sol";

contract ReceiverContract3 is IOCPReceiver {

    address public token;
    address public router;
    uint256 public total;
    mapping(address => uint256) public balance;

    constructor(address _router) {
        router = _router;
    }

    function ocpReceive(uint16, bytes memory, uint256, address _token, uint256 _amount, bytes memory _payload) external {
        console.log("AAA");
    }
}
