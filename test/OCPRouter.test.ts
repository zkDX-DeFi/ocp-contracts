import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {
    AddressZero,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2,
    CHAIN_ID_LOCAL3,
    TYPE_DEPLOY_AND_MINT, TYPE_MINT
} from "../helpers/constants";
import {getOCPB_omniMInt, getOCPB_omniRedeem} from "../helpers/utilsTest";
import {formatEther, parseEther} from "ethers/lib/utils";
import {LZ_NOT_ENOUGH_FEES, OWNABLE_CALLER_IS_NOT_THE_OWNER} from "../helpers/errors";
import {
    ONE_HUNDRED_E_18,
    ONE_HUNDRED_E_6,
    ONE_THOUSAND_E_18,
    ONE_THOUSAND_E_6,
    POINT_ONE_E_18
} from "../helpers/constantsTest";
import {ethers} from "hardhat";

async function router_omni_mint(usdc: any, USER: any, R: any, _needDeploy: any = true) {
    let _remoteChainId = CHAIN_ID_LOCAL2;
    let _token = usdc;
    let _amountIn = ONE_THOUSAND_E_18;
    let _toAddress = USER.address;
    // let _needDeploy = true;
    let _refundAddress = USER.address;

    let _userPayload =
        ethers.utils.defaultAbiCoder.encode(['address'], [USER.address]);
    let _lzTxObj = {
        dstGasForCall: 600000,
        dstNativeAmount: 0,
        dstNativeAddr: '0x',
    };
    await _token.mint(USER.address, _amountIn);
    await _token.connect(USER).approve(R.address, _amountIn);

    console.log(`_token: ${_token.address}`)
    await R.connect(USER).omniMint(
        _remoteChainId,
        _token.address,
        _amountIn,
        _toAddress,
        _needDeploy,
        _refundAddress,
        _userPayload,
        _lzTxObj,
        {value: POINT_ONE_E_18}
    );
}

describe("OCPR", async () => {

    let user1: any,
        user2: any,
        owner: any,
        usdc: any,
        bridge: any,
        bridge2: any,
        router : any,
        router2 : any,
        tokenManager: any,
        tokenManager2: any,
        poolFactory: any,
        poolFactory2: any


    beforeEach(async () => {
        ({owner, user1, user2, bridge, bridge2, router, router2, tokenManager, tokenManager2, poolFactory,poolFactory2} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });
    it("check OCPR.VARIABLES => bridge()", async () => {
        const r = router;
        const b = bridge;
        const tm = tokenManager;
        const f = poolFactory;
        expect(await r.bridge()).eq(b.address);
        expect(await r.tokenManager()).eq(tm.address);
        expect(await r.poolFactory()).eq(f.address);
    });

    it("check OCPR.FUNC => omniMint()", async () => {
        const r = router;

        let _remoteChainId = CHAIN_ID_LOCAL2;
        let _token = usdc;
        let _amount = ONE_HUNDRED_E_18;
        let _toAddress = user1.address;
        let _needDeploy = true;
        let _refundAddress = user1.address;
        let _payload = "0x";
        let _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: AddressZero,
        };
        let _value = POINT_ONE_E_18;


        await _token.mint(owner.address, ONE_THOUSAND_E_18);
        await _token.approve(r.address, ONE_THOUSAND_E_18);

        await r.omniMint(
            _remoteChainId,
            _token.address,
            _amount,
            _toAddress,
            _needDeploy,
            _refundAddress,
            _payload,
            _lzTxObj,
            {value: _value}
        );

        await expect(
            r.omniMint(
                _remoteChainId,
                AddressZero,
                _amount,
                _toAddress,
                _needDeploy,
                _refundAddress,
                _payload,
                _lzTxObj,
                {value: _value}
            )
        ).to.be.revertedWith("OCPRouter: token invalid");

        await expect(r.omniMint(
            _remoteChainId,
            _token.address,
            0,
            _toAddress,
            _needDeploy,
            _refundAddress,
            _payload,
            _lzTxObj,
            {value: _value}
        )).to.be.revertedWith("OCPRouter: amountIn must be greater than 0");

        await expect(r.omniMint(
            _remoteChainId,
            _token.address,
            _amount,
            AddressZero,
            _needDeploy,
            _refundAddress,
            _payload,
            _lzTxObj,
            {value: _value}
        )).to.be.revertedWith("OCPRouter: receiver invalid");

        await r.omniMint(
            _remoteChainId,
            _token.address,
            _amount,
            _toAddress,
            _needDeploy,
            _refundAddress,
            _payload,
            _lzTxObj,
            {value: _value}
        );

        _needDeploy = false;

        await r.omniMint(
            _remoteChainId,
            _token.address,
            _amount,
            _toAddress,
            _needDeploy,
            _refundAddress,
            _payload,
            _lzTxObj,
            {value: _value}
        );
    });

    it("check OCPR.FUNC => quoteLayerZeroFee()", async () => {
        const r = router;

        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _type = TYPE_DEPLOY_AND_MINT;
        const _userPayload = "0x";
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: AddressZero,
        };

        console.log(`${await r.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        )}`);
    });

    it("check OCPR.FUNC => updateBridge()", async() => {
        const r = router;

        await r.updateBridge(bridge2.address);
        await expect(r.connect(user1).updateBridge(bridge2.address))
            .to.be.revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);
    });

    it('check OCPR.FUNC => omniMintRemote()', async() => {
        const r = router;
        const _srcChainId = CHAIN_ID_LOCAL;
        const _srcAddress = user1.address;
        const _nonce = 0;
        const _needDeploy = true;
        const _mintParams = {
            srcToken: usdc.address,
            amount: 0,
            to: user1.address,
            name: "USDC",
            symbol: "USDC"
        };
        const _lzEndPoint = AddressZero;
        const _dstGasForCall = 0;
        const _payload = "0x";

        await expect(r.omniMintRemote(
            _srcChainId,
            _srcAddress,
            _nonce,
            _needDeploy,
            _mintParams,
            _lzEndPoint,
            _dstGasForCall,
            _payload)).to.be.revertedWith("OCPRouter: caller is not the bridge");
    });

    it("check OCPR.FUNC => _amountD18()", async () => {
        const r = router;

        const usdcD6 = await deployNew("Token", ["USDC", 6, 0, 0, 0]);

        let _remoteChainId = CHAIN_ID_LOCAL2;
        let _token = usdcD6;
        let _amount = ONE_HUNDRED_E_6;
        let _toAddress = user1.address;
        let _needDeploy = true;
        let _refundAddress = user1.address;
        let _payload = "0x";
        let _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: AddressZero,
        };
        let _value = POINT_ONE_E_18;


        await _token.mint(owner.address, ONE_THOUSAND_E_6);
        await _token.approve(r.address, ONE_THOUSAND_E_6);

        await r.omniMint(
            _remoteChainId,
            _token.address,
            _amount,
            _toAddress,
            _needDeploy,
            _refundAddress,
            _payload,
            _lzTxObj,
            {value: _value}
        );

        _needDeploy = false;
        await r.omniMint(
            _remoteChainId,
            _token.address,
            _amount,
            _toAddress,
            _needDeploy,
            _refundAddress,
            _payload,
            _lzTxObj,
            {value: _value}
        );
    });

    it("check OCPR.FUNC => omniMint()", async () => {
        const r = router;
        const usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);

        let _remoteChainId = CHAIN_ID_LOCAL2;
        let _token = usdc;
        let _amount = ONE_HUNDRED_E_18;
        let _toAddress = user1.address;
        let _needDeploy = true;
        let _refundAddress = user1.address;
        let _payload = AddressZero;
        let _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: AddressZero,
        };
        let _value = POINT_ONE_E_18;


        await _token.mint(owner.address, ONE_THOUSAND_E_18);
        await _token.approve(r.address, ONE_THOUSAND_E_18);

        _needDeploy = false;
        await r.omniMint(
            _remoteChainId,
            _token.address,
            _amount,
            _toAddress,
            _needDeploy,
            _refundAddress,
            _payload,
            _lzTxObj,
            {value: _value}
        );
    });

    it("check OCPR.FUNC => omniMint() v2", async () => {
        let receiverContract = await deployNew("ReceiverContract", [router2.address]);
        let amountIn = ONE_THOUSAND_E_18;
        const _token = usdc;
        const _user = user1;

        await _token.mint(_user.address, amountIn);
        await _token.connect(_user).approve(router.address, amountIn);
        let _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [_user.address]);

        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _type = TYPE_DEPLOY_AND_MINT;
        const _lzTxObj = {
            dstGasForCall: 300000,
            dstNativeAmount: 0,
            dstNativeAddr: '0x',
        }

        let msgFee = await router.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        );

        console.log("DeployMint Fee:", formatEther(msgFee[0]));

        await router.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            ONE_THOUSAND_E_18,
            receiverContract.address,
            true,
            _user.address,
            _userPayload,
            _lzTxObj,
            {value: msgFee[0]}
        );


    });

    it("check OCPR.FUNC => omniMint() v3", async () => {
        let receiverContract = await deployNew("ReceiverContract2", [router2.address]);
        let amountIn = ONE_THOUSAND_E_18;
        const _token = usdc;
        const _user = user1;

        await _token.mint(_user.address, amountIn);
        await _token.connect(_user).approve(router.address, amountIn);
        let _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [_user.address]);

        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _type = TYPE_DEPLOY_AND_MINT;
        const _lzTxObj = {
            dstGasForCall: 300000,
            dstNativeAmount: 0,
            dstNativeAddr: '0x',
        }

        let msgFee = await router.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        );

        console.log("DeployMint Fee:", formatEther(msgFee[0]));

        await router.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            ONE_HUNDRED_E_18,
            receiverContract.address,
            true,
            _user.address,
            _userPayload,
            _lzTxObj,
            {value: msgFee[0]}
        );

        await router.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            ONE_HUNDRED_E_18,
            receiverContract.address,
            true,
            _user.address,
            _userPayload,
            _lzTxObj,
            {value: msgFee[0]}
        );

        await router.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            ONE_HUNDRED_E_18,
            receiverContract.address,
            false,
            _user.address,
            _userPayload,
            _lzTxObj,
            {value: msgFee[0]}
        );

        await router.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            ONE_HUNDRED_E_18,
            receiverContract.address,
            false,
            _user.address,
            _userPayload,
            _lzTxObj,
            {value: msgFee[0]}
        );
    });

    it("check OCPR.FUNC => omniMint() v4", async () => {
        let receiverContract = await deployNew("ReceiverContract2", [router2.address]);
        let amountIn = ONE_THOUSAND_E_18;
        const _token = usdc;
        const _user = user1;

        await _token.mint(_user.address, amountIn);
        await _token.connect(_user).approve(router.address, amountIn);
        let _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [_user.address]);

        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _type = TYPE_DEPLOY_AND_MINT;
        const _lzTxObj = {
            dstGasForCall: 300000,
            dstNativeAmount: 0,
            dstNativeAddr: '0x',
        }

        let msgFee = await router.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        );

        await router.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            ONE_HUNDRED_E_18,
            receiverContract.address,
            false,
            _user.address,
            _userPayload,
            _lzTxObj,
            {value: msgFee[0]}
        );

        await router.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            ONE_HUNDRED_E_18,
            receiverContract.address,
            false,
            _user.address,
            _userPayload,
            _lzTxObj,
            {value: msgFee[0]}
        );
    });

    it("check OCPR.VARIABLES => poolFactory", async() => {
        const r = router;
        const r2 = router2;
        const f = poolFactory;
        const f2 = poolFactory2;
        const tm = tokenManager;
        const tm2 = tokenManager2;
        const b = bridge;
        const b2 = bridge2;

        expect(await r.poolFactory()).eq(f.address);
        expect(await r2.poolFactory()).eq(f2.address);
        expect(await r.tokenManager()).eq(tm.address);
        expect(await r2.tokenManager()).eq(tm2.address);
        expect(await r.bridge()).eq(b.address);
        expect(await r2.bridge()).eq(b2.address);

        expect(await r.weth()).eq(AddressZero);
        expect(await r2.weth()).eq(AddressZero);
    });
    it("check Router.FUNC => quoteLayerZeroFee", async() => {
        const r = router;
        let _user = user1;
        let _remoteChainId = CHAIN_ID_LOCAL2;
        let _type = TYPE_DEPLOY_AND_MINT;
        let _userPayload =
            ethers.utils.defaultAbiCoder.encode(['address'], [_user.address]);
        let _lzTxObj = {
            dstGasForCall: 300000,
            dstNativeAmount: 0,
            dstNativeAddr: '0x',
        }
        let msgFee = await router.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        );
        console.log(`msgFee:, ${formatEther(msgFee[0])}`);

        _user = user2;
        _userPayload =
            ethers.utils.defaultAbiCoder.encode(['address'], [_user.address]);

        _lzTxObj = {
            dstGasForCall: 600000,
            dstNativeAmount: 0,
            dstNativeAddr: '0x',
        }
        msgFee = await r.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        );
        console.log(`msgFee:, ${formatEther(msgFee[0])}`);
    });
    it("check R2.FUNC => quoteLayerZeroFee()", async() => {
        const r = router;
        const r2 = router2;

        let _user = user2;
        let _remoteChainId = CHAIN_ID_LOCAL;
        let _type = TYPE_DEPLOY_AND_MINT;
        let _userPayload =
            ethers.utils.defaultAbiCoder.encode(['address'], [_user.address]);
        console.log(`_userPayload:, ${_userPayload}`);

        let _lzTxObj = {
            dstGasForCall: 300000,
            dstNativeAmount: 0,
            dstNativeAddr: '0x',
        };

        let msgFee = await r2.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        );
        console.log(`${formatEther(msgFee[0])}`);

        _type = TYPE_MINT;
        await expect(r2.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        )).to.be.revertedWith("OCPBridge: invalid quote type");

        _type = TYPE_DEPLOY_AND_MINT;
        msgFee = await r2.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        );
        console.log(`${formatEther(msgFee[0])}`);
    });

    it("check R.FUNC => omniMint()", async() => {
        const f = poolFactory;
        const usdc2 = await deployNew("Token", ["USDC2", 6, 0, 0, 0]);

        expect(await f.getPool(usdc.address)).eq(AddressZero);
        expect(await f.getPool(usdc2.address)).eq(AddressZero);
        await router_omni_mint(usdc2, user1, router);
        expect(await f.getPool(usdc.address)).eq(AddressZero);
        expect(await f.getPool(usdc2.address)).not.eq(AddressZero);

        const pool = await f.getPool(usdc2.address);
        expect(await usdc2.totalSupply()).eq(await usdc2.balanceOf(pool));
        expect(await usdc2.totalSupply()).eq(ONE_THOUSAND_E_18);

        await router_omni_mint(usdc2, user1, router);
        expect(await usdc2.totalSupply()).eq(await usdc2.balanceOf(pool));
        expect(await usdc2.totalSupply()).eq(ONE_THOUSAND_E_18.mul(2));

        expect(await f.getPool(usdc.address)).eq(AddressZero);
        await router_omni_mint(usdc, user1, router);
        expect(await f.getPool(usdc.address)).not.eq(AddressZero);
        expect(await f.getPool(usdc.address)).not.eq(await f.getPool(usdc2.address));
    });

    it("check R.FUNC => omniMint() => tm", async() => {
        const b = bridge;
        const b2 = bridge2;
        const tm = tokenManager;
        const tm2 = tokenManager2;

        console.log(`tm: ${tm.address}`);
        console.log(`tm2: ${tm2.address}`);

        console.log(`b: ${b.address}`);
        console.log(`b2: ${b2.address}`);

        console.log(`${await tm.omniTokens(usdc.address, CHAIN_ID_LOCAL)}`);
        console.log(`${await tm.omniTokens(usdc.address, CHAIN_ID_LOCAL2)}`);
        console.log(`${await tm2.omniTokens(usdc.address, CHAIN_ID_LOCAL)}`);
        console.log(`${await tm2.omniTokens(usdc.address, CHAIN_ID_LOCAL2)}`);

        await router_omni_mint(usdc, user1, router);

        console.log(`${await tm.omniTokens(usdc.address, CHAIN_ID_LOCAL)}`);
        console.log(`${await tm.omniTokens(usdc.address, CHAIN_ID_LOCAL2)}`);
        console.log(`${await tm2.omniTokens(usdc.address,CHAIN_ID_LOCAL)}`);
        console.log(`${await tm2.omniTokens(usdc.address, CHAIN_ID_LOCAL2)}`);

        await router_omni_mint(usdc, user1, router);
    });

    it("check R.FUNC => omniMint() => tm v2", async() => {
        const r = router;
        const r2 = router2;
        const b = bridge;
        const b2 = bridge2;
        const tm = tokenManager;
        const tm2 = tokenManager2;

        console.log(`r: ${r.address}`);
        console.log(`r2: ${r2.address}`);
        console.log(`b: ${b.address}`);
        console.log(`b2: ${b2.address}`);
        console.log(`tm: ${tm.address}`);
        console.log(`tm2: ${tm2.address}`);

        await router_omni_mint(usdc, user1, router);

        console.log(`------------------------- splitter --------------`);
        console.log(`------------------------- splitter --------------`);

        await router_omni_mint(usdc, user1, router, false);
    });
});
