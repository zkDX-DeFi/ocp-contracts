// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./interfaces/IOCPOmniTokenManager.sol";
import "./interfaces/IOmniToken.sol";
import "./libraries/Structs.sol";
import "./entity/OmniToken.sol";

contract OCPOmniTokenManager is IOCPOmniTokenManager {
    address public router;
    address public timeLock;
    mapping(address => mapping(uint16 => address)) public omniTokens; // srcToken -> srcChainId -> omniToken
    mapping(address => mapping(uint16 => address)) public sourceTokens; // omniToken -> srcChainId -> srcToken
    address[] public omniTokenList;
    event TokenCreated(address indexed srcToken, uint16 indexed srcChainId, address indexed token);
    modifier onlyRouter() {
        require(msg.sender == router, "OCPTokenManager: caller is not the router");
        _;
    }
    modifier onlyTimeLock() {
        require(msg.sender == timeLock, "OCPTokenManager: caller is not the timelock");
        _;
    }

    constructor () {
        timeLock = msg.sender;
    }
    function createOmniToken(
        Structs.MintObj memory _mintParams,
        address _lzEndpoint,
        uint16 _srcChainId
    ) external returns (address token) {  // TODO: onlyRouter
        token = omniTokens[_mintParams.srcToken][_srcChainId];
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
        omniTokenList.push(token);
        emit TokenCreated(_mintParams.srcToken, _srcChainId, token);
    }

    function omniMint(
        Structs.MintObj memory _mintParams,
        uint16 _srcChainId
    ) external onlyRouter override returns (address token) {
        token = omniTokens[_mintParams.srcToken][_srcChainId];
        require(token != address(0x0), "OCPTokenManager: omni token is not deployed yet");
        IOmniToken(token).mint(_mintParams.to, _mintParams.amount);
    }

    function omniBurn(address _omniToken, uint256 _amount, address _from) external onlyRouter override {
        IOmniToken(_omniToken).burn(_from, _amount);
    }

    function getOmniTokenList() external view returns (address[] memory) {
        return omniTokenList;
    }

    function addSourceTokens(address[] calldata _srcTokens, uint16[] calldata _srcChainIds, address[] calldata _omniTokens) external onlyTimeLock {
        require(_srcTokens.length == _srcChainIds.length && _srcTokens.length == _omniTokens.length, "OCPTokenManager: invalid length");
        for (uint256 i = 0; i < _srcTokens.length; i++) {
            omniTokens[_srcTokens[i]][_srcChainIds[i]] = _omniTokens[i];
            sourceTokens[_omniTokens[i]][_srcChainIds[i]] = _srcTokens[i];
        }
    }

    function updateRouter(address _router) external onlyTimeLock {
        router = _router;
    }

    function updateTimeLock(address _timeLock) external onlyTimeLock {
        timeLock = _timeLock;
    }
}
