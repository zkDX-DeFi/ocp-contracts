// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;
import "@uniswap/v2-core/contracts/UniswapV2Pair.sol";

contract MockUniswapV2Factory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function createPair(address tokenA, address tokenB) external returns(address pairAddress) {
        require(tokenA != tokenB, 'UniswapV2: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'UniswapV2: ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'UniswapV2: PAIR_EXISTS'); // single check is sufficient


        UniswapV2Pair pair = new UniswapV2Pair();
        pairAddress = address(pair);

        
        IUniswapV2Pair(pairAddress).initialize(token0, token1);
        getPair[token0][token1] = pairAddress;
        getPair[token1][token0] = pairAddress; // populate mapping in the reverse direction
        allPairs.push(pairAddress);
        emit PairCreated(token0, token1, pairAddress, allPairs.length);
    }
}
