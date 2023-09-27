// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "../libraries/Structs.sol";

interface IOCPOmniTokenFactory {

    function createToken(
        Structs.MintObj memory _mintParams,
        address _lzEndpoint,
        uint16 _srcChainId
    ) external returns (address token);

}
