// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOCPOmniTokenFactory.sol";
import "./entity/OmniToken.sol";

contract OCPOmniTokenFactory is IOCPOmniTokenFactory, Ownable {

    address public tokenManager;

    function createToken(
        Structs.MintObj memory _mintParams,
        address _lzEndpoint,
        uint16 _srcChainId
    ) external returns (address token) {
        require(msg.sender == tokenManager, "OCPTokenFactory: caller is not the tokenManager");

        OmniToken newToken = new OmniToken{salt: keccak256(abi.encodePacked("OCP_CREATE_TOKEN", _mintParams.srcToken))}(
            _mintParams.name,
            _mintParams.symbol,
            _mintParams.amount,
            _mintParams.to,
            _lzEndpoint,
            tokenManager,
            _srcChainId,
            _mintParams.srcPool
        );
        token = address(newToken);
    }

    function updateTokenManager(address _tokenManager) external onlyOwner {
        tokenManager = _tokenManager;
    }
}
