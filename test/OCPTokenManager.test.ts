import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {getMintParams_ZERO} from "../helpers/utilsTest";
import {AddressZero} from "../helpers/constants";
import {OWNABLE_CALLER_IS_NOT_THE_OWNER} from "../helpers/errors";

describe("OCPTM", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        ocpTokenManager: any

    beforeEach(async () => {
        ({owner, user1, ocpTokenManager} = await deployFixture());
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

    it("check OCPTM.FUNC => addSourceToken", async () => {
        const tm = ocpTokenManager;
        const invalidUser = user1;
        const validUser = owner;

        expect(await tm.owner()).eq(owner.address);

        const _omniToken = AddressZero;
        const _srcChainId = 0;
        const _srcToken = usdc.address;
        const _srcPool = AddressZero;
        const _symbolCheck = "USDC";

        await expect(tm.connect(invalidUser).addSourceToken(
            _omniToken,
            _srcChainId,
            _srcToken,
            _srcPool,
            _symbolCheck
        )).to.be.revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);

        await expect(tm.connect(validUser).addSourceToken(
            _omniToken,
            _srcChainId,
            _srcToken,
            _srcPool,
            _symbolCheck
        )).to.be.ok;
    });

    it("check OCPTM.FUNC => getAssetURIs", async () => {
        const tm = ocpTokenManager;
        const _chainIds = [0, 0];
        const _pools = [AddressZero, AddressZero];

        console.log(`${await tm.getAssetURIs(
            _chainIds,
            _pools
        )}`);
    });

    it("check OCPTM.FUNC => approveSourceTokens", async () => {
        const tm = ocpTokenManager;
        await tm.approveSourceTokens();
    });

    it("check OCPTM.FUNC => requestAddSourceTokens()", async () => {
        const tm = ocpTokenManager;
        const _omniToken = usdc;
        const _srcChainIds = [0];
        const _srcTokens = [usdc.address];
        await tm.requestAddSourceTokens(
            _omniToken.address,
            _srcChainIds,
            _srcTokens
        );
    })

});
