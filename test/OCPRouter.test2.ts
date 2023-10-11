import {deployFixture, deployNew, newWallet} from "../helpers/utils";
import {expect} from "chai";
import {
    AddressZero,
    ApproveAmount,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2,
    TYPE_DEPLOY_AND_MINT,
    TYPE_MINT
} from "../helpers/constants";
import {formatEther, parseEther} from "ethers/lib/utils";
import {ethers} from "hardhat";

/* added by Schneider */
describe("Router", async () => {

    let user1: any,
        user2: any,
        owner: any,
        usdc: any,
        bridge: any,
        bridge2: any,
        router: any,
        router2: any,
        tokenManager: any,
        tokenManager2: any,
        poolFactory: any,
        lzEndpoint2: any;

    beforeEach(async () => {
        ({
            owner, user1, user2, bridge, bridge2, router, router2,
            tokenManager, tokenManager2, poolFactory, lzEndpoint2
        } = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
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

    it("omni mint suc - type 2", async () => {

        let amountIn = parseEther("1000");
        await usdc.mint(user1.address, amountIn.mul(2));
        await usdc.connect(user1).approve(router.address, ApproveAmount);

        // first: deploy and mint
        await router.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            usdc.address,
            amountIn,
            user2.address,
            true,
            user1.address,
            "0x",
            ({
                dstGasForCall: 0,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }),
            {value: parseEther("0.1")}
        )

        // second: mint only
        let msgFee = await router.quoteLayerZeroFee(
            CHAIN_ID_LOCAL2,
            TYPE_MINT,
            "0x",
            {
                dstGasForCall: 0,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            });
        console.log("Mint Fee:", formatEther(msgFee[0]));

        await router.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            usdc.address,
            amountIn,
            user2.address,
            false,
            user1.address,
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
        expect(await usdc.balanceOf(poolAddr)).to.equal(amountIn.mul(2));

        // check bridge suc
        let path = ethers.utils.solidityPack(['address', 'address'], [bridge.address, bridge2.address]);
        expect(await lzEndpoint2.hasStoredPayload(CHAIN_ID_LOCAL, path)).to.be.false;

        // check balances
        let usdc2Addr = await tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        expect(await usdc2.balanceOf(user2.address)).to.equal(amountIn.mul(2));
        expect(await usdc2.totalSupply()).to.equal(amountIn.mul(2));
    });

    it("omni mint fail and force resume - type 2", async () => {

        let amountIn = parseEther("1000");
        await usdc.mint(user1.address, amountIn.mul(2));
        await usdc.connect(user1).approve(router.address, ApproveAmount);

        // mint only
        await router.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            usdc.address,
            amountIn,
            user2.address,
            false,
            user1.address,
            "0x",
            ({
                dstGasForCall: 0,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }),
            {value: parseEther("0.05")}
        )

        // check bridge fail
        let path = ethers.utils.solidityPack(['address', 'address'], [bridge.address, bridge2.address]);
        expect(await lzEndpoint2.hasStoredPayload(CHAIN_ID_LOCAL, path)).to.be.true;

        // deploy and mint - queued
        await router.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            usdc.address,
            amountIn,
            user2.address,
            true,
            user1.address,
            "0x",
            ({
                dstGasForCall: 0,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }),
            {value: parseEther("0.1")}
        )

        // check queue length = 1
        expect(await lzEndpoint2.getLengthOfQueue(CHAIN_ID_LOCAL, path)).to.eq(1);

        // force resume
        await bridge2.forceResumeReceive(CHAIN_ID_LOCAL, path);

        // check store payload & queue cleared
        expect(await lzEndpoint2.hasStoredPayload(CHAIN_ID_LOCAL, path)).to.be.false;
        expect(await lzEndpoint2.getLengthOfQueue(CHAIN_ID_LOCAL, path)).to.eq(0);

        // check deploy and mint suc
        let usdc2Addr = await tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        expect(await usdc2.balanceOf(user2.address)).to.equal(amountIn);
        expect(await usdc2.totalSupply()).to.equal(amountIn);
    });
});
