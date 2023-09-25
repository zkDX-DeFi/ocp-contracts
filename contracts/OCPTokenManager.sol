// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOCPTokenFactory.sol";
import "./interfaces/IOCPTokenManager.sol";
import "./libraries/Structs.sol";
import "./entity/OmniToken.sol";

contract OCPTokenManager is Ownable, IOCPTokenManager {

    address public router;
    address public bridge;
    IOCPTokenFactory public tokenFactory;
    mapping(address => mapping(uint16 => address)) public getOmniToken; // srcToken -> chainId -> omniToken
    mapping(address => mapping(uint16 => address)) public getSourceToken; // omniToken -> srcChainId -> srcToken

    address[] public omniTokens;
    mapping(address => bool) public isOmniToken;
    mapping(uint16 => string) public assetBaseURIs;
    uint16 public localLzChainId;

    event TokenCreated(address indexed srcToken, uint16 indexed chainId, address indexed token);

    modifier onlyRouter() {
        require(msg.sender == router, "OCPTokenManager: caller is not the router");
        _;
    }

    constructor(address _tokenFactory) {
        tokenFactory = IOCPTokenFactory(_tokenFactory);
    }

    function createToken(Structs.MintObj memory _mintParams, address _lzEndpoint, uint16 _srcChainId) external returns (address token) {
        // TF.createToken()
        return address(0x0);
    }

    function omniMint(address _srcToken, uint16 _dstChainId, uint256 _amount, address _to) external onlyRouter override returns (address token) {
        // OmniToken.mint()
        return address(0x0);
    }

    function omniBurn(address _omniToken, uint256 _amount, address _from) external onlyRouter override {
        // OmniToken.burn()
    }

    function addSourceToken(
        address _omniToken,
        uint16 _srcChainId,
        address _srcToken,
        address _srcPool,
        string calldata _symbolCheck
    ) external onlyOwner {
        //
    }

    function getAssetURIs(
        uint16[] calldata _chainIds,
        address[] calldata _pools
    ) public view override returns (string[] memory assetURIs){
        assetURIs = new string[](_chainIds.length);
    }

}
