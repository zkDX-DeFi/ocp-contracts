import {deployFixture, deployNew, newWallet} from "../helpers/utils";
import {expect} from "chai";
import {
    AddressZero,
    ApproveAmount,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2, HASH_256_ZERO,
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

    async function isNonceSuc(nonce: number) {
        let path = ethers.utils.solidityPack(['address', 'address'], [bridge.address, bridge2.address]);
        return HASH_256_ZERO == await bridge2.failedMessages(CHAIN_ID_LOCAL, path, nonce);
    }

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
        let tx = await router.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            usdc.address,
            amountIn,
            user2.address,
            1,
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

        // check tx suc
        expect(await isNonceSuc(1)).to.equal(true);

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
            1,
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
            1,
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
            2,
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

        // check tx suc
        expect(await isNonceSuc(1)).to.eq(true);
        expect(await isNonceSuc(2)).to.eq(true);

        // check balances
        let usdc2Addr = await tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        expect(await usdc2.balanceOf(user2.address)).to.equal(amountIn.mul(2));
        expect(await usdc2.totalSupply()).to.equal(amountIn.mul(2));
    });

});
