// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOCPOmniTokenManager.sol";
import "./libraries/Structs.sol";
import "./entity/OmniToken.sol";

contract OCPOmniTokenManager is Ownable, IOCPOmniTokenManager {
    address public router;
    address[] public omniTokenList;
    mapping(uint16 => string) public assetBaseURIs;
    mapping(address => mapping(uint16 => address)) public omniTokens; // srcToken -> srcChainId -> omniToken
    mapping(address => mapping(uint16 => address)) public sourceTokens; // omniToken -> srcChainId -> srcToken
    event TokenCreated(address indexed srcToken, uint16 indexed chainId, address indexed token);
    modifier onlyRouter() {
        require(msg.sender == router, "OCPTokenManager: caller is not the router");
        _;
    }
    constructor() {
    }

    //PUBLIC FUNC
    function createOmniToken(
        Structs.MintObj memory _mintParams,
        address _lzEndpoint,
        uint16 _srcChainId
    ) external returns (address token) {
        OmniToken newToken = new OmniToken{salt: keccak256(abi.encodePacked("OCP_CREATE_TOKEN", _mintParams.srcToken))}(
            _mintParams.name,
            _mintParams.symbol,
            _mintParams.amount,
            _mintParams.to,
            _lzEndpoint,
            address(this),
            _srcChainId,
            _mintParams.srcPool
        );
        token = address(newToken);
    }
    function omniMint(address _srcToken, uint16 _dstChainId, uint256 _amount, address _to) external onlyRouter override returns (address token) {
        //todo: v0.2: TYPES=2
        return address(0x0);
    }
    function omniBurn(address _omniToken, uint256 _amount, address _from) external onlyRouter override {
        //todo: v0.3: TYPES=3
    }
    //DAO
    function requestAddSourceTokens(
        address _omniToken,
        uint16[] calldata _srcChainIds,
        address[] calldata _srcTokens
    ) external {
        // TODO: alternative to addSourceToken -- 1
        // add srcToken => chainId => omniToken
    }
    function approveSourceTokens() external {
        // TODO: alternative to addSourceToken -- 2
        // only Dao or Owner
    }
    //Settings
    function updateRouter(address _router) external onlyOwner {
        router = _router;
    }
}
