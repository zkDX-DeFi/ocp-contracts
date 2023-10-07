// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOCPoolFactory.sol";
import "./interfaces/IOCPOmniTokenManager.sol";
import "./interfaces/IOCPRouter.sol";
import "./interfaces/IOCPReceiver.sol";
import "./interfaces/IOCPBridge.sol";
import "./interfaces/IWETH.sol";
import "./libraries/Types.sol";
import "hardhat/console.sol";

contract OCPRouter is IOCPRouter, Ownable, ReentrancyGuard {

    using SafeERC20 for IERC20;
    IOCPoolFactory public poolFactory;
    IOCPOmniTokenManager public tokenManager;
    IOCPBridge public bridge;
    address public weth;

    mapping(uint16 => mapping(bytes => mapping(uint256 => Structs.CachedMint))) public cachedMintLookup; // chainId -> src -> nonce -> cache

    event CachedMint(uint16 chainId, bytes srcAddress, uint256 nonce, address token, uint256 amount, address to, bytes payload, bytes reason);

    constructor(address _poolFactory, address _tokenManager, address _bridge, address _weth) {
        poolFactory = IOCPoolFactory(_poolFactory);
        tokenManager = IOCPOmniTokenManager(_tokenManager);
        bridge = IOCPBridge(_bridge);
        weth = _weth;
    }

    modifier onlyBridge() {
        require(msg.sender == address(bridge), "OCPRouter: caller is not the bridge");
        _;
    }

    function omniMint(
        uint16 _remoteChainId,
        address _token,
        uint256 _amountIn,
        address _to,
        bool _needDeploy,
        address payable _refundAddress,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external override payable {
        require(_token != address(0), "OCPRouter: token invalid");
        require(_to != address(0), "OCPRouter: receiver invalid");
        require(_amountIn > 0, "OCPRouter: amountIn must be greater than 0");

        // transfer token to pool
        address _pool = poolFactory.getPool(_token);
        if (_pool == address(0)) _pool = poolFactory.createPool(_token);
        IERC20(_token).safeTransferFrom(msg.sender, _pool, _amountIn);

        _omniMint(_token, _remoteChainId, _amountIn, _to, _needDeploy, _refundAddress, _payload, _lzTxParams, msg.value);
    }

//    function omniMintETH(
//        uint16 _remoteChainId,
//        uint256 _amountIn,
//        address _to,
//        bool _needDeploy,
//        address payable _refundAddress,
//        bytes memory _payload,
//        Structs.LzTxObj memory _lzTxParams
//    ) external payable {
//        require(msg.value > _amountIn, "OCPRouter: send value must be greater than amountIn");
//        require(weth != address(0), "OCPRouter: weth not set yet");
//        require(_to != address(0), "OCPRouter: receiver invalid");
//        require(_amountIn > 0, "OCPRouter: amountIn must be greater than 0");
//
//        {
//            // transfer weth to pool
//            IWETH(weth).deposit{value: _amountIn}();
//            address _pool = poolFactory.getPool(weth);
//            if (_pool == address(0)) _pool = poolFactory.createPool(weth);
//            IERC20(weth).safeTransfer(_pool, _amountIn);
//        }
//
//        _omniMint(weth, _remoteChainId, _amountIn, _to, _needDeploy, _refundAddress, _payload, _lzTxParams, msg.value - _amountIn);
//    }

    function _omniMint(
        address _token,
        uint16 _remoteChainId,
        uint256 _amountIn,
        address _to,
        bool _needDeploy,
        address payable _refundAddress,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams,
        uint256 _msgFee
    ) internal {

        Structs.MintObj memory mintParams;
        mintParams.srcToken = _token;
        mintParams.amount = _amountD18(_token, _amountIn);
        mintParams.to = _to;
        if (_needDeploy) {
            mintParams.name = IERC20Metadata(_token).name();
            mintParams.symbol = IERC20Metadata(_token).symbol();
        }

        uint8 _type = _needDeploy ? Types.TYPE_DEPLOY_AND_MINT : Types.TYPE_MINT;
        bridge.omniMint{value: _msgFee}(_remoteChainId, _refundAddress, _type, mintParams, _payload, _lzTxParams);
    }

    function _amountD18(address _token, uint256 _amount) internal view returns (uint256) {
        uint256 decimals = IERC20Metadata(_token).decimals();
        if (decimals == 18) return _amount;
        return _amount * (10 ** (18 - decimals));
    }

    function quoteLayerZeroFee(
        uint16 _remoteChainId,
        uint8 _type,
        bytes calldata _userPayload,
        Structs.LzTxObj memory _lzTxParams
    ) external view returns (uint256, uint256) {
        return bridge.quoteLayerZeroFee(_remoteChainId, _type, _userPayload, _lzTxParams);
    }

//    function omniRedeem(
//        uint16 _remoteChainId,
//        address _token,
//        uint256 _amountIn,
//        address _to,
//        address payable _refundAddress,
//        bytes memory _payload,
//        Structs.LzTxObj memory _lzTxParams
//    ) external override payable {
//        require(_to != address(0), "OCPRouter: receiver invalid");
//        require(_amountIn > 0, "OCPRouter: amountIn must be greater than 0");
//
//    }

    function omniMintRemote(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint256 _nonce,
        bool _needDeploy,
        Structs.MintObj memory _mintParams,
        address _lzEndpoint,
        uint256 _dstGasForCall,
        bytes memory _payload
    ) external onlyBridge {
        address token;
        if (_needDeploy)
            token = tokenManager.createOmniToken(_mintParams, _lzEndpoint, _srcChainId);
        // else token = tokenManager.omniMint(_mintParams.srcToken, _mintParams.dstChainId, _mintParams.amount, _mintParams.to);
        if (_payload.length > 0) {
            try IOCPReceiver(_mintParams.to).ocpReceive{gas: _dstGasForCall}(_srcChainId, _srcAddress, _nonce, token,
                _mintParams.amount, _payload){} catch (bytes memory reason) {
                console.logBytes(reason);
                // save failed payload to cache
                cachedMintLookup[_srcChainId][_srcAddress][_nonce] = Structs.CachedMint(token, _mintParams.amount, _mintParams.to, _payload);
                emit CachedMint(_srcChainId, _srcAddress, _nonce, token, _mintParams.amount, _mintParams.to, _payload, reason);
            }
        }
    }

//    function omniRedeemRemote(
//        uint16 _srcChainId,
//        bytes memory _srcAddress,
//        uint256 _nonce,
//        Structs.RedeemObj memory _redeemParams,
//        uint256 _dstGasForCall,
//        bytes memory _payload
//    ) external onlyBridge {
//    }

//    function retryCachedMint(uint16 _srcChainId, bytes calldata _srcAddress, uint256 _nonce) external {
//        Structs.CachedMint memory cm = cachedMintLookup[_srcChainId][_srcAddress][_nonce];
//        //        require(cm.to != address(0x0), "OCPRouter: no cache found");
//    }

    function updateBridge(address _bridge) external onlyOwner {
        bridge = IOCPBridge(_bridge);
    }
}
