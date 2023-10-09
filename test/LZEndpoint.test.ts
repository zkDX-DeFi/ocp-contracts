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
import {
    ONE_HUNDRED_E_18,
    ONE_HUNDRED_E_6,
    ONE_THOUSAND_E_18,
    ONE_THOUSAND_E_6,
    POINT_ONE_E_18
} from "../helpers/constantsTest";

describe("LZEndpoint", async () => {

    let user1: any,
        user2: any,
        owner: any,
        usdc: any,
        bridge: any,
        bridge2: any,
        router : any,
        router2 : any,
        tokenManager: any,
        poolFactory: any,
        lzEndpoint: any,
        lzEndpoint2: any


    beforeEach(async () => {
        ({owner, user1, user2, bridge, bridge2, router, router2, tokenManager, poolFactory,lzEndpoint, lzEndpoint2} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });

    it("check LZ.FUNC => VARIABLES", async () => {
        const lz = lzEndpoint;
        const lz2 = lzEndpoint2;

        expect(lz.address).not.eq(AddressZero);
        expect(lz2.address).not.eq(AddressZero);
        expect(await lz.mockChainId()).eq(CHAIN_ID_LOCAL);
        expect(await lz2.mockChainId()).eq(CHAIN_ID_LOCAL2);
    });
});
