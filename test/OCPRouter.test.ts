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
import {ONE_THOUSAND_E_18} from "../helpers/constantsTest";

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
        poolFactory: any


    beforeEach(async () => {
        ({owner, user1, user2, bridge, bridge2, router, router2, tokenManager, poolFactory} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });
    it("check OCPR.VARIABLES => bridge()", async () => {
        const r = router;
        const b = bridge;
        const tm = tokenManager;
        const f = poolFactory;
        expect(await r.bridge()).eq(b.address);
        expect(await r.tokenManager()).eq(tm.address);
        expect(await r.poolFactory()).eq(f.address);
    });

});
