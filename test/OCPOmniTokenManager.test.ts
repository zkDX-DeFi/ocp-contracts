import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {getMintParams_ZERO} from "../helpers/utilsTest";
import {AddressZero, CHAIN_ID_LOCAL, CHAIN_ID_LOCAL2} from "../helpers/constants";
import {parseEther} from "ethers/lib/utils";
import {ethers} from "hardhat";
import {
    OCPTOKENMANAGER_CALLER_IS_NOT_THE_TIMELOCK,
    OCPTOKENMANAGER_INVALID_INPUT,
    OWNABLE_CALLER_IS_NOT_THE_OWNER
} from "../helpers/errors";
import {ONE_HUNDRED_E_18, ONE_THOUSAND_E_18} from "../helpers/constantsTest";

describe("OCPOTM", async () => {

    let user1: any,
        user2: any,
        owner: any,
        usdc: any,
        router: any,
        tokenManager: any,
        poolFactory: any

    beforeEach(async () => {
        ({owner, user1, user2, router, tokenManager, poolFactory} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });
    it("check OCPTM.FUNC => createToken", async () => {
        const tm = tokenManager;

        const _mintParams = getMintParams_ZERO;
        const _lzEndpoint = AddressZero;
        const _srcChainId = 0;

        await tm.createOmniToken(_mintParams, _lzEndpoint, _srcChainId);
    });
    it("check OCPTM.FUNC => updateRouter", async () => {
        const tm = tokenManager;
        const r = router;

        expect(await tm.router()).eq(r.address);
        const invalidUser = user1;
        const validValue = owner.address;
        await expect(tm.connect(invalidUser)
            .updateRouter(validValue))
            .to.be.revertedWith(OCPTOKENMANAGER_CALLER_IS_NOT_THE_TIMELOCK);

        await expect(tm.updateRouter(validValue)).to.be.ok;
        expect(await tm.router()).eq(validValue)
    });
    it("check OCPTM.FUNC => omniMint", async () => {
        const tm = tokenManager;

        const _mintParams = [usdc.address, 1000, user1.address, "", ""];
        const _srcChainId = 0;

        await expect(
            tm.omniMint(_mintParams, _srcChainId)
        ).to.be.revertedWith("OCPTokenManager: caller is not the router");

        await tm.updateRouter(owner.address);
        await expect(
            tm.omniMint(_mintParams, _srcChainId))
            .to.be.ok;
    });
    it("check OCPTM.FUNC => omniBurn", async () => {
        const tm = tokenManager;
        const invalidUser = user1;
        const validUser = owner;
        await tm.updateRouter(validUser.address);

        const _omniToken = AddressZero;
        const _amount = 0;
        const _from = AddressZero;
        await expect(tm.connect(invalidUser).omniBurn(
            _omniToken,
            _amount,
            _from
        )).to.be.revertedWith("OCPTokenManager: caller is not the router");

        await expect(tm.connect(validUser).omniBurn(
            _omniToken,
            _amount,
            _from
        )).to.be.ok;
    });

    it("createOmniToken suc", async () => {
        let mintAmount = parseEther("1000");
        await tokenManager.connect(user1).createOmniToken(
            [
                usdc.address,
                mintAmount,
                user2.address,
                "USDC",
                "USDC"
            ],
            AddressZero, CHAIN_ID_LOCAL2
        );

        // check data
        let omniTokenAddr = await tokenManager.omniTokens(usdc.address, CHAIN_ID_LOCAL2);
        let omniToken = await ethers.getContractAt("OmniToken", omniTokenAddr);
        expect(omniTokenAddr).to.not.equal(AddressZero);
        expect(await tokenManager.sourceTokens(omniTokenAddr, CHAIN_ID_LOCAL2)).to.eq(usdc.address);
        // expect(await tokenManager.omniTokenList(0)).to.equal(omniTokenAddr);

        // check balances
        expect(await omniToken.totalSupply()).to.equal(mintAmount);
        expect(await omniToken.balanceOf(user2.address)).to.equal(mintAmount);
    });

    //added due to changes cb66d58995cd8d91c061e084b048cac4c3469799
    it("createOmniToken suc V2", async () => {
        const tm = tokenManager;
        const mintAmount = parseEther("1000");
        const _mintParams = {
            srcToken: usdc.address,
            amount: mintAmount,
            to: user2.address,
            name: "USDC",
            symbol: "USDC"
        };
        const _srcChainId = CHAIN_ID_LOCAL2;
        expect(await tm.omniTokens(_mintParams.srcToken, _srcChainId)).to.equal(AddressZero);
        await tokenManager.connect(user1).createOmniToken(
            _mintParams,
            AddressZero, CHAIN_ID_LOCAL2
        );

        expect(await tm.omniTokens(_mintParams.srcToken, _srcChainId)).to.not.equal(AddressZero);
        await tokenManager.connect(user1).createOmniToken(
            _mintParams,
            AddressZero, CHAIN_ID_LOCAL2
        );
    });

    /* added @20230928 */
    it("check OCPTM.VARIABLES => updateRouter", async () => {
        const tm = tokenManager;
        const r = router;
        expect(await tm.router()).eq(AddressZero);

        const invalidUser = user1;
        const validUser = owner;
        await expect(tm
            .connect(invalidUser)
            .updateRouter(r.address))
            .to.be.revertedWith(OCPTOKENMANAGER_CALLER_IS_NOT_THE_TIMELOCK);
        await expect(tm
            .connect(validUser)
            .updateRouter(r.address))
            .to.be.ok;

        expect (await tm.router()).eq(r.address);
    });

    it("check OCPTM.FUNC => approveSourceTokens()", async() => {
        const tm = tokenManager;
        const _omniTokens = [usdc.address];
        const _srcTokens = [usdc.address];
        const _srcChainIds = CHAIN_ID_LOCAL;
        await tm.approveSourceTokens(_omniTokens, _srcChainIds, _srcTokens);

        const _invalidOmniTokens = [usdc.address, usdc.address];
        await expect(tm
            .approveSourceTokens(_invalidOmniTokens, _srcChainIds, _srcTokens))
            .to.be.revertedWith(OCPTOKENMANAGER_INVALID_INPUT);

        const invalidUser = user1;
        await expect(tm
            .connect(invalidUser)
            .approveSourceTokens(_omniTokens, _srcChainIds, _srcTokens))
            .to.be.revertedWith(OCPTOKENMANAGER_CALLER_IS_NOT_THE_TIMELOCK);
    });

    it("check OCPTM.FUNC => requestAddSourceTokens()", async() => {
        const tm = tokenManager;
        const _srcTokens = [usdc.address];
        const _srcChainIds = [CHAIN_ID_LOCAL];
        const _omniToken = usdc.address;

        await tm.requestAddSourceTokens(_srcTokens, _srcChainIds, _omniToken);

        const _invalidSrcTokens = [usdc.address, usdc.address];
        await expect(tm
            .requestAddSourceTokens(_invalidSrcTokens, _srcChainIds, _omniToken))
            .to.be.revertedWith(OCPTOKENMANAGER_INVALID_INPUT);

        const _invalidUser = user1;
        await expect(tm
            .connect(_invalidUser)
            .requestAddSourceTokens(_srcTokens, _srcChainIds, _omniToken))
            .to.be.revertedWith(OCPTOKENMANAGER_CALLER_IS_NOT_THE_TIMELOCK);
    });

    it("check OCPTM.FUNC => updateTimeLock()", async() => {
        const tm = tokenManager;
        const _newTimeLock = user1.address;

        const invalidUser = user1;
        await expect(tm
            .connect(invalidUser)
            .updateTimeLock(_newTimeLock))
            .to.be.revertedWith(OCPTOKENMANAGER_CALLER_IS_NOT_THE_TIMELOCK);

        await tm.updateTimeLock(_newTimeLock);
    });

    it("check OCPOTM.FUNC => createOmniToken", async() => {
        const tm = tokenManager;

        expect(await tm.router()).eq(AddressZero);
        expect(await tm.timeLock()).eq(owner.address);

        const _mintParams = {
            srcToken: usdc.address,
            amount: ONE_THOUSAND_E_18,
            to: user2.address,
            name: "USDC",
            symbol: "USDC"
        };
        const _lzEndpoint = AddressZero;
        const _srcChainId = CHAIN_ID_LOCAL2;
        expect(await tm.omniTokens(usdc.address, _srcChainId)).eq(AddressZero);

        await tm.createOmniToken(
            _mintParams,
            _lzEndpoint,
            _srcChainId
        );

        expect(await tm.omniTokens(usdc.address, _srcChainId)).to.not.equal(AddressZero);
        const omniTokenAddress = await tm.omniTokens(usdc.address, _srcChainId);
        expect(await tm.sourceTokens(omniTokenAddress, _srcChainId)).eq(usdc.address);
    });

    it("check OCPOTM.FUNC => updateRouter", async() => {
        const tm = tokenManager;
        const user = user1;
        const _routerAddress = AddressZero;

        await expect(tm.connect(user).updateRouter(_routerAddress)).to.be.reverted;
        await expect(tm.updateRouter(_routerAddress)).to.be.ok;
    });

    it("check OCPOTM.FUNC => updateTimeLock", async() => {
        const tm = tokenManager;
        const user = user1;
        const _timeLockAddress = AddressZero;

        await expect(tm.connect(user).updateTimeLock(_timeLockAddress)).to.be.reverted;
        await expect(tm.updateTimeLock(_timeLockAddress)).to.be.ok;
    });

    it("check OCPF.FUNC => createPool()", async() => {
        const f = poolFactory;
        const tokenAddress = usdc.address;
        expect(await f.getPool(tokenAddress)).eq(AddressZero);

        await f.createPool(tokenAddress);
        expect(await f.getPool(tokenAddress)).to.not.equal(AddressZero);

        await expect(f.createPool(tokenAddress))
            .to.be.revertedWith("OCPPoolFactory: Pool already exists");
    });

    it("check OCP.FUNC => constructor()", async() => {
        const _tokenAddress = usdc.address;
        const pool = await deployNew("OCPool", [_tokenAddress]);


        await pool.withdraw(user1.address, ONE_THOUSAND_E_18);


        expect(await pool.token()).eq(_tokenAddress);
        expect(await pool.router()).eq(AddressZero);
    });

    it("check OT.FUNC => constructor()", async() => {
        const _toAddress = user1.address;
        const _lzEndpoint = AddressZero;
        const _tokenSymbol = "USDC";
        const _constructorParams = [
            _tokenSymbol,
            _tokenSymbol,
            ONE_THOUSAND_E_18,
            _toAddress,
            _lzEndpoint
        ];
        const ot = await deployNew("OmniToken", _constructorParams);

        const _constructorParams2 = [
            _tokenSymbol,
            _tokenSymbol,
            0,
            _toAddress,
            _lzEndpoint
        ];
        const ot2 = await deployNew("OmniToken", _constructorParams2);

        const _toAddress2 = user2.address;
        await ot2.mint(_toAddress2, ONE_THOUSAND_E_18);

        await ot2.burn(_toAddress2, ONE_HUNDRED_E_18);
        await ot2.burn(_toAddress2, ONE_HUNDRED_E_18);

        await expect(
            ot2.connect(user1)
            .burn(_toAddress2, ONE_HUNDRED_E_18))
            .to.be.revertedWith("Ownable: caller is not the owner");

        await expect(
            ot2.connect(user2)
            .mint(_toAddress2, ONE_HUNDRED_E_18))
            .to.be.revertedWith("Ownable: caller is not the owner");


    });
});
