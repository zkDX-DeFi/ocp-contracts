// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";
import "../interfaces/IOCPOmniTokenManager.sol";
import "../interfaces/IOCPBridge.sol";
contract OmniToken is OFT {
    /**
        * @dev Constructor that gives msg.sender all of existing tokens.

        * - The token is created with a name, symbol, and 18 decimals

        * - If the mintAmount is greater than 0, the token is minted to the address specified

        * @param _name the name of the token
        * @param _symbol the symbol of the token
        * @param _mintAmount the amount of tokens to mint
        * @param _to the address to mint the tokens to
        * @param _lzEndpoint the LayerZero endpoint to use
    */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _mintAmount,
        address _to,
        address _lzEndpoint
    ) OFT (_name, _symbol, _lzEndpoint) {
        if (_mintAmount > 0) _mint(_to, _mintAmount);
    }

    /**
        * @dev Mints tokens to the specified address

        * - Can only be called by the owner

        * @param account the address to mint the tokens to
        * @param amount the amount of tokens to mint
    */
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    /**
        * @dev Burns tokens from the specified address

        * - Can only be called by the owner

        * @param account the address to burn the tokens from
        * @param amount the amount of tokens to burn
    */
    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }
}
