// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interfaces/IOCPoolFactory.sol";
import "./entity/OCPool.sol";

contract OCPoolFactory is IOCPoolFactory {
    mapping(address => address) public override getPool; // srcToken -> pool

    function createPool(address _token, uint8 _sharedDecimals) external override returns (address pool){
        require(address(getPool[_token]) == address(0x0), "OCPPoolFactory: Pool already exists");

        OCPool newPool = new OCPool{salt: keccak256(abi.encodePacked("OCP_CREATE_POOL", _token))}();
        pool = address(newPool);
        getPool[_token] = pool;
    }
}
