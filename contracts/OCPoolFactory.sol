// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./interfaces/IOCPoolFactory.sol";
import "./entity/OCPool.sol";
contract OCPoolFactory is IOCPoolFactory {

    mapping(address => address) public override getPool; // srcToken -> pool

    /**
        * @dev create a new pool

        * `createPool` is a helper function to create a new pool.

        * Emits a {PoolCreated} event.

        * If the pool already exists, it will revert.

        * If the pool is created successfully, it will return the pool address and be added to `getPool`.

        * Requirements:

            * - _token must be valid

            * - `getPool[_token]` must be empty

        * @param _token token address
        * @return pool address
    */
    function createPool(address _token) external override returns (address pool){
        require(address(getPool[_token]) == address(0x0), "OCPPoolFactory: Pool already exists");

        OCPool newPool = new OCPool{salt: keccak256(abi.encodePacked("OCP_CREATE_POOL", _token))}(
            _token
        );
        pool = address(newPool);
        getPool[_token] = pool;
    }

    function withdraw(address _token, address _receiver, uint256 _amount) external { // TODO: onlyRouter
        address _pool = getPool[_token];
        require(_pool != address(0x0), "OCPoolFactory: Pool does not exist");

        OCPool(_pool).withdraw(_receiver, _amount);
    }
}
