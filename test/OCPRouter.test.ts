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
});
