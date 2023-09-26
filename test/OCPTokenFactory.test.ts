import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";

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
        expect(await f.owner()).eq(owner.address);
    });
});
