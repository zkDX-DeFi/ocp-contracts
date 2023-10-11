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

async function router_omniMint(
    router: any,
    user: any,
    token: any,
    _needDeploy : any = false,
    _payload : any = "0x",
    _to : any = user.address,
    _amountIn : any = ONE_HUNDRED_E_18,
    _mintAmount : any = ONE_THOUSAND_E_18,
    _remoteChainId: any = CHAIN_ID_LOCAL2,



    _lzTxObj : any = {
        dstGasForCall: 600000,
        dstNativeAmount: 0,
        dstNativeAddr: '0x',
    },
    _refundAddress : any = user.address
) {
    const r = router;
    // const USER = user;
    // const _token = token;
    // const _mintAmount = ONE_THOUSAND_E_18;

    await token.mint(user.address, _mintAmount);
    await token.connect(user).approve(router.address, _mintAmount);
    await router.connect(user).omniMint(
        _remoteChainId,
        token.address,
        _amountIn,
        _to,
        _needDeploy,
        _refundAddress,
        _payload,
        _lzTxObj,
        {value: POINT_ONE_E_18});
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

    it("check ScenarioTest => S1 => omniMint && _needDeploy = true", async() => {
         const r = router;
         const r2 = router2;
         const tm2 = tokenManager2;
         console.log(`r.address: ${r.address}`);
         console.log(`r2.address: ${r2.address}`);

         const _token = usdc;
         console.log(`_token.address: ${_token.address}`);
         const _user = user1;
         const _amountIn = ONE_THOUSAND_E_18;
         await _token.mint(_user.address, _amountIn);
         await _token.connect(_user).approve(r.address, _amountIn);

         const _remoteChainId = CHAIN_ID_LOCAL2;
         const _omniMintAmount = ONE_HUNDRED_E_18;
         const _to = _user.address;
         const _needDeploy = true;
         const _refundAddress = _user.address;
         const _userPayload = "0x";
         const _lzTxObj = {
                dstGasForCall: 600000,
                dstNativeAmount: 0,
                dstNativeAddr: '0x',
         };

         await r.connect(_user).omniMint(
                _remoteChainId,
                _token.address,
                _omniMintAmount,
                _to,
                _needDeploy,
                _refundAddress,
                _userPayload,
                _lzTxObj,
                {value: POINT_ONE_E_18}
         );

         const _srcChainId = CHAIN_ID_LOCAL;
         console.log(`${await tm2.omniTokens(_token.address, _srcChainId)}`);
         const _omniTokenAddress = await tm2.omniTokens(_token.address, _srcChainId);

         const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
         console.log(`_omniToken.address: ${_omniToken.address}`);
         console.log(`_omniToken.totalSupply(): ${formatEther(await _omniToken.totalSupply())}`);
         console.log(`_omniToken.balanceOf(_user.address): ${formatEther(await _omniToken.balanceOf(_user.address))}`);

        await r.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            _omniMintAmount,
            _to,
            _needDeploy,
            _refundAddress,
            _userPayload,
            _lzTxObj,
            {value: POINT_ONE_E_18}
        );

        console.log(`${await tm2.omniTokens(_token.address, _srcChainId)}`);

        console.log(`_omniToken.totalSupply(): ${formatEther(await _omniToken.totalSupply())}`);
        console.log(`_omniToken.balanceOf(_user.address): ${formatEther(await _omniToken.balanceOf(_user.address))}`);
    });
    it("check ScenarioTest => S2 => omniMint && _needDeploy = false", async() => {
        const r = router;
        const r2 = router;
        const tm2 = tokenManager2;
        const _user = user1;


        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _token = usdc;
        const _amountIn = ONE_HUNDRED_E_18;
        const _to = _user.address;
        const _needDeploy = false;
        const _refundAddress = _user.address;
        const _userPayload = "0x";
        const _lzTxObj = {
            dstGasForCall: 600000,
            dstNativeAmount: 0,
            dstNativeAddr: '0x',
        };

        await _token.mint(_user.address, _amountIn);
        await _token.connect(_user).approve(r.address, _amountIn);
        const _omniMintAmount = ONE_HUNDRED_E_18;

        await r.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            _omniMintAmount,
            _to,
            _needDeploy,
            _refundAddress,
            _userPayload,
            _lzTxObj,
            {value: POINT_ONE_E_18}
        );

        const _srcChainId = CHAIN_ID_LOCAL;
        expect(await tm2.omniTokens(_token.address, _srcChainId)).to.be.equal(AddressZero);
    });

    it("check STEST => S3 => omniMint => _payLoad is 0x", async() => {
        const _srcChainId = CHAIN_ID_LOCAL;

        await router_omniMint(router, user1, usdc);
        expect(await tokenManager2.omniTokens(usdc.address, _srcChainId)).to.be.equal(AddressZero);

        await router_omniMint(router, user1, usdc, true);
        expect(await tokenManager2.omniTokens(usdc.address, _srcChainId)).to.be.not.equal(AddressZero);

        const _omniTokenAddress = await tokenManager2.omniTokens(usdc.address, _srcChainId);
        const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
        expect(await _omniToken.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18);
    });

    it("check STEST => S4 => omniMint => _payLoad is 0x => V2", async() => {
        await router_omniMint(router, user2, usdc, true);

        const _srcChainId = CHAIN_ID_LOCAL;
        const _omniTokenAddress = await tokenManager2.omniTokens(usdc.address, _srcChainId);
        const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
        expect(await _omniToken.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18);

        await router_omniMint(router, user1, usdc, true);
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
        expect(await _omniToken.balanceOf(user1.address)).to.be.equal(0);
        expect(await _omniToken.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18);

        await router_omniMint(router, user1, usdc, false);
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
        expect(await _omniToken.balanceOf(user1.address)).to.be.equal(0);
        expect(await _omniToken.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18);
    });

    it("check STEST => S5 => omniMint => _payLoad is not 0x", async() => {
        const USER = user1;
        const tm2 = tokenManager2;
        const _srcChainId = CHAIN_ID_LOCAL;
        const _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [USER.address]);

        await router_omniMint(router, user1, usdc, true, _userPayload);
        expect(await tm2.omniTokens(usdc.address, _srcChainId)).eq(AddressZero);
        await router_omniMint(router, user2, usdc, true, _userPayload);
        expect(await tm2.omniTokens(usdc.address, _srcChainId)).eq(AddressZero);


        await router_omniMint(router, user1, usdc, false, _userPayload);
        expect(await tm2.omniTokens(usdc.address, _srcChainId)).eq(AddressZero);
        await router_omniMint(router, user2, usdc, false, _userPayload);
        expect(await tm2.omniTokens(usdc.address, _srcChainId)).eq(AddressZero);
    });

    it("check OCPR.FUNC => omniMint() v2", async () => {
        const USER = user1;
        const tm2 = tokenManager2;
        const _srcChainId = CHAIN_ID_LOCAL;
        const receiverContract = await deployNew("ReceiverContract", [router2.address]);
        const _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [USER.address]);

        await router_omniMint(router, user1, usdc, true, _userPayload, receiverContract.address);

        const _omniTokenAddress = await tm2.omniTokens(usdc.address, _srcChainId);
        const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
        expect(await _omniToken.balanceOf(receiverContract.address)).to.be.eq(ONE_HUNDRED_E_18);

        await router_omniMint(router, user1, usdc, true, _userPayload, receiverContract.address);
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
        expect(await _omniToken.balanceOf(receiverContract.address)).to.be.eq(ONE_HUNDRED_E_18);

        await router_omniMint(router, user1, usdc, false, _userPayload, receiverContract.address);
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
        expect(await _omniToken.balanceOf(receiverContract.address)).to.be.eq(ONE_HUNDRED_E_18);

        await router_omniMint(router, user1, usdc, false, _userPayload, receiverContract.address);
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
    });

    it("check OCPR.FUNC => omniMint() v3", async () => {
        const USER = user1;
        const tm2 = tokenManager2;
        const _srcChainId = CHAIN_ID_LOCAL;
        const rc = await deployNew("ReceiverContract", [router2.address]);
        const _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [USER.address]);

        await router_omniMint(router, user1, usdc, true,
            _userPayload,
            rc.address,
            ONE_THOUSAND_E_18
        );

        const _omniTokenAddress = await tm2.omniTokens(usdc.address, _srcChainId);
        const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_THOUSAND_E_18);
        expect(await _omniToken.balanceOf(rc.address)).to.be.eq(ONE_THOUSAND_E_18);

        await router_omniMint(
            router, user1, usdc, true,
            _userPayload,
            rc.address,
            ONE_THOUSAND_E_18.mul(3),
            ONE_THOUSAND_E_18.mul(3),
        );
        expect(await _omniToken.totalSupply()).to.be.equal(ONE_THOUSAND_E_18);
        expect(await usdc.totalSupply()).to.be.equal(ONE_THOUSAND_E_18.mul(4));

        console.log(`usdc.totalSupply(): ${formatEther(await usdc.totalSupply())}`);
        console.log(`_omniToken.totalSupply(): ${formatEther(await _omniToken.totalSupply())}`);
    });
});
