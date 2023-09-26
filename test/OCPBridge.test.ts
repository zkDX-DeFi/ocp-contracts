import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {AddressZero} from "../helpers/constants";
import {getOCPB_omniMInt, getOCPB_omniRedeem} from "../helpers/utilsTest";

describe("OCPB", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        ocpBridge: any


    beforeEach(async () => {
        ({owner,user1, ocpBridge} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
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
        const {b, _redeemParams, _payload, _lzTxObj} = await getOCPB_omniRedeem(owner);

        await expect(b.connect(user1).omniRedeem(
            0,
            AddressZero,
            0,
            _redeemParams,
            _payload,
            _lzTxObj
        )).to.be.reverted;

        await b.omniRedeem(
            0,
            AddressZero,
            0,
            _redeemParams,
            _payload,
            _lzTxObj
        );
    });
    it("check OCPB.FUNC => quoteLayerZeroFee", async() => {
        const b = ocpBridge;
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: "0x"
        }
        console.log(`${await b.quoteLayerZeroFee(
            0,
            0,
            "0x",
            _lzTxObj
        )}`);
    });
});
