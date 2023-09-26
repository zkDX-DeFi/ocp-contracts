// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/Structs.sol";

interface IOCPoolFactory {

    function getPool(address _token) external view returns (address pool);

    function createPool(address _token) external returns (address pool);

//    function redeemPool(address _srcToken, address _receiver, uint256 _amount) external;

}
