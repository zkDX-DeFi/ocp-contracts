// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/Structs.sol";

interface IOCPBridge {

    function omniMint(
        uint16 _remoteChainId,
        address payable _refundAddress,
        uint8 _type,
        Structs.MintObj memory _mintParams,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external payable;

    function omniRedeem(
        uint16 _remoteChainId,
        address payable _refundAddress,
        uint8 _type,
        Structs.RedeemObj memory _redeemParams,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external payable;

    function quoteLayerZeroFee(
        uint16 _remoteChainId,
        uint8 _type,
        bytes calldata _userPayload,
        Structs.LzTxObj memory _lzTxParams
    ) external view returns (uint256, uint256);
}
