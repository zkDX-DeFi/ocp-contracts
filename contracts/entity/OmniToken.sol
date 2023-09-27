// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";
import "../interfaces/IOCPOmniTokenManager.sol";
import "../interfaces/IOCPBridge.sol";
contract OmniToken is OFT {

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _mintAmount,
        address _to,
        address _lzEndpoint
    ) OFT (_name, _symbol, _lzEndpoint) {
        if (_mintAmount > 0) _mint(_to, _mintAmount);
    }
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }
    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }
}
