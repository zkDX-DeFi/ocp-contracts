import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {AddressZero} from "../helpers/constants";
import {getOCPB_omniMInt} from "../helpers/utilsTest";

describe("OCPPoolFactory", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        ocpBridge: any,
        poolFactory: any,
        ocpRouter: any,
        ocpTokenFactory: any,
        ocpTokenManager: any


    beforeEach(async () => {
        ({owner,user1, ocpBridge, poolFactory,ocpRouter,ocpTokenFactory, ocpTokenManager} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });

    it("create pool suc", async () => {
        expect(await poolFactory.getPool(usdc.address)).to.equal(AddressZero);
        await poolFactory.connect(user1).createPool(usdc.address, 6);
        expect(await poolFactory.getPool(usdc.address)).to.not.equal(AddressZero);

        await expect(poolFactory.connect(user1).createPool(usdc.address, 6)).to.be.reverted;
    });
    it("check OCPB.FUNC => omniMint", async() => {
        const {b, _mintParams, _payload, _lzTxObj} = await getOCPB_omniMInt(owner);

        await expect(b.connect(user1).omniMint(
            0,
            AddressZero,
            0,
            _mintParams,
            _payload,
            _lzTxObj
        )).to.be.reverted;

        await b.omniMint(
          0,
          AddressZero,
          0,
            _mintParams,
            _payload,
            _lzTxObj
        );
    })

    it("check OCPB.FUNC => omniRedeem", async() => {

    });
});
