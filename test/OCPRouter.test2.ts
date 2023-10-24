import {deployFixture, deployNew, newWallet} from "../helpers/utils";
import {expect} from "chai";
import {
    AddressZero,
    ApproveAmount,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2, DEFAULT_GAS_LIMIT_2, DEFAULT_GAS_LIMIT_3, HASH_256_ZERO,
    TYPE_DEPLOY_AND_MINT,
    TYPE_MINT, TYPE_REDEEM
} from "../helpers/constants";
import {formatEther, parseEther, parseUnits} from "ethers/lib/utils";
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
        lzEndpoint2: any,
        weth: any

    beforeEach(async () => {
        ({
            owner, user1, user2, bridge, bridge2, router, router2, tokenManager, tokenManager2,
            poolFactory, lzEndpoint2, weth
        } = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 6, 0, 0, 0]);
    });

    async function isNonceSuc(nonce: number, dstChainId = CHAIN_ID_LOCAL2) {
        if (dstChainId == CHAIN_ID_LOCAL) {
            let path = ethers.utils.solidityPack(['address', 'address'], [bridge2.address, bridge.address]);
            return HASH_256_ZERO == await bridge.failedMessages(CHAIN_ID_LOCAL2, path, nonce);
        } else {
            let path = ethers.utils.solidityPack(['address', 'address'], [bridge.address, bridge2.address]);
            return HASH_256_ZERO == await bridge2.failedMessages(CHAIN_ID_LOCAL, path, nonce);
        }
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

    it("omni mint suc - type 1", async () => {

        let refund = newWallet();
        let amountIn = parseUnits("1000", 6);
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
        let amountIn2 = parseUnits("1000", 18);
        let usdc2Addr = await tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        expect(usdc2Addr).to.not.equal(AddressZero);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        expect(await usdc2.balanceOf(user2.address)).to.equal(amountIn2);
        expect(await usdc2.totalSupply()).to.equal(amountIn2);
        let refundFee = await ethers.provider.getBalance(refund.address);
        expect(refundFee).to.gt(0);
        console.log("RefundFee:", formatEther(refundFee));

        // check token list
        let omniTokenList = await tokenManager2.getOmniTokenList();
        expect(omniTokenList.length).to.equal(1);
        expect(omniTokenList[0]).to.equal(usdc2Addr);
    });

    it("omni mint with payload suc - type 1", async () => {

        let receiverContract = await deployNew("ReceiverContract", [router2.address]);
        let amountIn = parseUnits("1000", 6);
        await usdc.mint(user1.address, amountIn);
        await usdc.connect(user1).approve(router.address, ApproveAmount);

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
            amountIn,
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

        let amountIn2 = parseUnits("1000", 18);
        let usdc2Addr = await tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        expect(await usdc2.totalSupply()).to.equal(amountIn2);
        expect(await receiverContract.token()).to.equal(usdc2Addr);
        expect(await receiverContract.total()).to.equal(amountIn2);
        expect(await receiverContract.balance(user1.address)).to.eq(amountIn2);

    });

    it("omni mint fail, retry suc - type 1", async () => {

        let amountIn = parseUnits("1000", 6);
        await usdc.mint(user1.address, amountIn.mul(2));
        await usdc.connect(user1).approve(router.address, ApproveAmount);

        // lower gas, cause tx fail
        await bridge.updateGasLookups([31338], [1], [1000000]);

        // second: redeem
        let msgFee = await router.quoteLayerZeroFee(CHAIN_ID_LOCAL2, TYPE_DEPLOY_AND_MINT, "0x", [0, 0, "0x"]);
        let tx = await router.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            usdc.address,
            amountIn,
            user2.address,
            1,
            user1.address,
            "0x", [0, 0, "0x"],
            {value: msgFee[0]}
        );

        // check tx fail
        expect(await isNonceSuc(1)).to.eq(false);

        // retry by user
        const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const event = bridge2.interface.parseLog(txReceipt.logs[2]);
        let path = ethers.utils.solidityPack(['address', 'address'], [bridge.address, bridge2.address]);
        await bridge2.retryMessage(CHAIN_ID_LOCAL, path, 1, event.args._payload);

        // check tx suc
        expect(await isNonceSuc(1)).to.eq(true);
    });

    it("omni mint fail, revert suc - type 1", async () => {

        let amountIn = parseUnits("1000", 6);
        await usdc.mint(user1.address, amountIn);
        await usdc.connect(user1).approve(router.address, ApproveAmount);

        let payload = ethers.utils.defaultAbiCoder.encode(['uint256'], [1]);
        let tx = await router.connect(user1).omniMint(
            CHAIN_ID_LOCAL2,
            usdc.address,
            amountIn,
            user2.address,
            1,
            user1.address,
            payload,
            ({
                dstGasForCall: 100000,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }),
            {value: parseEther("0.1")}
        )

        // usdc deposited
        let pool = await poolFactory.getPool(usdc.address);
        expect(await usdc.balanceOf(pool)).to.eq(amountIn);

        // check tx fail
        expect(await isNonceSuc(1)).to.eq(false);

        // retry fail
        const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const event = bridge2.interface.parseLog(txReceipt.logs[2]);
        let path = ethers.utils.solidityPack(['address', 'address'], [bridge.address, bridge2.address]);
        await expect(bridge2.retryMessage(CHAIN_ID_LOCAL, path, 1, event.args._payload)).to.be.reverted;
        expect(await isNonceSuc(1)).to.eq(false);

        // revert by user
        let msgFee = await router2.quoteLayerZeroFee(CHAIN_ID_LOCAL, TYPE_REDEEM, "0x", [0, 0, "0x"]);
        await bridge2.revertMessage(CHAIN_ID_LOCAL, path, 1, event.args._payload, {value: msgFee[0]});

        // check tx suc
        expect(await isNonceSuc(1)).to.eq(true);
        expect(await isNonceSuc(1, CHAIN_ID_LOCAL)).to.eq(true);

        // balance refunded
        expect(await usdc.balanceOf(pool)).to.eq(0);
        expect(await usdc.balanceOf(user1.address)).to.eq(amountIn);

    });

    it("omni mint suc - type 2", async () => {

        let amountIn = parseUnits("1000", 6);
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
        let amountIn2 = parseUnits("1000", 18);
        let usdc2Addr = await tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        expect(await usdc2.balanceOf(user2.address)).to.equal(amountIn2.mul(2));
        expect(await usdc2.totalSupply()).to.equal(amountIn2.mul(2));
    });

    it("redeem suc", async () => {

        let amountIn = parseUnits("1000", 6);
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

        // second: redeem
        let msgFee = await router2.quoteLayerZeroFee(
            CHAIN_ID_LOCAL,
            TYPE_REDEEM,
            "0x",
            {
                dstGasForCall: 0,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            });
        console.log("Redeem Fee:", formatEther(msgFee[0]));

        let usdc2Addr = tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        let amountIn2 = parseUnits("500", 18);
        let receiver = newWallet();

        await router2.connect(user2).omniRedeem(
            CHAIN_ID_LOCAL,
            usdc2.address,
            amountIn2,
            receiver.address,
            user2.address,
            "0x",
            ({
                dstGasForCall: 0,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }),
            {value: msgFee[0]}
        )

        // check tx suc
        expect(await isNonceSuc(1, CHAIN_ID_LOCAL)).to.eq(true);

        // check burn suc
        expect(await usdc2.totalSupply()).to.equal(amountIn2);
        expect(await usdc2.balanceOf(user2.address)).to.equal(amountIn2);

        // check dst balances
        let poolAddr = await poolFactory.getPool(usdc.address);
        expect(await usdc.balanceOf(poolAddr)).to.equal(parseUnits("500", 6));
        expect(await usdc.balanceOf(receiver.address)).to.equal(parseUnits("500", 6));

    });

    it("redeem suc with payload", async () => {

        let amountIn = parseUnits("1000", 6);
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
            "0x", [0, 0, "0x"],
            {value: parseEther("0.1")}
        )

        // second: redeem with payload
        let receiverContract = await deployNew("ReceiverContract", [router.address]);
        let payload = ethers.utils.defaultAbiCoder.encode(['address'], [user1.address]);
        let usdc2Addr = tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        let amountIn2 = parseUnits("500", 18);

        await router2.connect(user2).omniRedeem(
            CHAIN_ID_LOCAL,
            usdc2.address,
            amountIn2,
            receiverContract.address,
            user2.address,
            payload,
            [300000, 0, "0x"],
            {value: parseEther("0.1")}
        )

        // check tx suc
        expect(await isNonceSuc(1, CHAIN_ID_LOCAL)).to.eq(true);

        // check burn suc
        expect(await usdc2.totalSupply()).to.equal(amountIn2);
        expect(await usdc2.balanceOf(user2.address)).to.equal(amountIn2);

        // check dst balances
        let poolAddr = await poolFactory.getPool(usdc.address);
        expect(await usdc.balanceOf(poolAddr)).to.equal(parseUnits("500", 6));
        expect(await usdc.balanceOf(receiverContract.address)).to.equal(parseUnits("500", 6));

    });

    it("redeem fail, revert suc", async () => {

        let amountIn = parseUnits("1000", 6);
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
            "0x", [0, 0, "0x"],
            {value: parseEther("0.1")}
        )

        // second: redeem with payload
        let payload = ethers.utils.defaultAbiCoder.encode(['address'], [user1.address]);
        let usdc2Addr = tokenManager2.omniTokens(usdc.address, CHAIN_ID_LOCAL);
        let usdc2 = await ethers.getContractAt("OmniToken", usdc2Addr);
        let amountIn2 = parseUnits("500", 18);

        let tx = await router2.connect(user2).omniRedeem(
            CHAIN_ID_LOCAL,
            usdc2.address,
            amountIn2,
            user1.address,
            user2.address,
            payload,
            [300000, 0, "0x"],
            {value: parseEther("0.1")}
        )

        // check tx fail
        expect(await isNonceSuc(1, CHAIN_ID_LOCAL)).to.eq(false);

        // retry fail
        const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const event = bridge.interface.parseLog(txReceipt.logs[1]);
        let path = ethers.utils.solidityPack(['address', 'address'], [bridge2.address, bridge.address]);
        await expect(bridge.retryMessage(CHAIN_ID_LOCAL2, path, 1, event.args._payload)).to.be.reverted;
        expect(await isNonceSuc(1, CHAIN_ID_LOCAL)).to.eq(false);

        // revert by user
        let msgFee = await router.quoteLayerZeroFee(CHAIN_ID_LOCAL2, TYPE_MINT, "0x", [0, 0, "0x"]);
        await bridge.revertMessage(CHAIN_ID_LOCAL2, path, 1, event.args._payload, {value: msgFee[0]});

        // check tx suc
        expect(await isNonceSuc(1, CHAIN_ID_LOCAL)).to.eq(true);
        expect(await isNonceSuc(2)).to.eq(true);

        // balance refunded
        expect(await usdc2.totalSupply()).to.equal(parseEther("1000"));
        expect(await usdc2.balanceOf(user2.address)).to.eq(parseEther("1000"));
    });

    it("omni mint ETH with payload suc - type 1", async () => {

        let receiverContract = await deployNew("ReceiverContract", [router2.address]);
        let amountIn = parseEther("0.5");

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

        await router.connect(user1).omniMintETH(
            CHAIN_ID_LOCAL2,
            amountIn,
            receiverContract.address,
            TYPE_DEPLOY_AND_MINT,
            user1.address,
            payload,
            ({
                dstGasForCall: 300000,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }),
            {value: msgFee[0].add(amountIn)}
        );

        let weth2Address = await tokenManager2.omniTokens(weth.address, CHAIN_ID_LOCAL);
        let weth2 = await ethers.getContractAt("OmniToken", weth2Address);
        expect(await weth2.totalSupply()).to.equal(amountIn);
        expect(await receiverContract.token()).to.equal(weth2Address);
        expect(await receiverContract.total()).to.equal(amountIn);
        expect(await receiverContract.balance(user1.address)).to.eq(amountIn);

    });

    it("omni redeem ETH suc", async () => {

        let amountIn = parseEther("0.5");

        // first: deploy and mint
        await router.connect(user1).omniMintETH(
            CHAIN_ID_LOCAL2,
            amountIn,
            user2.address,
            TYPE_DEPLOY_AND_MINT,
            user1.address,
            "0x", [0, 0, "0x"],
            {value: parseEther("0.6")}
        );

        // second: redeem
        let msgFee = await router2.quoteLayerZeroFee(
            CHAIN_ID_LOCAL,
            TYPE_REDEEM,
            "0x", [0, 0, "0x"]);
        console.log("Redeem Fee:", formatEther(msgFee[0]));

        let weth2Addr = tokenManager2.omniTokens(weth.address, CHAIN_ID_LOCAL);
        let weth2 = await ethers.getContractAt("OmniToken", weth2Addr);
        let receiver = newWallet();

        await router2.connect(user2).omniRedeem(
            CHAIN_ID_LOCAL,
            weth2Addr,
            parseEther("0.3"),
            receiver.address,
            user2.address,
            "0x",
            ({
                dstGasForCall: 0,
                dstNativeAmount: 0,
                dstNativeAddr: '0x'
            }),
            {value: msgFee[0]}
        )

        // check burn suc
        expect(await weth2.totalSupply()).to.equal(parseEther("0.2"));
        expect(await weth2.balanceOf(user2.address)).to.equal(parseEther("0.2"));

        // check dst balances
        let poolAddr = await poolFactory.getPool(weth.address);
        expect(await weth.balanceOf(poolAddr)).to.equal(parseEther("0.2"));
        expect(await ethers.provider.getBalance(receiver.address)).to.equal(parseEther("0.3"));
    });
});
