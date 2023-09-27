import {deployments, ethers, run} from "hardhat";
import {AddressZero, ApproveAmount, CHAIN_ID_LOCAL, CHAIN_ID_LOCAL2} from "./constants";
import {BigNumber, Wallet} from "ethers";
import {formatEther, parseEther} from "ethers/lib/utils";
import {deployNew, newWallet} from "./utils";
import {ONE_THOUSAND_E_18, TOKEN_USDC_NAME} from "./constantsTest";
import {expect} from "chai";
import {OCPRouter__factory} from "../typechain-types";

export async function omniMintToken(token: any, userA: any, amountIn: BigNumber, omniMintAmount: BigNumber, router: any, userB: any, destChainID: number, receiver: Wallet, refund: Wallet, lzTxParams: {
    dstNativeAddr: string;
    dstNativeAmount: number;
    dstGasForCall: number
}, ethValue: BigNumber) {
    await token.mint(userA.address, amountIn);
    await token.connect(userA).approve(router.address, ApproveAmount);
    let abiCoder = new ethers.utils.AbiCoder();
    let payload = abiCoder.encode(['address', 'address'], [userA.address, userB.address]);
    await router.connect(userA).omniMint(
        destChainID,
        token.address,
        omniMintAmount,
        receiver.address,
        refund.address,
        payload,
        lzTxParams,
        {value: ethValue}
    );
}

export async function omniMintFromUser1ToUser2(usdc: any, user1: any, user2: any, router: any) {
    const token = usdc;
    const userA = user1;
    const userB = user2;
    const amountIn = parseEther("1000");
    const omniAmountIn = parseEther("100");
    const refund = newWallet();
    const receiver = newWallet();
    const ethValue = parseEther("0.1");
    const lzTxParams = {
        dstGasForCall: 50000,
        dstNativeAmount: 0,
        dstNativeAddr: '0x'
    };
    const destChainID = CHAIN_ID_LOCAL2;
    await omniMintToken(
        token,
        userA,
        amountIn,
        omniAmountIn,
        router,
        userB,
        destChainID,
        receiver,
        refund,
        lzTxParams,
        ethValue);
}

export async function OCPTM_createToken(_srcPool: any, _dstChainId: number, _amount: BigNumber, _userA: any, _symbol: string, _sharedDecimals: number, tm: any, _lz: any, _srcChainId: number) {
    const _tokenA = await deployNew("Token", ["tokenA", 18, 0, 0, 0]);
    const _mintObj = {
        srcToken: _tokenA.address,
        srcPool: _srcPool,
        dstChainId: _dstChainId,
        amount: _amount,
        to: _userA.address,
        name: _symbol,
        symbol: _symbol,
        sharedDecimals: _sharedDecimals
    };
    await tm.createToken(
        _mintObj,
        _lz.address,
        _srcChainId,
    );
}


export async function OP_TEST_OCPTM_CT2(user1: any, _token: any, tm: any, lz: any, _dstChainId: any, _srcPool: any) {
    async function OCPTM_createToken2(
        _token: any,
        _srcPool: any,
        _dstChainId: number,
        _amount: BigNumber,
        _userA: any,
        _symbol: string,
        _sharedDecimals: number,
        tm: any,
        _lz: any,
        _srcChainId: number) {
        const _mintObj = {
            srcToken: _token.address,
            srcPool: _srcPool.address,
            dstChainId: _dstChainId,
            amount: _amount,
            to: _userA.address,
            name: _symbol,
            symbol: _symbol,
            sharedDecimals: _sharedDecimals
        };
        await tm.createToken(
            _mintObj,
            _lz.address,
            _srcChainId,
        );
    }

    // const _srcPool = newWallet();
    const _amount = ONE_THOUSAND_E_18;
    const _userA = user1;
    const _symbol = TOKEN_USDC_NAME;
    const _sharedDecimals = 18;
    const _srcChainId = CHAIN_ID_LOCAL;
    await OCPTM_createToken2(
        _token,
        _srcPool,
        _dstChainId,
        _amount,
        _userA,
        _symbol,
        _sharedDecimals,
        tm,
        lz,
        _srcChainId);
    return _dstChainId;
}


export async function OP_TEST_OCPTM_CT(user1: any, lzEndpoint: any, tm: any) {
    const _srcChainId = CHAIN_ID_LOCAL;
    const _dstChainId = CHAIN_ID_LOCAL2;
    const _amount = parseEther("1000");
    const _userA = user1;
    const _symbol = "tokenA";
    const _sharedDecimals = 18;
    const _lz = lzEndpoint;
    const _srcPool = AddressZero;

    await OCPTM_createToken(
        _srcPool,
        _dstChainId,
        _amount,
        _userA,
        _symbol,
        _sharedDecimals,
        tm,
        _lz,
        _srcChainId);
}

export async function deployOT(_userA: any, _lz: any, _tm: any, _srcChainId: any = CHAIN_ID_LOCAL, _srcPoolAddress: any = AddressZero) {
    const ot = await deployNew(
        "OmniToken",
        ['ot', 'ot', 18, ONE_THOUSAND_E_18,
            _userA.address,
            _lz.address,
            _tm.address,
            _srcChainId,
            _srcPoolAddress
        ]
    );

    return ot;
}

export async function getOCPB_omniMInt(owner: any) {
    const b = await deployNew(
        "OCPBridge",
        [owner.address, AddressZero]
    );
    expect(await b.router()).eq(owner.address);

    const _mintParams = {
        srcToken: AddressZero,
        srcPool: AddressZero,
        dstChainId: 0,
        amount: 0,
        to: AddressZero,
        name: "",
        symbol: "",
        sharedDecimals: 0
    }
    const _payload = "0x";
    const _lzTxObj = {
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: "0x"
    }
    return {b, _mintParams, _payload, _lzTxObj};
}

export async function getOCPB_omniRedeem(owner: any) {
    const b = await deployNew(
        "OCPBridge",
        [owner.address, AddressZero]
    );
    expect(await b.router()).eq(owner.address);

    const _redeemParams = {
        srcToken: AddressZero,
        dstChainId: 0,
        amount: 0,
        to: AddressZero,
    }
    const _payload = "0x";
    const _lzTxObj = {
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: "0x"
    }
    return {b, _redeemParams, _payload, _lzTxObj};
}

export async function getOCPR_WETH_ZERO(owner: any) {
    const r = await deployNew(
        "OCPRouter",
        [owner.address, owner.address, AddressZero]);

    return {r};
}

export async function getOCPR_BRIDGE_SETTINGS(owner: any) {
    const r = await deployNew(
        "OCPRouter",
        [owner.address, owner.address, AddressZero]);

    await r.connect(owner).updateBridge(owner.address);
    return {r};
}

export const getMintParams_ZERO = {
    srcToken: AddressZero,
        srcPool: AddressZero,
    dstChainId: 0,
    amount: 0,
    to: AddressZero,
    name: "",
    symbol: "",
    sharedDecimals: 0
};

export const getRedeemObj_ZERO = {
    srcToken: AddressZero,
    dstChainId: 0,
    amount: 0,
    to: AddressZero
}

export async function getOT_ZERO(owner: any, mintAmount: any, tmAddress: any) {
    const ot = await deployNew("OmniToken", [
        "OmniToken",
        "OT",
        mintAmount,
        owner.address,
        // AddressZero,
        // tmAddress,
        // 0,
        AddressZero
    ]);
    return {ot};
}
