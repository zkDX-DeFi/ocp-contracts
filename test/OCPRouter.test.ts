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
        poolFactory: any


    beforeEach(async () => {
        ({owner, user1, user2, bridge, bridge2, router, router2, tokenManager, poolFactory} = await deployFixture());
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
});
