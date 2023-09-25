import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {AddressZero} from "../helpers/constants";

describe("OCPPoolFactory", async () => {

    let user1: any,
        usdc: any,
        poolFactory: any

    beforeEach(async () => {
        ({user1, poolFactory} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });

    it("create pool suc", async () => {
        expect(await poolFactory.getPool(usdc.address)).to.equal(AddressZero);
        await poolFactory.connect(user1).createPool(usdc.address, 6);
        expect(await poolFactory.getPool(usdc.address)).to.not.equal(AddressZero);
    });
});
