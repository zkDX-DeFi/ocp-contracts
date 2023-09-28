// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
//import "@openzeppelin/contracts/access/Ownable.sol";

contract MockTM  {
    address public router;
    address[] public omniTokenList;
    mapping(address => mapping(uint16 => address)) public omniTokens; // srcToken -> srcChainId -> omniToken
    mapping(address => mapping(uint16 => address)) public sourceTokens; // omniToken -> srcChainId -> srcToken

    function createOmniToken() external returns(address _token) {
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
