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

});
