// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "./interfaces/IOCPBridge.sol";
import "./interfaces/IOCPRouter.sol";
import "./libraries/Structs.sol";
import "./libraries/Types.sol";

contract OCPBridge is NonblockingLzApp, IOCPBridge {
    IOCPRouter public router;
    mapping(uint16 => mapping(uint8 => uint256)) public gasLookup; // chainId -> type -> gas
    bool public useLzToken;
    constructor(address _lzEndpoint) NonblockingLzApp(_lzEndpoint) {}

    event RevertMessageSuccess(uint16 _srcChainId, bytes _srcAddress, uint64 _nonce, bytes32 _payloadHash);
    modifier onlyRouter() {
        require(msg.sender == address(router), "OCPBridge: caller is not the router");
        _;
    }

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

    function omniRedeem(
        uint16 _remoteChainId,
        address payable _refundAddress,
        uint8 _type,
        Structs.RedeemObj memory _redeemParams,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external payable onlyRouter {
        bytes memory payload = abi.encode(_type, _redeemParams, _payload, _lzTxParams.dstGasForCall);
        _lzSend(_remoteChainId, payload, _refundAddress, address(this), _txParamBuilder(_remoteChainId, _type, _lzTxParams), msg.value);
    }

    function quoteLayerZeroFee(
        uint16 _remoteChainId,
        uint8 _type,
        bytes calldata _userPayload,
        Structs.LzTxObj memory _lzTxParams
    ) external view returns (uint256, uint256) {
        bytes memory payload;
        if (_type == Types.TYPE_DEPLOY_AND_MINT || _type == Types.TYPE_MINT) {
            Structs.MintObj memory mintParams = Structs.MintObj(address(0x1), address(0x1), 1, address(0x1), "Name", "Symbol");
            payload = abi.encode(_type, mintParams, _userPayload, _lzTxParams.dstGasForCall);
        } else if (_type == Types.TYPE_REDEEM) {
            Structs.RedeemObj memory redeemParams = Structs.RedeemObj(address(0x1), address(0x1), 1, address(0x1));
            payload = abi.encode(_type, redeemParams, _userPayload, _lzTxParams.dstGasForCall);
        } else revert("OCPBridge: invalid quote type");

        bytes memory _txParams = _txParamBuilder(_remoteChainId, _type, _lzTxParams);
        return lzEndpoint.estimateFees(_remoteChainId, address(this), payload, useLzToken, _txParams);
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
    function _nonblockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal virtual override {
        uint8 _type;
        assembly {
            _type := mload(add(_payload, 32))
        }

        if (_type == Types.TYPE_DEPLOY_AND_MINT || _type == Types.TYPE_MINT) {
            (, Structs.MintObj memory _mintParams,
                bytes memory payload,
                uint256 _dstGasForCall
            ) = abi.decode(_payload, (uint8, Structs.MintObj, bytes, uint256));
            router.omniMintRemote(_srcChainId, _srcAddress, _nonce, _type, _mintParams,
                address(lzEndpoint), _dstGasForCall, payload);
        } else if (_type == Types.TYPE_REDEEM) {
            (, Structs.RedeemObj memory _redeemParams,
                bytes memory payload,
                uint256 _dstGasForCall
            ) = abi.decode(_payload, (uint8, Structs.RedeemObj, bytes, uint256));
            router.omniRedeemRemote(_srcChainId, _srcAddress, _nonce, _redeemParams, _dstGasForCall, payload);
        }
    }

    function revertMessage(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) public payable virtual {
        bytes32 payloadHash = failedMessages[_srcChainId][_srcAddress][_nonce];
        require(payloadHash != bytes32(0), "OCPBridge: no stored message");
        require(keccak256(_payload) == payloadHash, "OCPBridge: invalid payload");
        failedMessages[_srcChainId][_srcAddress][_nonce] = bytes32(0);

        uint8 _type;
        assembly {
            _type := mload(add(_payload, 32))
        }

        uint8 revertType;
        bytes memory revertPayload;
        if (_type == Types.TYPE_DEPLOY_AND_MINT || _type == Types.TYPE_MINT) {
            revertType = Types.TYPE_REDEEM;
            (,Structs.MintObj memory _mintParams,,) = abi.decode(_payload, (uint8, Structs.MintObj, bytes, uint256));
            revertPayload = abi.encode(Types.TYPE_REDEEM,
                Structs.RedeemObj(_mintParams.srcToken, address(0x1), _mintParams.amount, _mintParams.sender), "", 0);
        } else if (_type == Types.TYPE_REDEEM) {
            revertType = Types.TYPE_MINT;
            (,Structs.RedeemObj memory _redeemParams,,) = abi.decode(_payload, (uint8, Structs.RedeemObj, bytes, uint256));
            revertPayload = abi.encode(Types.TYPE_MINT,
                Structs.MintObj(_redeemParams.srcToken, address(0x1), _redeemParams.amount, _redeemParams.sender, "", ""), "", 0);
        }

        _lzSend(_srcChainId, revertPayload, payable(msg.sender), address(this), _txParamBuilder(_srcChainId, revertType,
            Structs.LzTxObj(0, 0, "")), msg.value);

        emit RevertMessageSuccess(_srcChainId, _srcAddress, _nonce, payloadHash);
    }

    function updateTrustedRemotes(uint16[] calldata _remoteChainIds, bytes[] calldata _paths) external onlyOwner {
        require(_remoteChainIds.length == _paths.length, "OCPBridge: invalid params");
        for (uint256 i = 0; i < _remoteChainIds.length; i++) {
            trustedRemoteLookup[_remoteChainIds[i]] = _paths[i];
            emit SetTrustedRemote(_remoteChainIds[i], _paths[i]);
        }
    }
    function updateGasLookups(uint16[] memory _chainIds, uint8[] memory _types, uint256[] memory _gas) external onlyOwner {
        require(_chainIds.length == _types.length && _chainIds.length == _gas.length, "OCPBridge: invalid params");
        for (uint256 i = 0; i < _chainIds.length; i++) {
            gasLookup[_chainIds[i]][_types[i]] = _gas[i];
        }
    }
    function updateRouter(address _router) external onlyOwner {
        router = IOCPRouter(_router);
    }
}
