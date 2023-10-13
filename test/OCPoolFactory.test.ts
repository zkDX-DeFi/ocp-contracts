import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {AddressZero} from "../helpers/constants";
import {getOCPB_omniMInt, getOCPB_omniRedeem} from "../helpers/utilsTest";
import {ethers} from "hardhat";

describe("OCPPoolFactory", async () => {

    let user1: any,
        owner: any,
        usdc: any,
        poolFactory: any

    beforeEach(async () => {
        ({owner,user1, poolFactory} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });

    it("check OCPF.FUNC => createPool()", async () => {
        const f = poolFactory;
        expect(await f.getPool(usdc.address)).to.equal(AddressZero);
        await f.connect(user1).createPool(usdc.address);
        expect(await f.getPool(usdc.address)).to.not.equal(AddressZero);

        await expect(f.connect(user1).createPool(usdc.address)).to.be.reverted;
    });
    it("check OCPF.FUNC => createPool() v2", async() => {
        const f = poolFactory;
        const token = usdc;
        await f.createPool(token.address);
        expect(await f.getPool(token.address)).to.not.equal(AddressZero);


        const poolAddress = await f.getPool(token.address);
        const p = await ethers.getContractAt("OCPool", poolAddress);
        expect(await p.token()).to.equal(token.address);
        expect(await p.factory()).to.equal(poolFactory.address);
    });

    it("check OCPF.FUNC=> WITHDRAW", async() => {
        const f = poolFactory;
        await expect(f.withdraw(usdc.address, user1.address, 0))
            .to.be.revertedWith("OCPoolFactory: Pool does not exist");
        await f.createPool(usdc.address);
        await f.withdraw(usdc.address, user1.address, 0);
    })
});
