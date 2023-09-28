// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "../entity/OmniToken.sol";
import "../libraries/Structs.sol";

contract MockTM  {
    address public router;
    address public owner;
    mapping(address => mapping(uint16 => address)) public omniTokens; // srcToken -> srcChainId -> omniToken
    mapping(address => mapping(uint16 => address)) public sourceTokens; // omniToken -> srcChainId -> srcToken

    constructor (address _router) {
        router = _router;
        owner = msg.sender;
    }
    modifier onlyRouter() {
        require(msg.sender == router, "OCPTokenManager: caller is not the router");
        _;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "OCPTokenManager: caller is not the owner");
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
    }
    function omniMint() external returns(address _token) {
    }
    function omniBurn() external returns(address _token) {
    }

    function requestAddSourceTokens() external {
    }
    function approveSourceTokens() external {
    }
    function updateRouter(address _router) external onlyOwner {
        router = _router;
    }
}
