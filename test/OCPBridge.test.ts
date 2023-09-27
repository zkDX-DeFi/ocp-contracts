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
        const _remoteChainId = CHAIN_ID_LOCAL2;
        await expect(b.connect(user1).omniMint(
            _remoteChainId,
            AddressZero,
            0,
            _mintParams,
            _payload,
            _lzTxObj
        )).to.be.reverted;

        await expect(b.omniMint(
            _remoteChainId,
            AddressZero,
            0,
            _mintParams,
            _payload,
            _lzTxObj
        )).to.be.reverted;
    });

    it("check OCPB.FUNC => omniMint v2", async () => {
        const b = ocpBridge;
        const _remoteChainId = CHAIN_ID_LOCAL2;

        const _mintParams = {
            srcToken: AddressZero,
            srcPool: AddressZero,
            dstChainId: 0,
            amount: 0,
            to: AddressZero,
            name: "",
            symbol: "",
            sharedDecimals: 0
        }
        const _payload = "0x";
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: "0x"
        }

        await expect(b.omniMint(
            _remoteChainId,
            AddressZero,
            0,
            _mintParams,
            _payload,
            _lzTxObj
        )).to.be.ok;
    });


    it("check OCPB.FUNC => quoteLayerZeroFee", async () => {
        const b = ocpBridge;
        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _type = 1;
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: "0x"
        }
        console.log(`${await b.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            "0x",
            _lzTxObj
        )}`);
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
