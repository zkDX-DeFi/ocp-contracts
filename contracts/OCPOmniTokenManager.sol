// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOCPOmniTokenManager.sol";
import "./libraries/Structs.sol";
import "./entity/OmniToken.sol";

contract OCPOmniTokenManager is Ownable, IOCPOmniTokenManager {
    address public router;
//    address[] public omniTokenList;
    mapping(address => mapping(uint16 => address)) public omniTokens; // srcToken -> srcChainId -> omniToken
    mapping(address => mapping(uint16 => address)) public sourceTokens; // omniToken -> srcChainId -> srcToken
    event TokenCreated(address indexed srcToken, uint16 indexed srcChainId, address indexed token);
    modifier onlyRouter() {
        require(msg.sender == router, "OCPTokenManager: caller is not the router");
        _;
    }

    //PUBLIC FUNC
    function createOmniToken(
        Structs.MintObj memory _mintParams,
        address _lzEndpoint,
        uint16 _srcChainId
    ) external returns (address token) {  // TODO: onlyRouter
        token  = omniTokens[_mintParams.srcToken][_srcChainId];
        if (token != address(0x0)) return token;

        OmniToken newToken = new OmniToken{salt: keccak256(abi.encodePacked(_mintParams.srcToken))}(
            _mintParams.name,
            _mintParams.symbol,
            _mintParams.amount,
            _mintParams.to,
            _lzEndpoint
        );
        token = address(newToken);

        omniTokens[_mintParams.srcToken][_srcChainId] = token;
        sourceTokens[token][_srcChainId] = _mintParams.srcToken;
//        omniTokenList.push(token);
        emit TokenCreated(_mintParams.srcToken, _srcChainId, token);
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
        address[] calldata _srcTokens,
        uint16[] calldata _srcChainIds,
        address _omniToken
    ) external {
        // TODO: alternative to addSourceToken -- 1
        // add srcToken => chainId => omniToken
        require(_srcTokens.length == _srcChainIds.length, "OCPTokenManager: invalid input");
        for (uint256 i = 0; i < _srcTokens.length; i++) {
            sourceTokens[_srcTokens[i]][_srcChainIds[i]] = _omniToken;
        }
    }
    function approveSourceTokens(address[] calldata _omniTokens, uint16 _srcChainId, address[] calldata _srcTokens) external {
        // TODO: alternative to addSourceToken -- 2
        // only Dao or Owner

        require(_omniTokens.length == _srcTokens.length, "OCPTokenManager: invalid input");
        for (uint256 i = 0; i < _omniTokens.length; i++) {
            sourceTokens[_omniTokens[i]][_srcChainId] = _srcTokens[i];
        }
    }
    //Settings
    function updateRouter(address _router) external onlyOwner {
        router = _router;
    }
}
