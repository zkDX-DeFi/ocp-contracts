import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {getOT_ZERO} from "../helpers/utilsTest";
import {AddressZero} from "../helpers/constants";
import {OWNABLE_CALLER_IS_NOT_THE_OWNER} from "../helpers/errors";
import {OT_BURN_AMOUNT, OT_MINT_AMOUNT} from "../helpers/constantsTest";

describe("OT", async () => {
    let user1: any,
        owner: any,
        usdc: any,
        ot : any,
        op : any

    beforeEach(async () => {
        ({owner,user1} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);

        const _amount = OT_MINT_AMOUNT;
        const _accountAddress = owner.address;
        ot = await deployNew("OmniToken", [
            "OmniToken",
            "OT",
            _amount,
            _accountAddress,
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

        const _amount = OT_MINT_AMOUNT;
        const _accountAddress = owner.address;

        await expect(ot.connect(invalidUser).mint(
            _accountAddress, _amount)).to.be.revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);
        await ot.connect(validUser).mint(
            _accountAddress, _amount);
    });

    it("check OT.FUNC => BURN", async() => {
        const validUser = owner;
        const invalidUser = user1;

        const _amount = OT_BURN_AMOUNT;
        const _accountAddress = owner.address;
        await expect(ot.connect(invalidUser).burn(
            _accountAddress, _amount)).to.be.revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);
        await (ot.connect(validUser).burn(
            _accountAddress, _amount));
    });
});
