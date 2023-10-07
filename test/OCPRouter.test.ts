import {deployFixture, deployNew, newWallet} from "../helpers/utils";
import {expect} from "chai";
import {AddressZero, CHAIN_ID_LOCAL, CHAIN_ID_LOCAL2, TYPE_DEPLOY_AND_MINT, TYPE_MINT} from "../helpers/constants";
import {
    getMintParams_ZERO,
    getOCPB_omniMInt,
    getOCPB_omniRedeem,
    getOCPR_BRIDGE_SETTINGS,
    getOCPR_WETH_ZERO, getRedeemObj_ZERO
} from "../helpers/utilsTest";
import {formatEther, parseEther, parseUnits} from "ethers/lib/utils";
import {OCPRouter} from "../typechain-types";
import {ethers} from "hardhat";

describe("OCPR", async () => {

    let user1: any,
        user2: any,
        owner: any,
        usdc: any,
        poolFactory: any,
        tokenManager: any,
        tokenManager2: any,
        router: any,
        router2: any,
        bridge: any,
        bridge2: any,
        lzEndpoint: any,
        lzEndpoint2: any;

    beforeEach(async () => {
        ({owner, user1, user2, poolFactory, tokenManager, tokenManager2, router, router2,
            bridge, bridge2, lzEndpoint, lzEndpoint2} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });
    it("check OCPR.FUNC => OMNIMINT", async() => {
        const r = router;
        const f = poolFactory;
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
        const r = router;

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
        const r = router;
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

        expect(await r.bridge()).not.eq(AddressZero);
        const _targetAddress = owner.address;
        await r.updateBridge(_targetAddress);
        expect(await r.bridge()).eq(_targetAddress);
    });

    it("check OCPR.FUNC => omniMintRemote()", async() => {
        const {r} = await getOCPR_BRIDGE_SETTINGS(owner);
        expect(await r.bridge()).eq(owner.address);
        const _mintParams = getMintParams_ZERO
        const _payload = "0x";
        const invalidUser = user1;
        await expect(r.connect(invalidUser).omniMintRemote(
            0,
            AddressZero,
            0,
            true, //_needDeploy = true
            _mintParams,
            0, // _dstGasForCall
            _payload
        )).to.be.revertedWith("OCPRouter: caller is not the bridge");

        await r.omniMintRemote(
            0,
            AddressZero,
            0,
            true, //_needDeploy = true
            _mintParams,
            0, // _dstGasForCall
            _payload
        );
    });

    it("check OCPR.FUNC => omniRedeemRemote()", async() => {
        const {r} = await getOCPR_BRIDGE_SETTINGS(owner);
        const _redeemParams = getRedeemObj_ZERO;
        const invalidUser = user1;

        await expect(r.connect(invalidUser).omniRedeemRemote(
            0,
            AddressZero,
            0,
            _redeemParams,
            0, // _dstGasForCall = 0
            "0x"
        )).to.be.revertedWith("OCPRouter: caller is not the bridge");

        await expect(r.omniRedeemRemote(
            0,
            AddressZero,
            0,
            _redeemParams,
            0, // _dstGasForCall = 0
            "0x"
        )).to.be.ok;
    });

    it("check OCPR.FUNC => retryCachedMint()", async() => {
        const r = router;

        await expect(r.retryCachedMint(
            0,
            AddressZero,
            0
        )).to.be.ok;
    });

    it("print deploy pool & token gas estimated", async () => {
        const poolFactory = await ethers.getContractFactory("OCPool");
        let poolTx = poolFactory.getDeployTransaction(usdc.address);
        let poolEstimate = await ethers.provider.estimateGas(poolTx);

        const tokenFactory = await ethers.getContractFactory("OmniToken");
        let tokenTx = tokenFactory.getDeployTransaction(
            "USDC",
            "USDC",
            parseEther("1000"),
            user2.address,
            AddressZero
        );
        let tokenEstimate = await ethers.provider.estimateGas(tokenTx);
        console.log(`Deploy Gas: Pool[${poolEstimate}] Token[${tokenEstimate}] Total[${poolEstimate.add(tokenEstimate)}]`);
    })

    it("omni deploy and mint suc", async () => {

        let refund = newWallet();
        let amountIn = parseEther("1000");
        let msgFee = await router.quoteLayerZeroFee(
            CHAIN_ID_LOCAL2,
            TYPE_DEPLOY_AND_MINT,
            "0x",
            {
                dstGasForCall: 0,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            });
        console.log("DeployMint Fee:", formatEther(msgFee[0]));

        await usdc.mint(user1.address, amountIn);
        await usdc.connect(user1).approve(router.address, amountIn);
        await router.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            usdc.address,
            amountIn,
            user2.address,
            true,
            refund.address,
            "0x",
            ({
                dstGasForCall: 0,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }),
            {value: msgFee[0]}
        )

        // check pool
        let poolAddr = await poolFactory.getPool(usdc.address);
        expect(poolAddr).to.not.equal(AddressZero);
        let pool = await ethers.getContractAt("OCPool", poolAddr);
        expect(await pool.token()).to.equal(usdc.address);
        expect(await usdc.balanceOf(poolAddr)).to.equal(amountIn);

        // check bridge suc
        let path = ethers.utils.solidityPack(['address', 'address'], [bridge.address, bridge2.address]);
        expect(await lzEndpoint2.hasStoredPayload(CHAIN_ID_LOCAL, path)).to.be.false;

        // check token
        let usdc2Addr = await tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        expect(usdc2Addr).to.not.equal(AddressZero);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        expect(await usdc2.balanceOf(user2.address)).to.equal(amountIn);
        expect(await usdc2.totalSupply()).to.equal(amountIn);
        let refundFee = await ethers.provider.getBalance(refund.address);
        expect(refundFee).to.gt(0);
        console.log("RefundFee:", formatEther(refundFee));
    });

    it("omniMint with payload suc", async () => {

        let receiverContract = await deployNew("ReceiverContract", [router2.address]);
        let amountIn = parseEther("1000");
        await usdc.mint(user1.address, amountIn);
        await usdc.connect(user1).approve(router.address, amountIn);

        let payload = ethers.utils.defaultAbiCoder.encode(['address'], [user1.address]);
        let msgFee = await router.quoteLayerZeroFee(
            CHAIN_ID_LOCAL2,
            TYPE_DEPLOY_AND_MINT,
            payload,
            {
                dstGasForCall: 300000,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            });
        console.log("DeployMint Fee:", formatEther(msgFee[0]));

        await router.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            usdc.address,
            parseEther("1000"),
            receiverContract.address,
            true,
            user1.address,
            payload,
            ({
                dstGasForCall: 300000,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }),
            {value: msgFee[0]}
        );

        let usdc2Addr = await tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        expect(await usdc2.totalSupply()).to.equal(amountIn);
        expect(await receiverContract.token()).to.equal(usdc2Addr);
        expect(await receiverContract.total()).to.equal(amountIn);
        expect(await receiverContract.balance(user1.address)).to.eq(amountIn);

    });
});
