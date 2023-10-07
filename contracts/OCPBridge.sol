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

    //TYPES = 1
    function omniMint(
        uint16 _remoteChainId,
        address payable _refundAddress,
        uint8 _type,
        Structs.MintObj memory _mintParams,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external payable { // TODO: onlyRouter
        bytes memory payload = abi.encode(_type, _mintParams, _payload, _lzTxParams.dstGasForCall);
        _lzSend(_remoteChainId, payload, _refundAddress, address(this), _txParamBuilder(_remoteChainId, _type, _lzTxParams), msg.value);
    }

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
        return lzEndpoint.estimateFees(_remoteChainId, address(this), abi.encodePacked(address(this)), useLzToken, _txParams);
    }

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

    function _blockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal virtual override {
        uint8 _type;
        assembly {
            _type := mload(add(_payload, 32))
        }
        // routing types
        if (_type == Types.TYPE_DEPLOY_AND_MINT) {
            (, Structs.MintObj memory _mintParams,
                bytes memory payload,
                uint256 _dstGasForCall
            ) = abi.decode(_payload, (uint8, Structs.MintObj, bytes, uint256));
            console.log("# Type1 Received Suc, Deploy Token:", _mintParams.name);
            router.omniMintRemote(_srcChainId, _srcAddress, _nonce, _type == Types.TYPE_DEPLOY_AND_MINT, _mintParams,
                address(lzEndpoint), _dstGasForCall, payload);
        }
    }

    function updateGasLookup(uint16[] memory _chainIds, uint8[] memory _types, uint256[] memory _gas) external onlyOwner {
        require(_chainIds.length == _types.length && _chainIds.length == _gas.length, "OCPBridge: invalid params");
        for (uint256 i = 0; i < _chainIds.length; i++) {
            gasLookup[_chainIds[i]][_types[i]] = _gas[i];
        }
    }

    function updateRouter(address _router) external onlyOwner {
        router = IOCPRouter(_router);
    }
}
