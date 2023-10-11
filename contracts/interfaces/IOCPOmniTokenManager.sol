// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "../libraries/Structs.sol";
interface IOCPOmniTokenManager {
    function omniTokens(address _srcToken, uint16 _chainId) external view returns (address token);
    function sourceTokens(address _omniToken, uint16 _chainId) external view returns (address token);
    function createOmniToken(Structs.MintObj memory _mintParams, address _lzEndpoint, uint16 _srcChainId) external returns (address token);
    function omniMint(Structs.MintObj memory _mintParams, uint16 _srcChainId) external returns (address token);
    function omniBurn(address _omniToken, uint256 _amount, address _from) external;
}
