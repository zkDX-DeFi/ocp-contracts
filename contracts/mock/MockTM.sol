// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "../entity/OmniToken.sol";
import "../libraries/Structs.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IOCPOmniTokenManager.sol";

contract MockTM is Ownable,IOCPOmniTokenManager {
    address public router;
    mapping(address => mapping(uint16 => address)) public omniTokens; // srcToken -> srcChainId -> omniToken
    mapping(address => mapping(uint16 => address)) public sourceTokens; // omniToken -> srcChainId -> srcToken
    event TokenCreated(address indexed srcToken, uint16 indexed srcChainId, address indexed token);

    constructor (address _router) {
        router = _router;
    }
    modifier onlyRouter() {
        require(msg.sender == router, "OCPTokenManager: caller is not the router");
        _;
    }

    function createOmniToken(
        Structs.MintObj memory _mintParams,
        address _lzEndpoint,
        uint16 _srcChainId
    ) external returns(address _token) {
        OmniToken newToken = new OmniToken{salt: keccak256(abi.encodePacked(address(this)))}(
            _mintParams.name,
            _mintParams.symbol,
            _mintParams.amount,
            _mintParams.to,
            _lzEndpoint);

        _token = address (newToken);
        omniTokens[_mintParams.srcToken][_srcChainId] = _token;
        sourceTokens[_token][_srcChainId] = _mintParams.srcToken;
        emit TokenCreated(_mintParams.srcToken, _srcChainId, _token);
    }
    function omniMint(
        address _srcToken,
        uint16 _dstChainId,
        uint256 _amount,
        address _to
    ) external override onlyRouter returns(address _token) {

    }
    function omniBurn(
        address _omniToken,
        uint256 _amount,
        address _from
    ) external onlyRouter {

    }

    function requestAddSourceTokens(
        address[] calldata _srcTokens,
        uint16[] calldata _srcChainIds,
        address _omniToken
    ) external {
        require(_srcTokens.length == _srcChainIds.length, "OCPTokenManager: invalid input");
        for (uint256 i = 0; i < _srcTokens.length; i++) {
            sourceTokens[_srcTokens[i]][_srcChainIds[i]] = _omniToken;
        }
    }
    function approveSourceTokens(address[] calldata _omniTokens, uint16 _srcChainId, address[] calldata _srcTokens) external {
        require(_omniTokens.length == _srcTokens.length, "OCPTokenManager: invalid input");
        for (uint256 i = 0; i < _omniTokens.length; i++) {
            sourceTokens[_omniTokens[i]][_srcChainId] = _srcTokens[i];
        }
    }
    function updateRouter(address _router) external onlyOwner {
        router = _router;
    }
}
