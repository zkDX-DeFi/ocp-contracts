// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/Structs.sol";

interface IOmniToken is IERC20, IERC20Metadata {

    function mint(address account, uint256 amount) external;

    function burn(address account, uint256 amount) external;

    function updateSourcePool(uint16 _srcChainId, address _srcPool) external;

    function setTrustedRemote(uint16 _remoteChainId, bytes calldata _path) external;

    function lzReceive(
        uint16 _srcChainId,
        bytes calldata _srcAddress,
        uint64 _nonce,
        bytes calldata _payload
    ) external;

}
