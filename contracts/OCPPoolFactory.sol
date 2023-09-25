// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOCPPoolFactory.sol";
import "./entity/OCPPool.sol";

contract OCPPoolFactory is IOCPPoolFactory, Ownable {

    mapping(address => address) public override getPool; // srcToken -> pool
    address public router;

    modifier onlyRouter() {
        require(msg.sender == router, "OCPPoolFactory: caller is not the router");
        _;
    }

    function createPool(address _token, uint8 _sharedDecimals) external override returns (address pool){
        require(address(getPool[_token]) == address(0x0), "OCPPoolFactory: Pool already exists");

        OCPPool newPool = new OCPPool{salt: keccak256(abi.encodePacked("OCP_CREATE_POOL", _token))}();
        pool = address(newPool);
        getPool[_token] = pool;
    }

    function redeemPool(address _srcToken, address _receiver, uint256 _amount) external override onlyRouter {
        OCPPool(getPool[_srcToken]).redeem(_receiver, _amount);
    }

}
