// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/Structs.sol";

interface IOCPRouter {

    function omniMint(
        uint16 _remoteChainId,
        address _token,
        uint256 _amountIn,
        address _to,
        uint8 _type,
        address payable _refundAddress,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external payable;

//    function omniMintETH(
//        uint16 _remoteChainId,
//        uint256 _amountIn,
//        address _to,
//        bool _needDeploy,
//        address payable _refundAddress,
//        bytes memory _payload,
//        Structs.LzTxObj memory _lzTxParams
//    ) external payable;

    function omniMintRemote(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint256 _nonce,
        uint8 _type,
        Structs.MintObj memory _mintParams,
        address _lzEndpoint,
        uint256 _dstGasForCall,
        bytes memory payload
    ) external;

//    function omniRedeem(
//        uint16 _remoteChainId,
//        address _token,
//        uint256 _amountIn,
//        address _to,
//        address payable _refundAddress,
//        bytes memory _payload,
//        Structs.LzTxObj memory _lzTxParams
//    ) external payable;

//    function omniRedeemRemote(
//        uint16 _srcChainId,
//        bytes memory _srcAddress,
//        uint256 _nonce,
//        Structs.RedeemObj memory _redeemParams,
//        uint256 _dstGasForCall,
//        bytes memory _payload
//    ) external;
}
