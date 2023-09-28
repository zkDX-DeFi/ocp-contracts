// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
//import "@openzeppelin/contracts/access/Ownable.sol";
import "../entity/OmniToken.sol";
import "../libraries/Structs.sol";

contract MockTM  {
    address public router;
    address[] public omniTokenList;
    mapping(address => mapping(uint16 => address)) public omniTokens; // srcToken -> srcChainId -> omniToken
    mapping(address => mapping(uint16 => address)) public sourceTokens; // omniToken -> srcChainId -> srcToken

    function createOmniToken(
        Structs.MintObj memory _mintParams,
        address _lzEndpoint
    ) external returns(address _token) {
        OmniToken newToken = new OmniToken{salt: keccak256(abi.encodePacked(address(this)))}(
            _mintParams.name,
            _mintParams.symbol,
            _mintParams.amount,
            _mintParams.to,
            _lzEndpoint);

        _token = address (newToken);


    }
    function omniMint() external returns(address _token) {
    }
    function omniBurn() external returns(address _token) {
    }

    function requestAddSourceTokens() external {
    }
    function approveSourceTokens() external {
    }
    function updateRouter(address _router) external {
        router = _router;
    }
}
