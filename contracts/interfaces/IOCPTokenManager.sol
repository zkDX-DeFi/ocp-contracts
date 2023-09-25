// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/Structs.sol";

interface IOCPTokenManager {

    function getOmniToken(address _srcToken, uint16 _chainId) external view returns (address token);

    function getSourceToken(address _omniToken, uint16 _chainId) external view returns (address token);

    function createToken(Structs.MintObj memory _mintParams, address _lzEndpoint, uint16 _srcChainId) external returns (address token);

    function omniMint(address _srcToken, uint16 _dstChainId, uint256 _amount, address _to) external returns (address token);

    function omniBurn(address _omniToken, uint256 _amount, address _from) external;

    function getAssetURIs(uint16[] calldata _chainIds, address[] calldata _pools) external view returns (string[] memory assetURIs);

    function addSourceToken(
        address _omniToken,
        uint16 _srcChainId,
        address _srcToken,
        address _srcPool,
        string calldata _symbolCheck
    ) external;
}
