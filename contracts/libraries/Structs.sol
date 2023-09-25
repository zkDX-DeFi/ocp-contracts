// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Structs {

    struct LzTxObj {
        uint256 dstGasForCall;
        uint256 dstNativeAmount;
        bytes dstNativeAddr;
    }

    struct MintObj {
        address srcToken;
        address srcPool;
        uint16 dstChainId;
        uint256 amount;
        address to;
        string name;
        string symbol;
        uint8 sharedDecimals;
    }

    struct RedeemObj {
        address srcToken;
        uint16 dstChainId;
        uint256 amount;
        address to;
    }

    struct CachedMint {
        address token;
        uint256 amount;
        address to;
        bytes payload;
    }
}
