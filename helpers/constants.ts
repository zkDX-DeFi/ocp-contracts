import {ethers} from "ethers";

export const {AddressZero, MaxInt256: ApproveAmount} = ethers.constants
export const HASH_256_ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000"

// ChainIds
export const CHAIN_ID_LOCAL = "31337"
export const CHAIN_ID_LOCAL2 = "31338"
export const CHAIN_ID_LOCAL3 = "31339"
export const CHAIN_ID_GOERLI = "5";
export const CHAIN_ID_ZKSYNC_TESTNET = "280";
export const CHAIN_ID_BASE_TEST = "84531";

// OCP Types
export const TYPE_DEPLOY_AND_MINT = 1;
export const TYPE_MINT = 2;
export const TYPE_REDEEM = 3;

// Gas Limits
export const DEFAULT_GAS_LIMIT_1 = 4500000;
export const DEFAULT_GAS_LIMIT_2 = 300000;
export const DEFAULT_GAS_LIMIT_3 = 300000;

// LayerZero Endpoints
export const ENDPOINT_GOERLI = "0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23";
export const ENDPOINT_BASE_TESTNET = "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab";
export const ENDPOINT_ZKSYNC_TESTNET = "0x093D2CF57f764f09C3c2Ac58a42A2601B8C79281";
