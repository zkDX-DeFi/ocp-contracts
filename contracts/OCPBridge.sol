// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@layerzerolabs/solidity-examples/contracts/lzApp/LzApp.sol";
import "./interfaces/IOCPBridge.sol";
import "./libraries/Structs.sol";
import "./libraries/Types.sol";

contract OCPBridge is LzApp, IOCPBridge {

    address public router;
    mapping(uint16 => mapping(uint8 => uint256)) public gasLookup; // chainId -> type -> gas
    bool public useLzToken;

    constructor(address _router, address _lzEndpoint) LzApp(_lzEndpoint) {
        router = _router;
    }

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
    ) external payable onlyRouter {
    }

    function omniRedeem(
        uint16 _remoteChainId,
        address payable _refundAddress,
        uint8 _type,
        Structs.RedeemObj memory _redeemParams,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external payable onlyRouter {
    }

    function quoteLayerZeroFee(
        uint16 _remoteChainId,
        uint8 _type,
        bytes calldata _userPayload,
        Structs.LzTxObj memory _lzTxParams
    ) external view returns (uint256, uint256) {
        return (0, 0);
    }

    function _blockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal virtual override {
        uint8 _type;
        assembly {
            _type := mload(add(_payload, 32))
        }

        // routing types
    }

}
