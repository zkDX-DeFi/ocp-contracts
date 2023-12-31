import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {
    AddressZero,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2,
    CHAIN_ID_LOCAL3,
    TYPE_DEPLOY_AND_MINT, TYPE_MINT, TYPE_REDEEM, TYPE_TRANSFER
} from "../helpers/constants";
import {getLzTxObj, getOCPB_omniMInt, getOCPB_omniRedeem, router_omniMint} from "../helpers/utilsTest";
import {formatEther, parseEther} from "ethers/lib/utils";
import {LZ_NOT_ENOUGH_FEES, OWNABLE_CALLER_IS_NOT_THE_OWNER} from "../helpers/errors";
import {ONE_THOUSAND_E_18} from "../helpers/constantsTest";
import {ethers} from "hardhat";

describe("OCPB", async () => {

    let user1: any,
        user2: any,
        owner: any,
        usdc: any,
        bridge: any,
        bridge2: any


    beforeEach(async () => {
        ({owner, user1, user2, bridge, bridge2} = await deployFixture());
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
        ));
    });

    it("check OCPB.FUNC => omniMint v2", async () => {
        const b = bridge;
        const _remoteChainId = CHAIN_ID_LOCAL2;

        const _mintParams = {
            srcToken: AddressZero,
            sender: owner.address,
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
        const _value = {value: parseEther("0.1")};

        await expect(b.omniMint(
            _remoteChainId,
            AddressZero,
            0,
            _mintParams,
            _payload,
            _lzTxObj,_value
        )).to.be.reverted;

        await b.updateGasLookups([CHAIN_ID_LOCAL2], [0], [300000]);

        await b.omniMint(
            _remoteChainId,
            AddressZero,
            0,
            _mintParams,
            _payload,
            _lzTxObj,
            _value
        );
    });


    it("check OCPB.FUNC => quoteLayerZeroFee", async () => {
        const b = bridge;
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

        await expect(b.quoteLayerZeroFee(
            _remoteChainId,
            0,
            "0x",
            _lzTxObj
        )).to.be.revertedWith("OCPBridge: invalid quote type");
    });

    it("check OCPB.FUNC => _txParamBuilder => dstNativeAmount >0", async () => {
        const b = bridge;
        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _type = 1;
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 1000,
            dstNativeAddr: usdc.address
        }
        console.log(`${await b.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            "0x",
            _lzTxObj
        )}`);

        await expect(b.quoteLayerZeroFee(
            _remoteChainId,
            0,
            "0x",
            _lzTxObj
        )).to.be.revertedWith("OCPBridge: invalid quote type");

    });

    it("omniMint messaging reverted, not enough fees", async () => {
        let mintAmount = parseEther("1000");
        await expect(bridge.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            user1.address,
            TYPE_DEPLOY_AND_MINT,
            [
                usdc.address,
                user1.address,
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
        let value = await bridge.quoteLayerZeroFee(CHAIN_ID_LOCAL2, TYPE_DEPLOY_AND_MINT, "0x", [0, 0, "0x"]);
        await bridge.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            user1.address,
            TYPE_DEPLOY_AND_MINT,
            [
                usdc.address,
                user1.address,
                mintAmount,
                user2.address,
                "USDC",
                "USDC"
            ],
            "0x", [0, 0, "0x"],
            {value: value[0]}
        );
    });

    it("check OCPB.FUNC => updateGasLookups()", async() => {
        const b = bridge;
        const invalidUser = user1;

        console.log(`${await b.owner()}`);
        console.log(`${owner.address}`);

        const _chainIds = [CHAIN_ID_LOCAL2, CHAIN_ID_LOCAL3];
        const _types = [1, 2];

        const _gasLookup = [1000,2000];

        await expect(b.connect(invalidUser).updateGasLookups(
            _chainIds,
            _types,
            _gasLookup
        )).to.be.revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);

        await b.updateGasLookups(_chainIds, _types, _gasLookup);

        const invalidChainIds = [CHAIN_ID_LOCAL2, CHAIN_ID_LOCAL3, CHAIN_ID_LOCAL];
        await expect(b.updateGasLookups(
            invalidChainIds,
            _types,
            _gasLookup
        )).to.be.revertedWith("OCPBridge: invalid params");
    });

    it("check OCPB.FUNC => quoteLayerZeroFee()", async () => {
        let mintAmount = parseEther("1000");

        const b = bridge;
        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _type = TYPE_DEPLOY_AND_MINT;
        const _userPayload = "0x";
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: "0x"
        };

        const [value,value2] = await b.quoteLayerZeroFee(
            _remoteChainId,
            _type,
            _userPayload,
            _lzTxObj
        );
        console.log(`${formatEther(value)}, ${value2}`);


        const OPRUSER = user1;
        const _refundAddress = OPRUSER.address;
        const _mintParams = {
            srcToken: usdc.address,
            sender: OPRUSER.address,
            amount : ONE_THOUSAND_E_18,
            to: OPRUSER.address,
            name: "USDC",
            symbol : "USDC"
        };
        await b.connect(OPRUSER).omniMint(
            _remoteChainId,
            _refundAddress,
            _type,
            _mintParams,
            _userPayload,
            _lzTxObj,
            {value: value}
        );

        const _remoteChainId2 = CHAIN_ID_LOCAL2;
        await b.connect(OPRUSER).omniMint(
            _remoteChainId2,
            _refundAddress,
            _type,
            _mintParams,
            _userPayload,
            _lzTxObj,
            {value: value}
        );

        const _type2 = TYPE_TRANSFER;
        await expect(b.quoteLayerZeroFee(
            _remoteChainId2,
            _type2,
            _userPayload,
            _lzTxObj
        )).to.be.reverted;
    });

    it("check OCPB.FUNC => updateRouter()", async () => {
        const b = bridge;
        await b.updateRouter(bridge2.address);

        const invalidUser = user1;
        await expect(b.connect(invalidUser)
            .updateRouter(bridge2.address))
            .to.be.revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);
    });

    it("check OCPB.FUNC => updateTrustedRemotes()", async() => {
        const b = bridge;

        const _remoteChainIds = [CHAIN_ID_LOCAL2, CHAIN_ID_LOCAL3];
        const _paths = ["0x", "0x"];
        const _invalidUser = user1;
        await expect(b.connect(_invalidUser)
            .updateTrustedRemotes(_remoteChainIds, _paths))
            .revertedWith(OWNABLE_CALLER_IS_NOT_THE_OWNER);

        const _invalidPaths = ["0x", "0x", "0x"];
        await expect(b.updateTrustedRemotes(_remoteChainIds, _invalidPaths))
            .revertedWith("OCPBridge: invalid params");

        await b.updateTrustedRemotes(_remoteChainIds, _paths);
    });

    it("check OCPB.FUNC => omniMint => onlyRouter", async() => {
        const b = bridge;

        const _remoteChainId = CHAIN_ID_LOCAL2;
        const _refundAddress = user1.address;
        const _type = TYPE_DEPLOY_AND_MINT;
        const _redeemObj = {
            srcToken: usdc.address,
            sender: owner.address,
            amount: 0,
            to: user1.address,
        };
        const _payload = "0x";
        const _lzTxObj = getLzTxObj;

        await expect(b.omniRedeem(
            _remoteChainId,
            _refundAddress,
            _type,
            _redeemObj,
            _payload,
            _lzTxObj
        )).to.be.revertedWith("OCPBridge: caller is not the router");
    });

    it("check OCPB.FUNC => revertMessage", async() => {
        const b = bridge;
        const _srcChainId = CHAIN_ID_LOCAL;
        const _srcAddress = usdc.address;
        const _nonce = 1;
        const _payload = "0x";
        console.log(`${await b.failedMessages(
            _srcChainId,
            _srcAddress,
            _nonce,
        )}`);

        await expect(b.revertMessage(
            _srcChainId,
            _srcAddress,
            _nonce,
            _payload)).to.be.revertedWith("OCPBridge: no stored message");
    });
});
