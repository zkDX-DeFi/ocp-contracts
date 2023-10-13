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
        address sender;
        uint256 amount;
        address to;
        string name;
        string symbol;
    }

    struct RedeemObj {
        address srcToken;
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
