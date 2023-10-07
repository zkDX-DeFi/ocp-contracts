// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IOCPReceiver.sol";

contract ReceiverContract is IOCPReceiver {

    address public token;
    address public router;
    uint256 public total;
    mapping(address => uint256) public balance;

    constructor(address _router) {
        router = _router;
    }

    function ocpReceive(uint16, bytes memory, uint256, address _token, uint256 _amount, bytes memory _payload) external {
        require(msg.sender == router, "only router");

        if (token == address(0x0))
            token = _token;

        (address _account) = abi.decode(_payload, (address));

        balance[_account] += _amount;
        total += _amount;
        require(IERC20(token).balanceOf(address(this))>= total, "balance not enough");
    }
}
