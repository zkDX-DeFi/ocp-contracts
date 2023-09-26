import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {AddressZero} from "../helpers/constants";
import {getOCPB_omniMInt, getOCPB_omniRedeem} from "../helpers/utilsTest";

describe("OCPPoolFactory", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        ocPoolFactory: any,
        ocpRouter: any


    beforeEach(async () => {
        ({owner,user1, ocPoolFactory, ocpRouter} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });
    it("check OCPR.FUNC => OMNIMINT", async() => {
        const r = ocpRouter;
        const f = ocPoolFactory;
        expect(await r.poolFactory()).eq(f.address);

        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: "0x"
        };
        await expect(r.omniMint(
            0,
            AddressZero, // _token
            0,
            AddressZero,
            AddressZero,
            "0x",
            _lzTxObj
        )).to.be.revertedWith("OCPRouter: token invalid");

        await expect(r.omniMint(
            0,
            usdc.address, // _token
            0,
            AddressZero, //_to = AddressZero
            AddressZero,
            "0x",
            _lzTxObj
        )).to.be.revertedWith("OCPRouter: receiver invalid");

        await expect(r.omniMint(
            0,
            usdc.address, // _token != AddressZero
            0,  // _amountIn = 0
            user1.address, // _to != AddressZero
            AddressZero,
            "0x",
            _lzTxObj
        )).to.be.revertedWith("OCPRouter: amountIn must be greater than 0");

        await expect(r.omniMint(
            0,
            usdc.address, // _token != AddressZero
            100,  // _amountIn = 100
            user1.address, // _to != AddressZero
            AddressZero,
            "0x",
            _lzTxObj
        )).to.be.ok;
    });
});
