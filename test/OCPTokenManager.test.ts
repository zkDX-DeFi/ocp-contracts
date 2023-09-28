import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {getMintParams_ZERO} from "../helpers/utilsTest";
import {AddressZero, CHAIN_ID_LOCAL, CHAIN_ID_LOCAL2} from "../helpers/constants";
import {parseEther} from "ethers/lib/utils";
import {ethers} from "hardhat";
import {OCPTOKENMANAGER_INVALID_INPUT, OWNABLE_CALLER_IS_NOT_THE_OWNER} from "../helpers/errors";

describe("OCPTM", async () => {

    let user1: any,
        user2: any,
        owner: any,
        usdc: any,
        ocpRouter: any,
        ocpTokenManager: any

    beforeEach(async () => {
        ({owner, user1, user2, ocpRouter, ocpTokenManager} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });
    it("check OCPTM.FUNC => createToken", async () => {
        const tm = ocpTokenManager;

        const _mintParams = getMintParams_ZERO;
        const _lzEndpoint = AddressZero;
        const _srcChainId = 0;

        await tm.createOmniToken(_mintParams, _lzEndpoint, _srcChainId);
    });
    it("check OCPTM.FUNC => updateRouter", async () => {
        const tm = ocpTokenManager;

        expect(await tm.router()).eq(AddressZero);
        const invalidUser = user1;
        const validValue = owner.address;
        await expect(tm.connect(invalidUser)
            .updateRouter(validValue))
            .to.be.revertedWith("Ownable: caller is not the owner");

        await expect(tm.updateRouter(validValue)).to.be.ok;
        expect(await tm.router()).eq(validValue)
    });
    it("check OCPTM.FUNC => omniMint", async () => {
        const tm = ocpTokenManager;

        const _srcToken = usdc;
        const _dstChainId = 0;
        const _amount = 1000;
        const _to = user1;

        await expect(
            tm.omniMint(_srcToken.address, _dstChainId, _amount, _to.address)
        ).to.be.revertedWith("OCPTokenManager: caller is not the router");

        await tm.updateRouter(owner.address);
        await expect(
            tm.omniMint(_srcToken.address, _dstChainId, _amount, _to.address))
            .to.be.ok;
    });
    it("check OCPTM.FUNC => omniBurn", async () => {
        const tm = ocpTokenManager;
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
    // it("check OCPTM.FUNC => approveSourceTokens", async () => {
    //     const tm = ocpTokenManager;
    //     await tm.approveSourceTokens();
    // });
    // it("check OCPTM.FUNC => requestAddSourceTokens()", async () => {
    //     const tm = ocpTokenManager;
    //     const _omniToken = usdc;
    //     const _srcChainIds = [0];
    //     const _srcTokens = [usdc.address];
    //     await tm.requestAddSourceTokens(
    //         _omniToken.address,
    //         _srcChainIds,
    //         _srcTokens
    //     );
    // });

    it("createOmniToken suc", async () => {
        let mintAmount = parseEther("1000");
        await ocpTokenManager.connect(user1).createOmniToken(
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
        let omniTokenAddr = await ocpTokenManager.omniTokens(usdc.address, CHAIN_ID_LOCAL2);
        let omniToken = await ethers.getContractAt("OmniToken", omniTokenAddr);
        expect(omniTokenAddr).to.not.equal(AddressZero);
        expect(await ocpTokenManager.sourceTokens(omniTokenAddr, CHAIN_ID_LOCAL2)).to.eq(usdc.address);
        expect(await ocpTokenManager.omniTokenList(0)).to.equal(omniTokenAddr);

        // check balances
        expect(await omniToken.totalSupply()).to.equal(mintAmount);
        expect(await omniToken.balanceOf(user2.address)).to.equal(mintAmount);
    });

    //added due to changes cb66d58995cd8d91c061e084b048cac4c3469799
    it("createOmniToken suc V2", async () => {
        const tm = ocpTokenManager;
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
        await ocpTokenManager.connect(user1).createOmniToken(
            _mintParams,
            AddressZero, CHAIN_ID_LOCAL2
        );

        expect(await tm.omniTokens(_mintParams.srcToken, _srcChainId)).to.not.equal(AddressZero);
        await ocpTokenManager.connect(user1).createOmniToken(
            _mintParams,
            AddressZero, CHAIN_ID_LOCAL2
        );
    });

    /* added @20230928 */
    it("check OCPTM.VARIABLES => updateRouter", async () => {
        const tm = ocpTokenManager;
        const r = ocpRouter;
        expect(await tm.router()).eq(AddressZero);

        const invalidUser = user1;
        const validUser = owner;
        await expect(tm
            .connect(invalidUser)
            .updateRouter(r.address))
            .to.be.revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);
        await expect(tm
            .connect(validUser)
            .updateRouter(r.address))
            .to.be.ok;

        expect (await tm.router()).eq(r.address);
    });

    it("check OCPTM.FUNC => approveSourceTokens()", async() => {
        const tm = ocpTokenManager;
        const _omniTokens = [usdc.address];
        const _srcTokens = [usdc.address];
        const _srcChainIds = CHAIN_ID_LOCAL;
        await tm.approveSourceTokens(_omniTokens, _srcChainIds, _srcTokens);

        const _invalidOmniTokens = [usdc.address, usdc.address];
        await expect(tm
            .approveSourceTokens(_invalidOmniTokens, _srcChainIds, _srcTokens))
            .to.be.revertedWith(OCPTOKENMANAGER_INVALID_INPUT);
    });

    it("check OCPTM.FUNC => requestAddSourceTokens()", async() => {
        const tm = ocpTokenManager;
        const _srcTokens = [usdc.address];
        const _srcChainIds = [CHAIN_ID_LOCAL];
        const _omniToken = usdc.address;

        await tm.requestAddSourceTokens(_srcTokens, _srcChainIds, _omniToken);
    });
});
