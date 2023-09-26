import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {getMintParams_ZERO} from "../helpers/utilsTest";
import {AddressZero} from "../helpers/constants";

describe("OCPTF", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        ocpTokenFactory: any,
        ocpTokenManager: any


    beforeEach(async () => {
        ({owner,user1, ocpTokenFactory, ocpTokenManager} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });
    it("check OCPTF.FUNC => updateTokenManager", async() => {
        const f = ocpTokenFactory;
        const tm = ocpTokenManager;
        expect(await f.tokenManager()).eq(tm.address);

        const invalidUser = user1;
        await expect(f.connect(invalidUser)
            .updateTokenManager(user1.address))
            .to.be.reverted;

        await expect(f.updateTokenManager(user1.address))
            .to.be.ok;
    });

    it("check OCPTF.FUNC => createToken", async() => {
        const f = ocpTokenFactory;
        await f.updateTokenManager(owner.address);
        const _mintParams = getMintParams_ZERO;

        const invalidUser = user1;
        await expect(f
            .connect(invalidUser)
            .createToken(
                _mintParams,
                AddressZero,
                0)).to.be.revertedWith("OCPTokenFactory: caller is not the tokenManager");

        await expect(f.createToken(
            _mintParams,
            AddressZero,
            0
        )).to.be.ok;
    });
});
