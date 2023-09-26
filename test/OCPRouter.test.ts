import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {AddressZero} from "../helpers/constants";
import {getOCPB_omniMInt, getOCPB_omniRedeem, getOCPR_WETH_ZERO} from "../helpers/utilsTest";
import {parseEther} from "ethers/lib/utils";
import {OCPRouter} from "../typechain-types";

describe("OCPR", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        ocPoolFactory: any,
        ocpBridge: any,
        ocpRouter: any


    beforeEach(async () => {
        ({owner,user1, ocPoolFactory, ocpRouter, ocpBridge} = await deployFixture());
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

    it("check OCPR.FUNC => omniMintETH", async() => {
        const r = ocpRouter;

        let _remoteChainId = 0;
        let _amountIn = 0;
        let _to = AddressZero;
        let _refundAddress = AddressZero;
        let _payload = "0x";
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: "0x"
        }

        await expect(r.omniMintETH(
            _remoteChainId,
            _amountIn,
            _to,
            _refundAddress,
            _payload,
            _lzTxObj
        )).to.be.revertedWith("OCPRouter: send value must be greater than amountIn");

        const _value = {value: parseEther("0.001")};
        await expect(r.omniMintETH(
            _remoteChainId,
            _amountIn,
            _to,
            _refundAddress,
            _payload,
            _lzTxObj, _value
        )).to.be.revertedWith("OCPRouter: receiver invalid");

        _to = user1.address;
        await expect(r.omniMintETH(
            _remoteChainId,
            _amountIn,
            _to,
            _refundAddress,
            _payload,
            _lzTxObj, _value
        )).to.be.revertedWith("OCPRouter: amountIn must be greater than 0");

        _amountIn = 100;
        await expect(r.omniMintETH(
            _remoteChainId,
            _amountIn,
            _to,
            _refundAddress,
            _payload,
            _lzTxObj, _value
        )).to.be.ok;

        const {r: r2} = await getOCPR_WETH_ZERO(owner);
        await expect(r2.omniMintETH(
            _remoteChainId,
            100,
            _to,
            _refundAddress,
            _payload,
            _lzTxObj, _value)).to.be.revertedWith("OCPRouter: weth not set yet");
    });

    it("check OCPR.FUNC => quoteLayerZeroFee()", async() => {
        const r = ocpRouter;
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: "0x"
        };

        expect( (await r.quoteLayerZeroFee(
            0,
            0,
            "0x",
            _lzTxObj
        ))[0]).to.be.eq(0);

        expect( (await r.quoteLayerZeroFee(
            0,
            100,
            "0x",
            _lzTxObj
        ))[1]).to.be.eq(0);
    });

    it("check OCPR.FUNC => omniRedeem()", async() => {
        const {r} = await getOCPR_WETH_ZERO(owner);
        const _lzTxObj = {
            dstGasForCall: 0,
            dstNativeAmount: 0,
            dstNativeAddr: "0x"
        };
        await expect(r.omniRedeem(
            0,
            AddressZero,
            0,
            AddressZero, //to = address(0)
            AddressZero,
            "0x",
            _lzTxObj
        )).to.be.revertedWith("OCPRouter: receiver invalid");

        await expect(r.omniRedeem(
            0,
            AddressZero,
            0,
            user1.address, //to != address(0)
            AddressZero, //refundAddress = address(0)
            "0x",
            _lzTxObj
        )).to.be.revertedWith("OCPRouter: amountIn must be greater than 0");

        await expect(r.omniRedeem(
            0,
            AddressZero,
            100, //amountIn = 100
            user1.address, //to != address(0)
            AddressZero, //refundAddress = address(0)
            "0x",
            _lzTxObj
        )).to.be.ok;
    });

    it("check OCPR.FUNC => updateBridge()", async () => {
        const {r} = await getOCPR_WETH_ZERO(owner);
        const invalidUser = user1;
        expect(await r.owner()).eq(owner.address);

        await expect(r.connect(invalidUser)
            .updateBridge(owner.address))
            .to.be.revertedWith("Ownable: caller is not the owner");

        expect(await r.bridge()).eq(AddressZero);
        await r.updateBridge(owner.address);
        expect(await r.bridge()).eq(owner.address);
    });
});
