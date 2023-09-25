// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/Structs.sol";

interface IOCPPoolFactory {

    function getPool(address _token) external view returns (address pool);

    function createPool(address _token, uint8 _sharedDecimals) external returns (address pool);

    function redeemPool(address _srcToken, address _receiver, uint256 _amount) external;

}
