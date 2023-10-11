import {deployFixture, deployNew} from "../helpers/utils";
import {expect} from "chai";
import {
    AddressZero,
    CHAIN_ID_LOCAL,
    CHAIN_ID_LOCAL2,
    CHAIN_ID_LOCAL3,
    TYPE_DEPLOY_AND_MINT, TYPE_MINT
} from "../helpers/constants";
import {getOCPB_omniMInt, getOCPB_omniRedeem} from "../helpers/utilsTest";
import {formatEther, parseEther} from "ethers/lib/utils";
import {LZ_NOT_ENOUGH_FEES, OWNABLE_CALLER_IS_NOT_THE_OWNER} from "../helpers/errors";
import {
    ONE_HUNDRED_E_18,
    ONE_HUNDRED_E_6,
    ONE_THOUSAND_E_18,
    ONE_THOUSAND_E_6,
    POINT_ONE_E_18
} from "../helpers/constantsTest";
import {ethers} from "hardhat";

async function router_omni_mint(usdc: any, USER: any, R: any, _needDeploy: any = true) {
    let _remoteChainId = CHAIN_ID_LOCAL2;
    let _token = usdc;
    let _amountIn = ONE_THOUSAND_E_18;
    let _toAddress = USER.address;
    // let _needDeploy = true;
    let _refundAddress = USER.address;

    // let _userPayload =
    //     ethers.utils.defaultAbiCoder.encode(['address'], [USER.address]);
    let _userPayload = "0x";
    let _lzTxObj = {
        dstGasForCall: 600000,
        dstNativeAmount: 0,
        dstNativeAddr: '0x',
    };
    await _token.mint(USER.address, _amountIn);
    await _token.connect(USER).approve(R.address, _amountIn);

    console.log(`_token: ${_token.address}`)
    await R.connect(USER).omniMint(
        _remoteChainId,
        _token.address,
        _amountIn,
        _toAddress,
        _needDeploy,
        _refundAddress,
        _userPayload,
        _lzTxObj,
        {value: POINT_ONE_E_18}
    );
}

describe("OCPR", async () => {

    let user1: any,
        user2: any,
        owner: any,
        usdc: any,
        bridge: any,
        bridge2: any,
        router : any,
        router2 : any,
        tokenManager: any,
        tokenManager2: any,
        poolFactory: any,
        poolFactory2: any


    beforeEach(async () => {
        ({owner, user1, user2, bridge, bridge2, router, router2, tokenManager, tokenManager2, poolFactory,poolFactory2} = await deployFixture());
        usdc = await deployNew("Token", ["USDC", 18, 0, 0, 0]);
    });

    it("check ScenarioTest => S1", async() => {
         const r = router;
         const r2 = router2;
         const tm2 = tokenManager2;
         console.log(`r.address: ${r.address}`);
         console.log(`r2.address: ${r2.address}`);

         const _token = usdc;
         console.log(`_token.address: ${_token.address}`);
         const _user = user1;
         const _amountIn = ONE_THOUSAND_E_18;
         await _token.mint(_user.address, _amountIn);
         await _token.connect(_user).approve(r.address, _amountIn);

         const _remoteChainId = CHAIN_ID_LOCAL2;
         const _omniMintAmount = ONE_HUNDRED_E_18;
         const _to = _user.address;
         const _needDeploy = true;
         const _refundAddress = _user.address;
         const _userPayload = "0x";
         const _lzTxObj = {
                dstGasForCall: 600000,
                dstNativeAmount: 0,
                dstNativeAddr: '0x',
         };

         await r.connect(_user).omniMint(
                _remoteChainId,
                _token.address,
                _omniMintAmount,
                _to,
                _needDeploy,
                _refundAddress,
                _userPayload,
                _lzTxObj,
                {value: POINT_ONE_E_18}
         );

         const _srcChainId = CHAIN_ID_LOCAL;
         console.log(`${await tm2.omniTokens(_token.address, _srcChainId)}`);
         const _omniTokenAddress = await tm2.omniTokens(_token.address, _srcChainId);

         const _omniToken = await ethers.getContractAt("OmniToken", _omniTokenAddress);
         console.log(`_omniToken.address: ${_omniToken.address}`);
         console.log(`_omniToken.totalSupply(): ${formatEther(await _omniToken.totalSupply())}`);
         console.log(`_omniToken.balanceOf(_user.address): ${formatEther(await _omniToken.balanceOf(_user.address))}`);

        await r.connect(_user).omniMint(
            _remoteChainId,
            _token.address,
            _omniMintAmount,
            _to,
            _needDeploy,
            _refundAddress,
            _userPayload,
            _lzTxObj,
            {value: POINT_ONE_E_18}
        );

        console.log(`${await tm2.omniTokens(_token.address, _srcChainId)}`);

        console.log(`_omniToken.totalSupply(): ${formatEther(await _omniToken.totalSupply())}`);
        console.log(`_omniToken.balanceOf(_user.address): ${formatEther(await _omniToken.balanceOf(_user.address))}`);
    });
});
