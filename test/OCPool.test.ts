import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {getMintParams_ZERO, getOT_ZERO} from "../helpers/utilsTest";
import {AddressZero} from "../helpers/constants";
import {OWNABLE_CALLER_IS_NOT_THE_OWNER} from "../helpers/errors";

describe("OP", async () => {
    let user1: any,
        owner: any,
        usdc: any,
        op : any

    beforeEach(async () => {
        ({owner,user1} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
        op = await deployNew("OCPool",[usdc.address]);
    });
    it("check OP.FUNC => withdraw", async() => {
        await op.withdraw(user1.address, 0);
    });
});
