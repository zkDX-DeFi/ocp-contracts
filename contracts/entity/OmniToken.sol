// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";
import "../interfaces/IOCPTokenManager.sol";
import "../interfaces/IOCPBridge.sol";

contract OmniToken is OFT {

    IOCPTokenManager public tokenManager;
    uint16[] public sourceChainIds;
    address[] public sourcePools;

    event SourceUpdated(uint16 indexed chainId, address indexed pool);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _mintAmount,
        address _to,
        address _lzEndpoint,
        address _tokenManager,
        uint16 _srcChainId,
        address _srcPool
    ) OFT (_name, _symbol, _lzEndpoint) {
        if (_mintAmount > 0) _mint(_to, _mintAmount);
        _transferOwnership(_tokenManager);
        sourceChainIds.push(_srcChainId);
        sourcePools.push(_srcPool);
        tokenManager = IOCPTokenManager(_tokenManager);
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }

//    function assetURIs() external view returns (string[] memory){
//        return tokenManager.getAssetURIs(sourceChainIds, sourcePools);
//    }
}
