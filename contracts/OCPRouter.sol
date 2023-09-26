// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOCPPoolFactory.sol";
import "./interfaces/IOCPTokenManager.sol";
import "./interfaces/IOCPRouter.sol";
import "./interfaces/IOCPReceiver.sol";
import "./interfaces/IOCPBridge.sol";
import "./libraries/Types.sol";

contract OCPRouter is IOCPRouter, Ownable, ReentrancyGuard {

    using SafeERC20 for IERC20;
    IOCPoolFactory public poolFactory;
    IOCPTokenManager public tokenManager;
    IOCPBridge public bridge;

    uint256 public mintFeeBasisPoint;
    uint8 public defaultSharedDecimals;
    address public feeReceiver;
    address public weth;

    mapping(uint16 => mapping(bytes => mapping(uint256 => Structs.CachedMint))) public cachedMintLookup; // chainId -> src -> nonce -> cache

    event CachedMint(uint16 chainId, bytes srcAddress, uint256 nonce, address token, uint256 amount, address to, bytes payload, bytes reason);

    constructor(address _poolFactory, address _tokenManager, address _weth) {
        poolFactory = IOCPoolFactory(_poolFactory);
        tokenManager = IOCPTokenManager(_tokenManager);
        defaultSharedDecimals = 8; // up to 184b
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
        address payable _refundAddress,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external override payable {
        require(_token != address(0), "OCPRouter: token invalid");
        require(_to != address(0), "OCPRouter: receiver invalid");
        require(_amountIn > 0, "OCPRouter: amountIn must be greater than 0");

        /* fake code */
        //
        // A_CHAIN.IOCPPoolFactory(_poolFactoryAddress).createPool();
        // _TOKEN will be deposited to the `pool`

    }

    function omniMintETH(
        uint16 _remoteChainId,
        uint256 _amountIn,
        address _to,
        address payable _refundAddress,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external payable {
        require(msg.value > _amountIn, "OCPRouter: send value must be greater than amountIn");
        require(weth != address(0), "OCPRouter: weth not set yet");
        require(_to != address(0), "OCPRouter: receiver invalid");
        require(_amountIn > 0, "OCPRouter: amountIn must be greater than 0");

    }

    function quoteLayerZeroFee(
        uint16 _remoteChainId,
        uint8 _type,
        bytes calldata _userPayload,
        Structs.LzTxObj memory _lzTxParams
    ) external view returns (uint256, uint256) {
        return bridge.quoteLayerZeroFee(_remoteChainId, _type, _userPayload, _lzTxParams);
    }

    function omniRedeem(
        uint16 _remoteChainId,
        address _token,
        uint256 _amountIn,
        address _to,
        address payable _refundAddress,
        bytes memory _payload,
        Structs.LzTxObj memory _lzTxParams
    ) external override payable {
        require(_to != address(0), "OCPRouter: receiver invalid");
        require(_amountIn > 0, "OCPRouter: amountIn must be greater than 0");

    }

    function omniMintRemote(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint256 _nonce,
        bool _needDeploy,
        Structs.MintObj memory _mintParams,
        uint256 _dstGasForCall,
        bytes memory _payload
    ) external onlyBridge {
    }

    function omniRedeemRemote(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint256 _nonce,
        Structs.RedeemObj memory _redeemParams,
        uint256 _dstGasForCall,
        bytes memory _payload
    ) external onlyBridge {
    }

    function retryCachedMint(uint16 _srcChainId, bytes calldata _srcAddress, uint256 _nonce) external {
        Structs.CachedMint memory cm = cachedMintLookup[_srcChainId][_srcAddress][_nonce];
        require(cm.to != address(0x0), "OCPRouter: no cache found");
    }

    function updateBridge(address _bridge) external onlyOwner {
        bridge = IOCPBridge(_bridge);
    }
}
