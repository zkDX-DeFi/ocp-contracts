import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {AddressZero, CHAIN_ID_LOCAL2, TYPE_DEPLOY_AND_MINT} from "../helpers/constants";
import {getOCPB_omniMInt, getOCPB_omniRedeem} from "../helpers/utilsTest";
import {formatEther, parseEther} from "ethers/lib/utils";
import {LZ_NOT_ENOUGH_FEES} from "../helpers/errors";

describe("OCPB", async () => {

    let user1: any,
        user2: any,
        owner: any,
        usdc: any,
        ocpBridge: any,
        ocpBridge2: any


    beforeEach(async () => {
        ({owner, user1, user2, ocpBridge, ocpBridge2} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });
    it("check OCPB.FUNC => omniMint", async () => {
        const {b, _mintParams, _payload, _lzTxObj} = await getOCPB_omniMInt(owner);

        // await expect(b.connect(user1).omniMint(
        //     0,
        //     AddressZero,
        //     0,
        //     _mintParams,
        //     _payload,
        //     _lzTxObj
        // )).to.be.reverted;
        //
        // await b.omniMint(
        //     0,
        //     AddressZero,
        //     0,
        //     _mintParams,
        //     _payload,
        //     _lzTxObj
        // );
    });


    it("check OCPB.FUNC => quoteLayerZeroFee", async () => {
        const b = ocpBridge;
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: "0x"
        }
        // console.log(`${await b.quoteLayerZeroFee(
        //     0,
        //     0,
        //     "0x",
        //     _lzTxObj
        // )}`);
    });

    it("omniMint messaging reverted, not enough fees", async () => {
        let mintAmount = parseEther("1000");
        await expect(ocpBridge.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            user1.address,
            TYPE_DEPLOY_AND_MINT,
            [
                usdc.address,
                mintAmount,
                user2.address,
                "USDC",
                "USDC"
            ],
            "0x", [0, 0, "0x"]
        )).to.be.revertedWith(LZ_NOT_ENOUGH_FEES);
    });

    it("omniMint messaging suc", async () => {
        let mintAmount = parseEther("1000");
        let value = await ocpBridge.quoteLayerZeroFee(CHAIN_ID_LOCAL2, TYPE_DEPLOY_AND_MINT, "0x", [0, 0, "0x"]);
        await ocpBridge.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            user1.address,
            TYPE_DEPLOY_AND_MINT,
            [
                usdc.address,
                mintAmount,
                user2.address,
                "USDC",
                "USDC"
            ],
            "0x", [0, 0, "0x"],
            {value: value[0]}
        );
    });
});
