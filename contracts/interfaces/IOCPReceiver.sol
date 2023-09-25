// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IOCPReceiver {

    function ocpReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint256 _nonce,
        address _token,
        uint256 _amount,
        bytes memory _payload
    ) external;
}
