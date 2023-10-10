// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@layerzerolabs/solidity-examples/contracts/lzApp/LzApp.sol";
import "./interfaces/IOCPBridge.sol";
import "./interfaces/IOCPRouter.sol";
import "./libraries/Structs.sol";
import "./libraries/Types.sol";
import "hardhat/console.sol";

contract OCPBridge is LzApp, IOCPBridge {
    IOCPRouter public router;
    mapping(uint16 => mapping(uint8 => uint256)) public gasLookup; // chainId -> type -> gas
    bool public useLzToken;
    constructor(address _lzEndpoint) LzApp(_lzEndpoint) {}

    /**
        * @dev mint token on remote chain

        * Requirements:

            * - onlyRouter

            * - _remoteChainId must be valid

            * - _refundAddress must be valid

            * - _type must be valid

            * - _lzTxParams must be valid

            * - _payload must be valid

            * - _mintParams must be valid

            * - _lzTxParams must be valid

        * @param _remoteChainId remote chain id
        * @param _refundAddress address to refund
        * @param _type mint type
        * @param _mintParams mint params
        * @param _payload user payload
        * @param _lzTxParams layer zero tx params
    */
    function omniMint(
        uint16 _remoteChainId,
        address payable _refundAddress,
        uint8 _type,
        Structs.MintObj memory _mintParams,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external payable { // TODO: onlyRouter
        bytes memory payload = abi.encode(_type, _mintParams, _payload, _lzTxParams.dstGasForCall);

        console.log("# BRIDGE.address: ", address(this));
        console.log("# BRIDGE.omniMint() => _mintParams.srcToken: ", _mintParams.srcToken);
        _lzSend(_remoteChainId, payload, _refundAddress, address(this), _txParamBuilder(_remoteChainId, _type, _lzTxParams), msg.value);
    }

    /**
        * @dev quote mint token on remote chain

        * `quoteLayerZeroFee` is a helper function to estimate the fees for minting a token on a remote chain.

        * `_type` is the type of minting operation to be performed on the remote chain.

        * If `_type` is `TYPE_DEPLOY_AND_MINT`, then `_userPayload` is the payload to be sent to the remote chain.

        * `_userPayload` is the payload to be sent to the remote chain.

        * Requirements:

            * - _remoteChainId must be valid

            * - _type must be valid

            * - _lzTxParams must be valid

            * - _payload must be valid

        * @param _remoteChainId remote chain id
        * @param _type mint type
        * @param _userPayload user payload
        * @param _lzTxParams layer zero tx params
    */
    function quoteLayerZeroFee(
        uint16 _remoteChainId,
        uint8 _type,
        bytes calldata _userPayload,
        Structs.LzTxObj memory _lzTxParams
    ) external view returns (uint256, uint256) {
        bytes memory payload;
        if (_type == Types.TYPE_DEPLOY_AND_MINT) {
            Structs.MintObj memory mintParams = Structs.MintObj(address(0x1), 1, address(0x1), "Name", "Symbol");
            payload = abi.encode(_type, mintParams, _userPayload, _lzTxParams.dstGasForCall);
        } else revert("OCPBridge: invalid quote type");

        bytes memory _txParams = _txParamBuilder(_remoteChainId, _type, _lzTxParams);
        return lzEndpoint.estimateFees(_remoteChainId, address(this), payload, useLzToken, _txParams);
    }

    /**
        * @dev build tx params

        * `gasLookup` is a helper function to estimate the fees for minting a token on a remote chain.

        * `_type` is the type of minting operation to be performed on the remote chain.

        * If `_type` is `TYPE_DEPLOY_AND_MINT`, then `_userPayload` is the payload to be sent to the remote chain.

        * `_userPayload` is the payload to be sent to the remote chain.

        * Requirements:

            * - _chainId must be valid

            * - _type must be valid

            * - _lzTxParams must be valid

        * @param _chainId remote chain id
        * @param _type mint type
        * @param _lzTxParams layer zero tx params
        * @return lzTxParam layer zero tx params
    */
    function _txParamBuilder(uint16 _chainId, uint8 _type, Structs.LzTxObj memory _lzTxParams) internal view returns (bytes memory) {
        bytes memory lzTxParam;
        address dstNativeAddr;
        {
            bytes memory dstNativeAddrBytes = _lzTxParams.dstNativeAddr;
            assembly {
                dstNativeAddr := mload(add(dstNativeAddrBytes, 20))
            }
        }

        uint256 totalGas = gasLookup[_chainId][_type] + _lzTxParams.dstGasForCall;
        if (_lzTxParams.dstNativeAmount > 0 && dstNativeAddr != address(0x0)) {
            lzTxParam = abi.encodePacked(uint16(2), totalGas, _lzTxParams.dstNativeAmount, _lzTxParams.dstNativeAddr);
        } else {
            lzTxParam = abi.encodePacked(uint16(1), totalGas);
        }

        return lzTxParam;
    }

    /**
        * @dev receive token from remote chain

        * If `_type` is `TYPE_DEPLOY_AND_MINT`, then `_userPayload` is the payload to be sent to the remote chain.

        * `_userPayload` is the payload to be sent to the remote chain.

        * If `_type` is `TYPE_DEPLOY_AND_MINT`, it will invoke `omniMintRemote` on the router contract.

        * Requirements:

            * - onlyRouter

            * - _srcChainId must be valid

            * - _srcAddress must be valid

            * - _nonce must be valid

            * - _payload must be valid

        * @param _srcChainId remote chain id
        * @param _srcAddress address to refund
        * @param _nonce nonce
        * @param _payload user payload
    */
    function _blockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal virtual override {
        console.log("# Bridge.address: ", address(this));

        uint8 _type;
        assembly {
            _type := mload(add(_payload, 32))
        }
        // routing types
//        if (_type == Types.TYPE_DEPLOY_AND_MINT)
        {
            (, Structs.MintObj memory _mintParams,
                bytes memory payload,
                uint256 _dstGasForCall
            ) = abi.decode(_payload, (uint8, Structs.MintObj, bytes, uint256));
            console.log("# Bridge._blockingLzReceive => _mintParams.srcToken:", _mintParams.srcToken);
            router.omniMintRemote(_srcChainId, _srcAddress, _nonce, _type == Types.TYPE_DEPLOY_AND_MINT, _mintParams,
                address(lzEndpoint), _dstGasForCall, payload);
        }
    }

    function updateTrustedRemotes(uint16[] calldata _remoteChainIds, bytes[] calldata _paths) external onlyOwner {
        require(_remoteChainIds.length == _paths.length, "OCPBridge: invalid params");
        for (uint256 i = 0; i < _remoteChainIds.length; i++) {
            trustedRemoteLookup[_remoteChainIds[i]] = _paths[i];
            emit SetTrustedRemote(_remoteChainIds[i], _paths[i]);
        }
    }

    /**
        * @dev update gas lookup

        * `updateGasLookups` is a helper function to update the gas lookup table.

        * `_chainIds` is the chain ids to be updated.

        * `_types` is the types to be updated.

        * The length of `_chainIds`, `_types` and `_gas` must be the same.

        * Requirements:

            * - onlyOwner

            * - _chainIds, _types, _gas must be valid

        * @param _chainIds remote chain ids
        * @param _types mint types
        * @param _gas gas
    */
    function updateGasLookups(uint16[] memory _chainIds, uint8[] memory _types, uint256[] memory _gas) external onlyOwner {
        require(_chainIds.length == _types.length && _chainIds.length == _gas.length, "OCPBridge: invalid params");
        for (uint256 i = 0; i < _chainIds.length; i++) {
            gasLookup[_chainIds[i]][_types[i]] = _gas[i];
        }
    }

    /**
        * @dev update router

        * `updateRouter` is a helper function to update the router contract.

        * `_router` is the new router contract address.

        * Requirements:

            * - onlyOwner

            * - _router must be valid

        * @param _router router address
    */
    function updateRouter(address _router) external onlyOwner {
        router = IOCPRouter(_router);
    }
}
