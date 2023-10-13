import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {
    AddressZero,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2,
    CHAIN_ID_LOCAL3, HASH_256_ZERO,
    TYPE_DEPLOY_AND_MINT, TYPE_MINT
} from "../helpers/constants";
import {
    getOCPB_omniMInt,
    getOCPB_omniRedeem,
    getPayloadUserA,
    getReceiverContract,
    router_omniMint, getOmniToken, getLzTxObj
} from "../helpers/utilsTest";
import {formatEther, formatUnits, parseEther, parseUnits} from "ethers/lib/utils";
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

        let tx = await router_omniMint(router, user1, usdc, 1, _payload);
        console.log(`1: ${await tokenManager2.omniTokens(usdc.address, _srcChainId)}`);

        await router_omniMint(router, user1, usdc, 1);
        console.log(`2: ${await tokenManager2.omniTokens(usdc.address, _srcChainId)}`);

        await router_omniMint(router, user1, usdc, 1);
        console.log(`3: ${await tokenManager2.omniTokens(usdc.address, _srcChainId)}`);

        // retry by user
        const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const event = bridge2.interface.parseLog(txReceipt.logs[2]);
        let path = ethers.utils.solidityPack(['address', 'address'], [bridge.address, bridge2.address]);
        await expect(b2.retryMessage(_srcChainId, path, 1, event.args._payload))
            .to.be.revertedWith("Transaction reverted: function call to a non-contract account");

        // TODO: revert it on src chain by user
        // await b2.revertMessage(_srcChainId, path, 1, event.args._payload)...
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
        const tm = tokenManager;
        const tm2 = tokenManager2;
        const _srcChainId = CHAIN_ID_LOCAL;
        const _token = usdc;
        const _payload = ethers.utils.defaultAbiCoder
            .encode(['address'], [user1.address]);
        const _rc = await deployNew("ReceiverContract3", [router2.address]);
        const _refundAddress = _rc.address;
        console.log("rc: ", _rc.address);

        await router_omniMint(
            router,
            user1,
            _token,
            1,
            _payload,
            _refundAddress,
            ONE_THOUSAND_E_18,
            ONE_THOUSAND_E_18,
            CHAIN_ID_LOCAL2,
            {
                dstGasForCall: 600000,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }
        );
        console.log(`${_token.address}`);
        console.log(`${_srcChainId}`);

        const _omniTokenAddress = await tokenManager2.omniTokens(_token.address, _srcChainId);
        const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
        console.log(`tm2: ${tm2.address}`);
        console.log(`${_omniTokenAddress}`);
        console.log(await isNonceSuc(1));

        expect(_omniTokenAddress).not.eq(AddressZero);
        expect(await tokenManager2.sourceTokens(_omniTokenAddress, _srcChainId)).eq(_token.address);

        console.log(`totalSupply: ${formatEther(await _omniToken.totalSupply())}`);
        console.log(`balanceOf(_rc): ${formatEther(await _omniToken.balanceOf(_rc.address))}`);
        console.log(`balanceOf(user1): ${formatEther(await _omniToken.balanceOf(user1.address))}`);
    });

    async function isNonceSuc(nonce: number) {
        let path = ethers.utils.solidityPack(['address', 'address'], [bridge.address, bridge2.address]);
        return HASH_256_ZERO == await bridge2.failedMessages(CHAIN_ID_LOCAL, path, nonce);
    }

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

    it("check ST => S6 => omniMint => _type = 3 or 4", async() => {
        const _srcChainId = CHAIN_ID_LOCAL;
        const _user = user1;
        const _token = usdc;
        const _payload = getPayloadUserA(_user);
        const _rc = await getReceiverContract(router2);

        await expect(router_omniMint(router, _user, _token, 3))
            .to.be.revertedWith("OCPRouter: invalid type");

        await expect(router_omniMint(router, _user, _token, 4))
            .to.be.revertedWith("OCPRouter: invalid type");

        await expect(
            router_omniMint(router, _user, _token, 3, _payload, _rc.address))
            .to.be.revertedWith("OCPRouter: invalid type");

        await expect(
            router_omniMint(router, _user, _token, 4, _payload, _rc.address))
            .to.be.revertedWith("OCPRouter: invalid type");
    });

    it("check ST => s7 => omniMint => _type = 1 => _omniToken", async() => {
        const _srcChainId = CHAIN_ID_LOCAL;
        const _user = user1;
        const _token = usdc;

        await router_omniMint(router, _user, _token, 1);
        const _omniTokenAddress = await tokenManager2.omniTokens(_token.address, _srcChainId);
        const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
        const poolAddress = await poolFactory.getPool(_token.address);
        expect(await _omniToken.balanceOf(_user.address)).to.be.equal(ONE_HUNDRED_E_18);

        await router_omniMint(router, _user, _token, 1);
        expect(await _omniToken.balanceOf(_user.address)).to.be.equal(ONE_HUNDRED_E_18);

        await router_omniMint(router, _user, _token, 1);
        expect(await _omniToken.balanceOf(_user.address)).to.be.equal(ONE_HUNDRED_E_18);

        await router_omniMint(router, _user, _token, 2);
        expect(await _omniToken.balanceOf(_user.address)).to.be.equal(ONE_HUNDRED_E_18.mul(2));
    });

    it("check ST => s8 => omniMint => _type => 111", async() => {
        const _srcChainId = CHAIN_ID_LOCAL;
        const _user = user1;
        const _token = usdc;

        await router_omniMint(router, _user, _token, 1);
        await router_omniMint(router, _user, _token, 1);
        await router_omniMint(router, _user, _token, 1);

        const _omniTokenAddress = await tokenManager2.omniTokens(_token.address, _srcChainId);
        const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);

        expect(await _omniToken.balanceOf(_user.address)).to.be.equal(ONE_HUNDRED_E_18);
    });

    it("check ST => s8 => omniMint => _type => 121", async() => {
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 1);

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(2));
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(2));
    });

    it("check ST => s8 => omniMint => _type => 122", async() => {
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 2);

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(3));
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(3));
    });

    it("check ST => s8 => omniMint => _type => 2122", async() => {
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 2);

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(3));
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(3));
    });

    it("check ST => s9 => omniMint => _type = 2212 => _payload != 0x", async() => {
        const _payload = getPayloadUserA(user1);
        await router_omniMint(router, user1, usdc, 2, _payload);
        await router_omniMint(router, user1, usdc, 2, _payload);
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2);

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(2));
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(2));
    });

    it("check ST => s9 => omniMint => _type = 2212 => _payload != 0x V2", async() => {
        const _payload = getPayloadUserA(user1);
        await router_omniMint(router, user1, usdc, 2, _payload);
        await router_omniMint(router, user1, usdc, 2, _payload);
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2, _payload);
        await router_omniMint(router, user1, usdc, 2);

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(2));
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(2));
    });

    it("check ST => s10 => omniMint => user1(122) + user2(12)", async() => {
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 2);

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(3));
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(3));

        await router_omniMint(router, user2, usdc, 1);
        await router_omniMint(router, user2, usdc, 2);
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(4));
        expect(await ot.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18);
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(3));
    });

    it("check ST => s10 => omniMint => user1(122) + user2(22)", async() => {
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 2);

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(3));
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(3));

        await router_omniMint(router, user2, usdc, 2);
        await router_omniMint(router, user2, usdc, 2);
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(5));
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(3));
        expect(await ot.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18.mul(2));
    });

    it("check ST => s11 => omniMint =>  user1(122) => usdcD6", async() => {
        const usdcD6 = await deployNew("Token", ["USDC", 6, 0, 0, 0]);
        const _amount = parseUnits("123.456",6);
        await router_omniMint(router, user1, usdcD6, 1,
            "0x", user1.address,
            _amount, _amount);

        const ot = await getOmniToken(tokenManager2, usdcD6);
        expect(await usdcD6.totalSupply()).to.be.equal(_amount);
        expect(await ot.totalSupply()).to.be.equal(parseEther("123.456"));

        await router_omniMint(router, user1, usdcD6, 2,
            "0x", user1.address,
            _amount, _amount);
        await router_omniMint(router, user1, usdcD6, 2,
            "0x", user1.address,
            _amount, _amount);

        expect(await usdcD6.totalSupply()).to.be.equal(_amount.mul(3));
        expect(await ot.totalSupply()).to.be.equal(parseEther("123.456").mul(3));
    });

    it("check ST => s11 => omniMint => user1(2122) => usdcD6 => payload is empty", async() => {
        const usdcD6 = await deployNew("Token", ["USDC", 6, 0, 0, 0]);
        const _amount = parseUnits("123.456",6);
        await router_omniMint(router, user1, usdcD6, 2, "0x", user1.address, _amount, _amount);
        await router_omniMint(router, user1, usdcD6, 1, "0x", user1.address, _amount, _amount);
        await router_omniMint(router, user1, usdcD6, 2, "0x", user1.address, _amount, _amount);
        await router_omniMint(router, user1, usdcD6, 2, "0x", user1.address, _amount, _amount);

        const ot = await getOmniToken(tokenManager2, usdcD6);
        expect(await usdcD6.totalSupply()).to.be.equal(_amount.mul(4));
        expect(await ot.totalSupply()).to.be.equal(parseEther("123.456").mul(3));
    });

    it("check ST => s11 => omniMint => user1(2122) => usdcD6 => payload is not empty", async() => {
        const usdcD6 = await deployNew("Token", ["USDC", 6, 0, 0, 0]);
        const _amount = parseUnits("123.456",6);
        const _payload = getPayloadUserA(user1);
        const _rc = await deployNew("ReceiverContract3", [router2.address]);

        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2, getLzTxObj);
        await router_omniMint(router, user1, usdcD6, 1, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2, getLzTxObj);
        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2, getLzTxObj);
        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2, getLzTxObj);

        const ot = await getOmniToken(tokenManager2, usdcD6);
        expect(await usdcD6.totalSupply()).to.be.equal(_amount.mul(4));
        expect(await ot.totalSupply()).to.be.equal(parseEther("123.456").mul(3));
        expect(await ot.balanceOf(_rc.address)).to.be.equal(parseEther("123.456").mul(3));
    });

    it("check ST => s11 => omniMint => user1(2122) => usdcD6 => payload is not empty + lzTxObj is valid", async() => {
        const usdcD6 = await deployNew("Token", ["USDC", 6, 0, 0, 0]);
        const _amount = parseUnits("123.456",6);
        const _payload = getPayloadUserA(user1);
        const _rc = await deployNew("ReceiverContract3", [router2.address]);
        const _rc2 = await deployNew("ReceiverContract3", [router2.address]);

        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2);
        await router_omniMint(router, user1, usdcD6, 1, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2, getLzTxObj);
        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2);
        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2, getLzTxObj);
        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc2.address, _amount, _amount, CHAIN_ID_LOCAL2, getLzTxObj);

        const ot = await getOmniToken(tokenManager2, usdcD6);
        expect(await usdcD6.totalSupply()).to.be.equal(_amount.mul(5));

        console.log(`${ot.address}`);
        console.log(`${formatEther(await ot.totalSupply())}`);
        expect(await ot.totalSupply()).to.be.equal(parseEther("123.456").mul(3));
        expect(await ot.balanceOf(_rc.address)).to.be.equal(parseEther("123.456").mul(2));
        expect(await ot.balanceOf(_rc2.address)).to.be.equal(parseEther("123.456").mul(1));
    });

    it("check ST => s11 => omniMint => user1(2122) => usdcD6 => lzTxObj is inValid", async() => {
        const usdcD6 = await deployNew("Token", ["USDC", 6, 0, 0, 0]);
        const _amount = parseUnits("123.456",6);
        const _payload = getPayloadUserA(user1);
        const _rc = await deployNew("ReceiverContract3", [router2.address]);
        const _rc2 = await deployNew("ReceiverContract3", [router2.address]);

        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2);
        await router_omniMint(router, user1, usdcD6, 1, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2);
        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc.address, _amount, _amount, CHAIN_ID_LOCAL2);
        await router_omniMint(router, user1, usdcD6, 2, _payload, _rc2.address, _amount, _amount, CHAIN_ID_LOCAL2, getLzTxObj);

        let ot = await getOmniToken(tokenManager2, usdcD6);
        expect(await usdcD6.totalSupply()).to.be.equal(_amount.mul(4));
        expect(ot.address).eq(AddressZero);

        await router_omniMint(router, user1, usdcD6, 1, _payload, _rc2.address, _amount, _amount, CHAIN_ID_LOCAL2, getLzTxObj);
        ot = await getOmniToken(tokenManager2, usdcD6);
        expect(ot.address).not.eq(AddressZero);
        expect(await ot.totalSupply()).to.be.equal(parseEther("123.456").mul(1));
        expect(await ot.balanceOf(_rc.address)).to.be.equal(0);
        expect(await ot.balanceOf(_rc2.address)).to.be.equal(parseEther("123.456").mul(1));
    });

    it("check ST => s12 => omniMint => user(2122)", async() => {
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 2);

        const poolAddress = await poolFactory.getPool(usdc.address);
        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await usdc.balanceOf(poolAddress)).to.be.equal(ONE_HUNDRED_E_18.mul(4));
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(3));
    });

    it("check ST => s12 => omniMint => user(2122) => user1+user2", async() => {
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user2, usdc, 2);

        const poolAddress = await poolFactory.getPool(usdc.address);
        expect(await usdc.balanceOf(poolAddress)).to.be.equal(ONE_HUNDRED_E_18.mul(4));

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(3));
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(2));
        expect(await ot.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18);
    });

    it("check ST => s12 => omniMint => user(212222) => user1+user2 => payload != 0x", async() => {
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 1);
        await router_omniMint(router, user1, usdc, 2, getPayloadUserA(user1));
        await router_omniMint(router, user2, usdc, 2, getPayloadUserA(user2));
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user2, usdc, 2);

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(await ot.totalSupply()).to.be.equal(ONE_HUNDRED_E_18.mul(3));
        expect(await ot.balanceOf(user1.address)).to.be.equal(ONE_HUNDRED_E_18.mul(2));
        expect(await ot.balanceOf(user2.address)).to.be.equal(ONE_HUNDRED_E_18);
    });

    it("check ST => s12 => omniMint => user(212222) => user1+user2 => payload != 0x v2", async() => {
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user1, usdc, 1, getPayloadUserA(user1));
        await router_omniMint(router, user1, usdc, 2, getPayloadUserA(user1));
        await router_omniMint(router, user2, usdc, 2, getPayloadUserA(user2));
        await router_omniMint(router, user1, usdc, 2);
        await router_omniMint(router, user2, usdc, 2);

        const ot = await getOmniToken(tokenManager2, usdc);
        expect(ot.address).eq(AddressZero);
    });
});
