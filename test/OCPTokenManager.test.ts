import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {getMintParams_ZERO} from "../helpers/utilsTest";
import {AddressZero} from "../helpers/constants";

describe("OCPTM", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        ocpTokenManager: any

    beforeEach(async () => {
        ({owner,user1, ocpTokenManager} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });
    it("check OCPTM.FUNC => createToken", async() => {
        const tm = ocpTokenManager;

        const _mintParams = getMintParams_ZERO;
        const _lzEndpoint = AddressZero;
        const _srcChainId = 0;

        await tm.createToken(_mintParams, _lzEndpoint, _srcChainId);
    });

    it("check OCPTM.FUNC => updateRouter", async() => {
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

    it("check OCPTM.FUNC => omniMint", async() => {
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

});
