import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {
    AddressZero,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2,
    CHAIN_ID_LOCAL3,
    TYPE_DEPLOY_AND_MINT, TYPE_MINT
} from "../helpers/constants";
import {getOCPB_omniMInt, getOCPB_omniRedeem, getPayloadUserA, router_omniMint} from "../helpers/utilsTest";
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

describe("OCPScenario", async () => {

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
        poolFactory2: any,
        lzEndpoint: any,
        lzEndpoint2: any


    beforeEach(async () => {
        ({owner, user1, user2,
            bridge, bridge2,
            router, router2,
            tokenManager, tokenManager2,
            poolFactory, poolFactory2,
            lzEndpoint, lzEndpoint2
        } = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });

    it("check ScenarioTest => S1 => omniMint && _type = 1", async() => {
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
         const _type = 1;
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
                _type,
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
            _type,
            _refundAddress,
            _userPayload,
            _lzTxObj,
            {value: POINT_ONE_E_18}
        );

        console.log(`${await tm2.omniTokens(_token.address, _srcChainId)}`);

        console.log(`_omniToken.totalSupply(): ${formatEther(await _omniToken.totalSupply())}`);
        console.log(`_omniToken.balanceOf(_user.address): ${formatEther(await _omniToken.balanceOf(_user.address))}`);
    });
    it("check ScenarioTest => S2 => omniMint && _type = 2", async() => {
        const r = router;
        const r2 = router;
        const tm2 = tokenManager2;
        const _user = user1;


        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _token = usdc;
        const _amountIn = ONE_HUNDRED_E_18;
        const _to = _user.address;
        const _type = 2;
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
            _type,
            _refundAddress,
            _userPayload,
            _lzTxObj,
            {value: POINT_ONE_E_18}
        );

        const _srcChainId = CHAIN_ID_LOCAL;
        expect(await tm2.omniTokens(_token.address, _srcChainId)).to.be.equal(AddressZero);
    });

    // it("check STEST => S3 => omniMint => _payLoad is 0x", async() => {
    //     const _srcChainId = CHAIN_ID_LOCAL;
    //
    //     await router_omniMint(router, user1, usdc, true);
    //     console.log(`${await tokenManager2.omniTokens(usdc.address, _srcChainId)}`);
    //     expect(await tokenManager2.omniTokens(usdc.address, _srcChainId)).to.not.eq(AddressZero);
    //
    //     await router_omniMint(router, user1, usdc, false);
    //     console.log(`${await tokenManager2.omniTokens(usdc.address, _srcChainId)}`);
    //
    //     expect(await tokenManager2.omniTokens(usdc.address, _srcChainId)).to.be.not.equal(AddressZero);
    //     //
    //     const _omniTokenAddress = await tokenManager2.omniTokens(usdc.address, _srcChainId);
    //     const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
    //     expect(await _omniToken.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18);
    // });

    // it("check STEST => S4 => omniMint => _payLoad is 0x => V2", async() => {
    //     await router_omniMint(router, user2, usdc, true);
    //
    //     const _srcChainId = CHAIN_ID_LOCAL;
    //     const _omniTokenAddress = await tokenManager2.omniTokens(usdc.address, _srcChainId);
    //     const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
    //     expect(await _omniToken.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18);
    //
    //     await router_omniMint(router, user1, usdc, true);
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
    //     expect(await _omniToken.balanceOf(user1.address)).to.be.equal(0);
    //     expect(await _omniToken.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18);
    //
    //     await router_omniMint(router, user1, usdc, false);
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
    //     expect(await _omniToken.balanceOf(user1.address)).to.be.equal(0);
    //     expect(await _omniToken.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18);
    // });

    it("check STEST => S5 => omniMint => _payLoad is not 0x", async() => {
        const USER = user1;
        const tm2 = tokenManager2;
        const _srcChainId = CHAIN_ID_LOCAL;
        const _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [USER.address]);

        await router_omniMint(router, user1, usdc, 1, _userPayload);
        expect(await tm2.omniTokens(usdc.address, _srcChainId)).eq(AddressZero);
        await router_omniMint(router, user2, usdc, 1, _userPayload);
        expect(await tm2.omniTokens(usdc.address, _srcChainId)).eq(AddressZero);


        await router_omniMint(router, user1, usdc, 2, _userPayload);
        expect(await tm2.omniTokens(usdc.address, _srcChainId)).eq(AddressZero);
        await router_omniMint(router, user2, usdc, 2, _userPayload);
        expect(await tm2.omniTokens(usdc.address, _srcChainId)).eq(AddressZero);
    });

    // it("check OCPR.FUNC => omniMint() v2", async () => {
    //     const USER = user1;
    //     const tm2 = tokenManager2;
    //     const _srcChainId = CHAIN_ID_LOCAL;
    //     const receiverContract = await deployNew("ReceiverContract", [router2.address]);
    //     const _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [USER.address]);
    //
    //     await router_omniMint(router, user1, usdc, 1, _userPayload, receiverContract.address);
    //
    //     const _omniTokenAddress = await tm2.omniTokens(usdc.address, _srcChainId);
    //     const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
    //     expect(await _omniToken.balanceOf(receiverContract.address)).to.be.eq(ONE_HUNDRED_E_18);
    //
    //     await router_omniMint(router, user1, usdc, 1, _userPayload, receiverContract.address);
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
    //     expect(await _omniToken.balanceOf(receiverContract.address)).to.be.eq(ONE_HUNDRED_E_18);
    //
    //     await router_omniMint(router, user1, usdc, 2, _userPayload, receiverContract.address);
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
    //     expect(await _omniToken.balanceOf(receiverContract.address)).to.be.eq(ONE_HUNDRED_E_18);
    //
    //     await router_omniMint(router, user1, usdc, 2, _userPayload, receiverContract.address);
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_HUNDRED_E_18);
    // });

    // it("check OCPR.FUNC => omniMint() v3", async () => {
    //     const USER = user1;
    //     const tm2 = tokenManager2;
    //     const _srcChainId = CHAIN_ID_LOCAL;
    //     const rc = await deployNew("ReceiverContract", [router2.address]);
    //     const _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [USER.address]);
    //
    //     await router_omniMint(router, user1, usdc, 1,
    //         _userPayload,
    //         rc.address,
    //         ONE_THOUSAND_E_18
    //     );
    //
    //     const _omniTokenAddress = await tm2.omniTokens(usdc.address, _srcChainId);
    //     const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_THOUSAND_E_18);
    //     expect(await _omniToken.balanceOf(rc.address)).to.be.eq(ONE_THOUSAND_E_18);
    //
    //     await router_omniMint(
    //         router, user1, usdc, 1,
    //         _userPayload,
    //         rc.address,
    //         ONE_THOUSAND_E_18.mul(3),
    //         ONE_THOUSAND_E_18.mul(3),
    //     );
    //     expect(await _omniToken.totalSupply()).to.be.equal(ONE_THOUSAND_E_18);
    //     expect(await usdc.totalSupply()).to.be.equal(ONE_THOUSAND_E_18.mul(4));
    //
    //     console.log(`usdc.totalSupply(): ${formatEther(await usdc.totalSupply())}`);
    //     console.log(`_omniToken.totalSupply(): ${formatEther(await _omniToken.totalSupply())}`);
    // });

    it("check OCPR.FUNC => omniMint() v4", async () => {
        const USER = user1;
        const token = usdc;
        const tm2 = tokenManager2;
        const _srcChainId = CHAIN_ID_LOCAL;
        const rc = await deployNew("ReceiverContract", [router2.address]);
        const _userPayload = ethers.utils.defaultAbiCoder.encode(['address'], [USER.address]);

        await router_omniMint(router, USER, token, 1,
            _userPayload,
            USER.address,
            ONE_THOUSAND_E_18
        );
        console.log(`${await tm2.omniTokens(token.address, _srcChainId)}`);

        // await router_omniMint(router, USER, token, 2,
        //     _userPayload,
        //     USER.address,
        //     ONE_THOUSAND_E_18);
        // console.log(`${await tm2.omniTokens(token.address, _srcChainId)}`);
        //
        // await router_omniMint(router, USER, token, 2,
        //     _userPayload,
        //     rc.address,
        //     ONE_THOUSAND_E_18);
        // console.log(`${await tm2.omniTokens(token.address, _srcChainId)}`);

        await router_omniMint(router, USER, token, 1,
            _userPayload,
            rc.address,
            ONE_THOUSAND_E_18);
        console.log(`${await tm2.omniTokens(token.address, _srcChainId)}`);
        console.log(`${formatEther(await token.totalSupply())}`);

        const _omniTokenAddress = await tm2.omniTokens(token.address, _srcChainId);
        const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
        // console.log(`${formatEther(await _omniToken.totalSupply())}`);

        console.log(`${_omniTokenAddress}`);
    });

    it("check STEST => S4 => omniMint => _payLoad is 0x", async() => {
        const _srcChainId = CHAIN_ID_LOCAL;

        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 1);
        console.log(`${await tokenManager2.omniTokens(usdc.address, _srcChainId)}`);
    });

    it("check STEST => S4 => omniMint => _payLoad is NOT 0x", async() => {
        const b = bridge;
        const b2 = bridge2;
        const _srcChainId = CHAIN_ID_LOCAL;
        const lz = lzEndpoint;
        const lz2 = lzEndpoint2;

        const _payload = ethers.utils.defaultAbiCoder
            .encode(['address'], [user1.address]);

        await router_omniMint(router, user1, usdc, 1, _payload);
        console.log(`${await tokenManager2.omniTokens(usdc.address, _srcChainId)}`);

        await router_omniMint(router, user1, usdc, 1);
        console.log(`${await tokenManager2.omniTokens(usdc.address, _srcChainId)}`);

        await router_omniMint(router, user1, usdc, 1);
        console.log(`${await tokenManager2.omniTokens(usdc.address, _srcChainId)}`);
    });

    it('check STEST => S5 => omniMint => _type = 1 && payload = 0x', async() => {
        const _srcChainId = CHAIN_ID_LOCAL;
        const _token = usdc;
        await router_omniMint(
            router,
            user1,
            _token,
            1
        );

        const _omniTokenAddress = await tokenManager2.omniTokens(_token.address, _srcChainId);
        expect(_omniTokenAddress).not.eq(AddressZero);
        expect(await tokenManager2.sourceTokens(_omniTokenAddress, _srcChainId))
            .eq(_token.address);
    });

    it('check STEST => S5 => omniMint => _type = 1 && payload != 0x', async() => {
        const _srcChainId = CHAIN_ID_LOCAL;
        const _token = usdc;
        const _payload = ethers.utils.defaultAbiCoder
            .encode(['address'], [user1.address]);
        const _rc = await deployNew("ReceiverContract2", [router2.address]);
        const _refundAddress = _rc.address;

        await router_omniMint(
            router,
            user1,
            _token,
            1,
            _payload,
            _refundAddress
        );
        const _omniTokenAddress = await tokenManager2.omniTokens(_token.address, _srcChainId);
        const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
        expect(_omniTokenAddress).not.eq(AddressZero);
        expect(await tokenManager2.sourceTokens(_omniTokenAddress, _srcChainId)).eq(_token.address);

        console.log(`totalSupply: ${formatEther(await _omniToken.totalSupply())}`);
        console.log(`balanceOf(_rc): ${formatEther(await _omniToken.balanceOf(_rc.address))}`);
        console.log(`balanceOf(user1): ${formatEther(await _omniToken.balanceOf(user1.address))}`);
    });

    it("check ST => S6 => omniMint => _type = 2 && payload = 0x", async() => {
        const _srcChainId = CHAIN_ID_LOCAL;
        const _token = usdc;

        await router_omniMint(router, user1, _token, 2);
        expect(await tokenManager2.omniTokens(_token.address, _srcChainId)).to.eq(AddressZero);
    });

    it("check ST => S6 => omniMint => _type = 2 && payload != 0x", async() => {
        const _srcChainId = CHAIN_ID_LOCAL;
        const _user = user1;
        const _token = usdc;
        const _payload = getPayloadUserA(_user);
        const _rc = await deployNew("ReceiverContract2", [router2.address]);

        await router_omniMint(router, _user, _token, 2, _payload, _rc.address);
        expect(await tokenManager2.omniTokens(_token.address, _srcChainId)).to.eq(AddressZero);
    });
});
