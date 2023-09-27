import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {getMintParams_ZERO, getOT_ZERO} from "../helpers/utilsTest";
import {AddressZero} from "../helpers/constants";
import {OWNABLE_CALLER_IS_NOT_THE_OWNER} from "../helpers/errors";

describe("OT", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        ocpTokenManager: any,
        ot : any,
        op : any

    beforeEach(async () => {
        ({owner,user1, ocpTokenManager} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
        op = await deployNew("OCPool",[]);
        ot = await deployNew("OmniToken", [
            "OmniToken",
            "OT",
            1000,
            owner.address,
            AddressZero,
            owner.address, //tm.address = owner.address
            0,
            AddressZero
        ]);
    });

    it("check OT.FUNC => CONSTRUCTOR", async() => {
        const {ot} = await getOT_ZERO(owner, 1000, AddressZero);
        const {ot: ot2} = await getOT_ZERO(owner, 0, AddressZero);
    });

    it("check OT.FUNC => MINT", async() => {
        expect(await ot.owner()).eq(owner.address);
        const validUser = owner;
        const invalidUser = user1;

        await expect(ot.connect(invalidUser).mint(
            owner.address, 2000)).to.be.revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);

        await expect(ot.connect(validUser).mint(
            owner.address, 2000)).to.be.ok;
    });

    it("check OT.FUNC => BURN", async() => {
        const validUser = owner;
        const invalidUser = user1;

        await expect(ot.connect(invalidUser).burn(
            owner.address, 2000)).to.be.revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);

        await expect(ot.connect(validUser).burn(
            owner.address, 2000)).to.be.ok;

    });

    it("check OT.FUNC => assetURIs", async () => {
        const tm = ocpTokenManager;
        const {ot} = await getOT_ZERO(owner, 1000, tm.address);
        expect(await ot.tokenManager()).eq(tm.address);

        console.log(`${await ot.assetURIs()}`);
    });

    it("check OP.FUNC => redeem", async() => {
        await op.withdraw(
            AddressZero,
            0
        );
    });
});
