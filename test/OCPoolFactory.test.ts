import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {AddressZero} from "../helpers/constants";
import {getOCPB_omniMInt, getOCPB_omniRedeem} from "../helpers/utilsTest";

describe("OCPPoolFactory", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        ocPoolFactory: any


    beforeEach(async () => {
        ({owner,user1, ocPoolFactory} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });

    it("create pool suc", async () => {
        const f = ocPoolFactory;
        expect(await f.getPool(usdc.address)).to.equal(AddressZero);
        await f.connect(user1).createPool(usdc.address);
        expect(await f.getPool(usdc.address)).to.not.equal(AddressZero);

        await expect(f.connect(user1).createPool(usdc.address)).to.be.reverted;
    });
});
