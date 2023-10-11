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

    /**
        * @dev Initializes the contract setting the deployer as the initial owner.

        * @param _poolFactory The address of the pool factory contract.
        * @param _tokenManager The address of the token manager contract.
        * @param _bridge The address of the bridge contract.
        * @param _weth The address of the WETH contract.
    */
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

    /**
        * @dev Transfers tokens from sender to receiver on the same chain.

        * If the `getPool` is not deployed, it will be deployed.

        * If the `getPool` is deployed, it will be used.

        * `_token` cannot be the zero address and it will be transferred from sender to receiver.

        * `_omniMint` will be called to mint the token on the receiver chain.

        * Requirements:

        * - `_token` cannot be the zero address.

        * - `_to` cannot be the zero address.

        * - `_amountIn` must be greater than 0.

        * @param _remoteChainId The chain id of the receiver.
        * @param _token The address of the token to transfer.
        * @param _amountIn The amount of tokens to transfer.
        * @param _to The address of the receiver.
        * @param _needDeploy Whether the token needs to be deployed on the receiver chain.
        * @param _refundAddress The address to refund the fee to.
        * @param _payload The payload to send to the receiver.
        * @param _lzTxParams The layer zero transaction parameters.
    */
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
        console.log("# OCPR.address: ", address(this));
        console.log("# OCPR.omniMint => _token: ", _token);

        require(_token != address(0), "OCPRouter: token invalid");
        require(_to != address(0), "OCPRouter: receiver invalid");
        require(_amountIn > 0, "OCPRouter: amountIn must be greater than 0");

        address _pool = poolFactory.getPool(_token);
        if (_pool == address(0)) _pool = poolFactory.createPool(_token);
        IERC20(_token).safeTransferFrom(msg.sender, _pool, _amountIn);

        _omniMint(_token, _remoteChainId, _amountIn, _to, _needDeploy, _refundAddress, _payload, _lzTxParams, msg.value);
    }

    /**
        * @dev Transfers tokens from sender to receiver on the same chain.

        * If the `_needDeploy` is true, the token will be deployed on the receiver chain and `type` will be `TYPE_DEPLOY_AND_MINT`.

        * If the `_needDeploy` is false, the token will not be deployed on the receiver chain and `type` will be `TYPE_MINT`.

        * Requirements:

            * - `_token` cannot be the zero address.

            * - `_to` cannot be the zero address.

            * - `_amountIn` must be greater than 0.

        * @param _token The address of the token to transfer.
        * @param _remoteChainId The chain id of the receiver.
        * @param _amountIn The amount of tokens to transfer.
        * @param _to The address of the receiver.
        * @param _needDeploy Whether the token needs to be deployed on the receiver chain.
        * @param _refundAddress The address to refund the fee to.
        * @param _payload The payload to send to the receiver.
        * @param _lzTxParams The layer zero transaction parameters.
        * @param _msgFee The fee to send to the bridge.
    */
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

    /**
        * @dev return the amount of token for the given amount of token on the other chain.

        * @param _token The address of the token.
        * @param _amount The amount of token.
        * @return The amount of token on the other chain.
    */
    function _amountD18(address _token, uint256 _amount) internal view returns (uint256) {
        uint256 decimals = IERC20Metadata(_token).decimals();
        if (decimals == 18) return _amount;
        return _amount * (10 ** (18 - decimals));
    }

    /**
        * @dev Transfers tokens from sender to receiver on the same chain.

        * Invoke the `bridge` to get quote for the fee and amount of token on the other chain.

        * @param _remoteChainId The chain id of the receiver.
        * @param _type The type of the transaction.
        * @param _userPayload The payload to send to the receiver.
        * @param _lzTxParams The layer zero transaction parameters.
        * @return The amount of token on the other chain and the fee to send to the bridge.
    */
    function quoteLayerZeroFee(
        uint16 _remoteChainId,
        uint8 _type,
        bytes calldata _userPayload,
        Structs.LzTxObj memory _lzTxParams
    ) external view returns (uint256, uint256) {
        return bridge.quoteLayerZeroFee(_remoteChainId, _type, _userPayload, _lzTxParams);
    }

    /**
        * @dev Transfers tokens from sender to receiver on the same chain.

        * Requirements:

            * - `_token` cannot be the zero address.

            * - `_to` cannot be the zero address.

            * - `_amountIn` must be greater than 0.

            * - only the bridge can call this function.

        * @param _srcChainId The chain id of the sender.
        * @param _srcAddress The address of the sender.
        * @param _nonce The nonce of the transaction.
        * @param _needDeploy Whether the token needs to be deployed on the receiver chain.
        * @param _mintParams The mint parameters.
        * @param _lzEndpoint The layer zero endpoint.
        * @param _dstGasForCall The gas for the call.
        * @param _payload The payload to send to the receiver.
    */
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
        console.log("# OCPR.address: ", address(this));
        console.log("# OCPR.omniMintRemote => _mintParams.srcToken: ", _mintParams.srcToken);
        console.log("# OCPR.omniMintRemote => _needDeploy: ", _needDeploy);
        if (_needDeploy)
            token = tokenManager.createOmniToken(_mintParams, _lzEndpoint, _srcChainId);
        else
            token = tokenManager.omniMint(_mintParams, _srcChainId);

        if (_payload.length > 0) {
            console.log("# OCPR.omniMintRemote => _payload.length>0");
            try IOCPReceiver(_mintParams.to).ocpReceive{gas: _dstGasForCall}(_srcChainId, _srcAddress, _nonce, token,
                _mintParams.amount, _payload){} catch (bytes memory reason) {
                console.log("OCPR.omniMintRemote => catch(bytes memory reason)");
                cachedMintLookup[_srcChainId][_srcAddress][_nonce] = Structs.CachedMint(token, _mintParams.amount, _mintParams.to, _payload);
                emit CachedMint(_srcChainId, _srcAddress, _nonce, token, _mintParams.amount, _mintParams.to, _payload, reason);
            }
        }
    }

    /**
        * @dev update the bridge address.

        * Requirements:

            * - only the owner can call this function.

        * @param _bridge The address of the bridge contract.
    */
    function updateBridge(address _bridge) external onlyOwner {
        bridge = IOCPBridge(_bridge);
    }
}
