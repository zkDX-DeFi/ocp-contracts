# Changelog

## [1.4.1](https://github.com/zkDX-DeFi/ocp-contracts/compare/v1.4.0...v1.4.1) (2023-10-12)


### Bug Fixes

* add console.log in OCPR.SOL ([88b81cb](https://github.com/zkDX-DeFi/ocp-contracts/commit/88b81cbd683a280c54286827be4daf35de1920ef))


### Code Refactoring

* change bridge nonblocking mode ([a2a7283](https://github.com/zkDX-DeFi/ocp-contracts/commit/a2a7283f62006d3325f95e5b0d56905546702dd5))


### Tests

* add test cases ([7a3c323](https://github.com/zkDX-DeFi/ocp-contracts/commit/7a3c323b3c2c8d01ac3b156b243b3dda99a57482))
* check ST =&gt; S6 => omniMint => _type = 2 && payload = 0x ([3c41733](https://github.com/zkDX-DeFi/ocp-contracts/commit/3c417331b6fbac2d37b4e50cb8168e8096cdef88))
* check ST =&gt; S6 => omniMint => _type = 3 or 4 ([6f9ce71](https://github.com/zkDX-DeFi/ocp-contracts/commit/6f9ce71d02074613b1dd26be81514524bc8c87fb))
* check ST =&gt; s7 => omniMint => _type = 1 => _omniToken ([9c49ba5](https://github.com/zkDX-DeFi/ocp-contracts/commit/9c49ba56639175d861d21166096a49b89231181e))
* check ST =&gt; s8 => omniMint => _type=1 + _type=2 + _type=1 ([20af122](https://github.com/zkDX-DeFi/ocp-contracts/commit/20af122d58b40a6dc2c729b221b4326b0fa572d5))
* check STEST =&gt; S5 => omniMint => _type = 1 && payload != 0x ([13e644c](https://github.com/zkDX-DeFi/ocp-contracts/commit/13e644c9a98e7f1b02791d2d291d97a1a6daf04c))
* code coverage = 100% ([d477ee2](https://github.com/zkDX-DeFi/ocp-contracts/commit/d477ee29110c8c0b2c0b4ca27864c864aa510717))
* new test cases ([acc9616](https://github.com/zkDX-DeFi/ocp-contracts/commit/acc96164c77247f386c7cc8825ffb1a25107af60))
* tuning failed test cases ([fdebf9d](https://github.com/zkDX-DeFi/ocp-contracts/commit/fdebf9dd1b5ea46980cb1ac5ebaae399ae3cdc43))
* tuning failed test cases && code coverage = 100% ([30363eb](https://github.com/zkDX-DeFi/ocp-contracts/commit/30363ebb6243ac36342bdc3db4d21528c05b8ea9))
* tuning test cases ([1eb5a85](https://github.com/zkDX-DeFi/ocp-contracts/commit/1eb5a85ae8a0bf380125bde0447defaecb0c50dd))


### CI

* merge fix ([a54a6b6](https://github.com/zkDX-DeFi/ocp-contracts/commit/a54a6b69b4b947d9e36df175e66d956cc3670263))

## [1.4.0](https://github.com/zkDX-DeFi/ocp-contracts/compare/v1.3.1...v1.4.0) (2023-10-11)


### Features

* add mint type 2 ([a326d13](https://github.com/zkDX-DeFi/ocp-contracts/commit/a326d1316bfb160495a27f36814ef295fff44f26))


### Bug Fixes

* tuning failed test cases ([bb35443](https://github.com/zkDX-DeFi/ocp-contracts/commit/bb3544335e932cce3b8eb1da31c2e97342e41d2d))
* update testcase ([989c613](https://github.com/zkDX-DeFi/ocp-contracts/commit/989c6135390b1e4b509c268012978eeb6491cf16))


### Code Refactoring

* change _needDeploy to _type ([2be87b4](https://github.com/zkDX-DeFi/ocp-contracts/commit/2be87b44afe470556b620be54ca1b1ebd2283fcb))


### Tests

* check OCPR.FUNC =&gt; omniMint() v2 ([cb65829](https://github.com/zkDX-DeFi/ocp-contracts/commit/cb6582990083090bfe2895859cf58d30f9ff8749))
* check OCPR.FUNC =&gt; omniMint() v2 ([7316006](https://github.com/zkDX-DeFi/ocp-contracts/commit/7316006441b2b1879d23d955138c39d7f7c9517f))
* check OCPR.FUNC =&gt; omniMint() v3 ([5ec5c17](https://github.com/zkDX-DeFi/ocp-contracts/commit/5ec5c17c5a39792d36f0abfaf6b8279da64a7c3e))
* check ScenarioTest =&gt; S1 ([7a3520c](https://github.com/zkDX-DeFi/ocp-contracts/commit/7a3520c8d342b3768e00f7547fba157c9b8e2f35))
* check ScenarioTest =&gt; S2 => omniMint && _needDeploy = false ([5556392](https://github.com/zkDX-DeFi/ocp-contracts/commit/555639204ead7e2ad62db1381032297370563f6b))
* check STEST =&gt; S3 => omniMint => _payLoad is 0x ([68bdf30](https://github.com/zkDX-DeFi/ocp-contracts/commit/68bdf305453deae877f130aeade884e054112ca7))
* check STEST =&gt; S4 => omniMint => _payLoad is 0x => V2 ([917963e](https://github.com/zkDX-DeFi/ocp-contracts/commit/917963ee499bc97c0347ffa5777f52224734b5ed))
* check STEST =&gt; S5 => omniMint => _payLoad is not 0x ([1e58a17](https://github.com/zkDX-DeFi/ocp-contracts/commit/1e58a1755e5a7dee220395db2b7764079793619b))
* code coverage = 100% ([28cd442](https://github.com/zkDX-DeFi/ocp-contracts/commit/28cd44295e5e2c0faf002d63e2f65c9e8fbb9ee5))
* code coverage = 100% ([9b2bf24](https://github.com/zkDX-DeFi/ocp-contracts/commit/9b2bf24588c031348626a6594e6d654581c483b1))
* code coverage = 100% ([3850878](https://github.com/zkDX-DeFi/ocp-contracts/commit/3850878206bfccbe7c3f345f0113614a5657ab2c))
* code coverage = 100% ([94d225b](https://github.com/zkDX-DeFi/ocp-contracts/commit/94d225bd8688cfc12f26e8d3197ac1de29db8654))
* code coverage = 100% ([f5f2346](https://github.com/zkDX-DeFi/ocp-contracts/commit/f5f2346fb1e8d0bf49929370cc592405c98c0455))
* tuning failed test cases ([b75bda4](https://github.com/zkDX-DeFi/ocp-contracts/commit/b75bda45be56a4834b6ad9741ae13df04b86fbbf))
* tuning failed test cases ([fad4db5](https://github.com/zkDX-DeFi/ocp-contracts/commit/fad4db51c6fe11f4d6990b5c3b42bfb0ead3338f))
* tuning failed test cases ([73bf291](https://github.com/zkDX-DeFi/ocp-contracts/commit/73bf29190f962f590da8470db0c156a8e3fa9d5d))
* tuning failed test cases ([20b00fc](https://github.com/zkDX-DeFi/ocp-contracts/commit/20b00fcc44a498d64d0d3b7dda8fb1040f709332))
* tuning failed test cases ([2f55aac](https://github.com/zkDX-DeFi/ocp-contracts/commit/2f55aacf5b5c8de5e04bec28820847239c787b1c))

## [1.3.1](https://github.com/zkDX-DeFi/ocp-contracts/compare/v1.3.0...v1.3.1) (2023-10-10)


### Bug Fixes

* add console log in SOL ([40b5a35](https://github.com/zkDX-DeFi/ocp-contracts/commit/40b5a35a26f7186be3c24c416e105cb0388a2aa3))
* add console.log code in sol ([e310b47](https://github.com/zkDX-DeFi/ocp-contracts/commit/e310b47a4493a6dee4ca74190b5cab0fd92346af))
* add console.log in sol file ([6f3db5f](https://github.com/zkDX-DeFi/ocp-contracts/commit/6f3db5f6d308c5cd50bd2c496a3bee7b744dc8a2))
* add console.log in sol file ([c3059cd](https://github.com/zkDX-DeFi/ocp-contracts/commit/c3059cd83cea99404e42e0345b18002d662eecd3))
* add console.log in sol file ([bfed294](https://github.com/zkDX-DeFi/ocp-contracts/commit/bfed294640dd2f9a05d80d03cb2f3e5f08221469))
* code coverage = 100% ([1663790](https://github.com/zkDX-DeFi/ocp-contracts/commit/1663790bb8445c9188846d9006d3ceb52b759ff7))
* ReceiverContract2.sol ([3ce973a](https://github.com/zkDX-DeFi/ocp-contracts/commit/3ce973ac1a1846bb33e99d4e1d087feee52374bb))
* removed MOCKTM.SOL ([d99cbbf](https://github.com/zkDX-DeFi/ocp-contracts/commit/d99cbbf8515410fba3890691e61be2a9ac8fc596))
* tuning log code ([a233d23](https://github.com/zkDX-DeFi/ocp-contracts/commit/a233d23c20377966577cc84dee12647c0a66aae2))


### Code Refactoring

* removed unused code ([4700f78](https://github.com/zkDX-DeFi/ocp-contracts/commit/4700f788ab7ccb8354f8fc5b393b404cf2045950))
* rename OCPR.TEST =&gt; OCPS.TEST ([afa34bd](https://github.com/zkDX-DeFi/ocp-contracts/commit/afa34bd16f81911b0aed8be61a1de3daa4a3dc1e))


### Performance Improvements

* update setup bridge scripts ([55db66f](https://github.com/zkDX-DeFi/ocp-contracts/commit/55db66fb5809804e55af70a3a64a8d9e628698db))


### Tests

* add new test scenario ([601fc81](https://github.com/zkDX-DeFi/ocp-contracts/commit/601fc81d7b7d31a9523075ef28be02f0a75843a9))
* check f.getPool ([8127b7d](https://github.com/zkDX-DeFi/ocp-contracts/commit/8127b7ddb357d82e41e79a7b775887ee0f56f2cd))
* check lz.func =&gt; blockNextMsg() ([4b52f5d](https://github.com/zkDX-DeFi/ocp-contracts/commit/4b52f5dd64a4d454ee36aa3c6ddd7592ce06dcbf))
* check LZ.FUNC =&gt; VARIABLES ([feeaee6](https://github.com/zkDX-DeFi/ocp-contracts/commit/feeaee65f3b3c81561efad5bd56197a446a92950))
* check OCPB.FUNC =&gt; updateTrustedRemotes() ([2061b13](https://github.com/zkDX-DeFi/ocp-contracts/commit/2061b139f9cf92811fe66e997990441b565a7a98))
* check OCPR.FUNC =&gt; omniMint() ([69ca2aa](https://github.com/zkDX-DeFi/ocp-contracts/commit/69ca2aa65ac96d6bfa9a2ad2b5929b325846c052))
* check OCPR.FUNC =&gt; quoteLayerZeroFee ([cbf77f9](https://github.com/zkDX-DeFi/ocp-contracts/commit/cbf77f9ebb7f391e6e7ec323c32c49f2b1e029d2))
* check OCPR.VARIABLES =&gt; poolFactory ([69ebdb7](https://github.com/zkDX-DeFi/ocp-contracts/commit/69ebdb790e2c941e6d801f4a6142b8c85ee47e11))
* check R.FUNC =&gt; omniMint() ([5af3602](https://github.com/zkDX-DeFi/ocp-contracts/commit/5af3602bc6ac757bd12c146b642cd3a590edbb2f))
* check R.FUNC =&gt; omniMint() ([73d8085](https://github.com/zkDX-DeFi/ocp-contracts/commit/73d8085084920e1fbcd2b39412b9fed3bd75cf1d))
* check R.FUNC =&gt; omniMint() => tm ([bd3cb13](https://github.com/zkDX-DeFi/ocp-contracts/commit/bd3cb13dc658f40900e6b263a048ac09dbe7dafe))
* check R2.FUNC =&gt; quoteLayerZeroFee() ([9b63dcb](https://github.com/zkDX-DeFi/ocp-contracts/commit/9b63dcb2037689f67bba44816d4a1f5f537cd367))
* code coverage = All files                  |      100 |    98.48 |      100 |      100 |                | ([44972c2](https://github.com/zkDX-DeFi/ocp-contracts/commit/44972c243c07b7118464e922a9c235019d01927b))
* create LZE.TEST.TS ([3d6f3df](https://github.com/zkDX-DeFi/ocp-contracts/commit/3d6f3df1ed9fcfb178e527493bd90e791dd9f9ce))
* create OCPR2.TEST.TS && CODE COVERAGE = 100% ([89ed127](https://github.com/zkDX-DeFi/ocp-contracts/commit/89ed127b05eb793d8db5146cfe609d5ad5a3ae6a))
* tuning failed test cases && code coverage = 100% ([a4de6f8](https://github.com/zkDX-DeFi/ocp-contracts/commit/a4de6f80672f07e1e3c09af43c6939efa584742b))
* tuning test cases ([ed08ef4](https://github.com/zkDX-DeFi/ocp-contracts/commit/ed08ef48f177c6ec5b59fff126f0733e9a3b7724))
* tuning test cases ([16e9521](https://github.com/zkDX-DeFi/ocp-contracts/commit/16e9521d5bc500c2a8c6fb678c6e6b3d1f2b98e1))
* tuning test scripts ([11e601f](https://github.com/zkDX-DeFi/ocp-contracts/commit/11e601f92bb7b4e93458de613d4cc2ee206b6f9a))


### CI

* deploy zk/goerli/base 1009 ([84bc9c6](https://github.com/zkDX-DeFi/ocp-contracts/commit/84bc9c6e38b6ebbde3432e4b11a36366f9c4025b))
* deployBridge.ts ([d33a9e8](https://github.com/zkDX-DeFi/ocp-contracts/commit/d33a9e8d43e17662b16cbe5f7a3cba4fc88d287e))
* refactor code & reformat code ([a7d86ed](https://github.com/zkDX-DeFi/ocp-contracts/commit/a7d86ede0eb20e1eb1b510d6b3cb9a007d8788b8))
* refactor deploy scripts ([3e8a866](https://github.com/zkDX-DeFi/ocp-contracts/commit/3e8a86665bf133906af2414932a7b3b3dbfd2481))
* refactor package.json ([d357956](https://github.com/zkDX-DeFi/ocp-contracts/commit/d35795688e459a77ec1b0eec76f8ad7fda2fa43f))
* refactor scripts ([26cff46](https://github.com/zkDX-DeFi/ocp-contracts/commit/26cff46e689b52ab004f07703347779b3d1928c0))
* reformat deploy scripts ([8e78d92](https://github.com/zkDX-DeFi/ocp-contracts/commit/8e78d92ef0789f514a24b3ddf703139708dd2d44))
* tuning deploy scripts ([08a687b](https://github.com/zkDX-DeFi/ocp-contracts/commit/08a687b00f3f238463a62b7a0d00fc201a2c5e56))

## [1.3.0](https://github.com/zkDX-DeFi/ocp-contracts/compare/v1.2.0...v1.3.0) (2023-10-08)


### Features

* update router - omni deploy and mint ([f47a05e](https://github.com/zkDX-DeFi/ocp-contracts/commit/f47a05ecb3819ef445a2ff1525234060cfff4532))


### Bug Fixes

* removed unused code ([c29c25a](https://github.com/zkDX-DeFi/ocp-contracts/commit/c29c25a4ad93fdba823c7955f7b74b6ae3812b24))
* removed unused code ([94e0dd0](https://github.com/zkDX-DeFi/ocp-contracts/commit/94e0dd007ae96f5d2173b31ded87f28654c4a5fc))


### Feature Improvements

* mint _amountD18, add deploy scripts ([59b0d1e](https://github.com/zkDX-DeFi/ocp-contracts/commit/59b0d1e85627b8023f21f35fbde8bb16d5d079d6))


### Docs

* _amountD18 in OCPR.SOL ([f909f24](https://github.com/zkDX-DeFi/ocp-contracts/commit/f909f24b395c75f2653aa0eae89f7e46b847fc7c))
* _blockingLzReceive in OCPB.SOL ([f757342](https://github.com/zkDX-DeFi/ocp-contracts/commit/f7573426fd7a85fb8623bfc19e941854a366c25f))
* _txParamBuilder in OCPB.SOL ([119d3e2](https://github.com/zkDX-DeFi/ocp-contracts/commit/119d3e2ffdefc9b4e789dd3826c49588590b2573))
* add doc for 'createOmniToken' in  OCPOTM ([3c748ed](https://github.com/zkDX-DeFi/ocp-contracts/commit/3c748edd6fd588b4f85bc1c31c56b09015b0f089))
* add doc for createOmniToken() ([8b6fed5](https://github.com/zkDX-DeFi/ocp-contracts/commit/8b6fed56840ad16f891380258cad7bd8c77e0b62))
* add docs for OCPOTM ([0a12ab3](https://github.com/zkDX-DeFi/ocp-contracts/commit/0a12ab3ecef954234e05ecce5221dbe796ff58eb))
* createPool in OCPF.SOL ([ee73ce9](https://github.com/zkDX-DeFi/ocp-contracts/commit/ee73ce9487f9894b37bd0786c2b918fcbe052f97))
* OCP.SOL ([cf08e43](https://github.com/zkDX-DeFi/ocp-contracts/commit/cf08e4302ce5c5dfa7cb83f278c02bc19e572822))
* omniMint in OCPB.SOL ([22fb512](https://github.com/zkDX-DeFi/ocp-contracts/commit/22fb5120a4e9af196f7ca165cee720b404b30610))
* omniMint in OCPOTM.SOL ([52feb78](https://github.com/zkDX-DeFi/ocp-contracts/commit/52feb787ee33f2a447cf36abca59c74cd5e0eed1))
* omniMint in OCPR.SOL ([ad26ec9](https://github.com/zkDX-DeFi/ocp-contracts/commit/ad26ec90a33cf386e67ddd6a74facf88df508c9e))
* OT.SOL ([49ce340](https://github.com/zkDX-DeFi/ocp-contracts/commit/49ce34000491d239b14e197601db999b2235abc2))
* quoteLayerZeroFee in OCPB.SOL ([78e5bb3](https://github.com/zkDX-DeFi/ocp-contracts/commit/78e5bb312632162ddd48e20a9d8f1bcd2f16899c))
* quoteLayerZeroFee in OCPR.SOL ([51fcd6b](https://github.com/zkDX-DeFi/ocp-contracts/commit/51fcd6b717e3be8d837d9b8e4185858bad38e17a))
* updateBridge in OCPR.SOL ([ebec354](https://github.com/zkDX-DeFi/ocp-contracts/commit/ebec354174cbb69e92b0a03ab841b4dfb534f3a4))
* updateGasLookup in OCPB.SOL ([e3be413](https://github.com/zkDX-DeFi/ocp-contracts/commit/e3be41325c56b41d493dec37a8ec8f40a2441d35))
* updateRouter in OCPB.SOL ([31cd628](https://github.com/zkDX-DeFi/ocp-contracts/commit/31cd6282a259e649ac3128a2869fda09f7d11c5e))


### Tests

* _omniMint in OCPR.SOL ([3422da9](https://github.com/zkDX-DeFi/ocp-contracts/commit/3422da9b7d81731d2ae9b3ca48c1c31423db7c62))
* "check OCPF.FUNC =&gt; createPool()" ([ee79e81](https://github.com/zkDX-DeFi/ocp-contracts/commit/ee79e81833c4859050788eebe418d6857f606c00))
* add code coverage ([d4746aa](https://github.com/zkDX-DeFi/ocp-contracts/commit/d4746aaa4d412fafdc685e0f42dbe5210065d9fd))
* add code coverage ([225c3aa](https://github.com/zkDX-DeFi/ocp-contracts/commit/225c3aa0bd2f3424cbfc5ac15329ad3edf8d3d11))
* add code coverage ([da1f9be](https://github.com/zkDX-DeFi/ocp-contracts/commit/da1f9befc3ee2a08dc7411ce79c9fa67465218b8))
* add code coverage && 78.95% for OCPR.SOL ([c1d6151](https://github.com/zkDX-DeFi/ocp-contracts/commit/c1d61519d7298c4272161898fb671d9c28e8f4b1))
* add router tests ([d88f140](https://github.com/zkDX-DeFi/ocp-contracts/commit/d88f140e974a70162ef9270599701b44356d36b2))
* check OCP.FUNC =&gt; constructor() ([4d7c218](https://github.com/zkDX-DeFi/ocp-contracts/commit/4d7c218bdfcbe85e5edd5f3ca34bfdccd600c590))
* check OCPB.FUNC =&gt; quoteLayerZeroFee() ([2182d0a](https://github.com/zkDX-DeFi/ocp-contracts/commit/2182d0a05aaa4c131077a3b868aac927a48ab170))
* check OCPB.FUNC =&gt; quoteLayerZeroFee() ([bc6db2d](https://github.com/zkDX-DeFi/ocp-contracts/commit/bc6db2df3b3a18aa1a3b1afb20290c0e24d3b04d))
* check OCPOTM.FUNC =&gt; createOmniToken ([65fdaec](https://github.com/zkDX-DeFi/ocp-contracts/commit/65fdaec3ac7463398f3a514456b8b054151e424b))
* check OCPOTM.FUNC =&gt; updateRouter ([d8dc542](https://github.com/zkDX-DeFi/ocp-contracts/commit/d8dc542d509c9234e42269fcb91f4be59bac3c36))
* check OCPR.FUNC =&gt; _amountD18() ([b3c4f64](https://github.com/zkDX-DeFi/ocp-contracts/commit/b3c4f6460da9c5e2456be93d23411d4455f5b3da))
* check OCPR.FUNC =&gt; omniMint() ([e490dd1](https://github.com/zkDX-DeFi/ocp-contracts/commit/e490dd1f5b9cb8fbdb0eda23ef7113d2945773c1))
* check OCPR.FUNC =&gt; omniMintRemote() && code coverage = All files                  |    94.74 |    96.88 |      100 |    95.51 | ([0a0f4af](https://github.com/zkDX-DeFi/ocp-contracts/commit/0a0f4af223efc732da0a52d64a277ef874ffa210))
* check OCPR.FUNC =&gt; quoteLayerZeroFee() ([fc1e9ad](https://github.com/zkDX-DeFi/ocp-contracts/commit/fc1e9ad8402c7a2f5fd83bc7f5553909b8d119da))
* check OT.FUNC =&gt; constructor() ([3978de3](https://github.com/zkDX-DeFi/ocp-contracts/commit/3978de3c8bde3faae2ef6531905842ef5678959a))
* check OT.FUNC =&gt; constructor() ([959df12](https://github.com/zkDX-DeFi/ocp-contracts/commit/959df128a6e49948252fae8c936feb28dfc93f5d))
* check OT.FUNC =&gt; constructor() ([c9b0089](https://github.com/zkDX-DeFi/ocp-contracts/commit/c9b0089916950c42512f15697e86570d63116a71))
* code coverage = 94.74% ([1cd28e2](https://github.com/zkDX-DeFi/ocp-contracts/commit/1cd28e2731f4b381952c79f2a38e7bb10da7e2b9))
* create OCPR.TEST.TS ([986a665](https://github.com/zkDX-DeFi/ocp-contracts/commit/986a665cd93e198f9d20fbf2fae2792d5c1b37be))
* removed OCPR.TEST.TS ([1d31f7c](https://github.com/zkDX-DeFi/ocp-contracts/commit/1d31f7c8c4e9e47951541384fd45b0e8b759be64))
* rename OCPOTM.test.ts ([3980776](https://github.com/zkDX-DeFi/ocp-contracts/commit/39807768b4715769dcf52cad6c76d582588a15a7))
* testnet omni mint pass ([ed6ffde](https://github.com/zkDX-DeFi/ocp-contracts/commit/ed6ffdefe642ba471be60dc8c45444b297146071))
* tuning failed "check OCPR.FUNC =&gt; updateBridge()" ([89c7a5a](https://github.com/zkDX-DeFi/ocp-contracts/commit/89c7a5ab63ca69cd8a21e4b1cf8d280690732d48))
* tuning failed test cases ([8e8bbc1](https://github.com/zkDX-DeFi/ocp-contracts/commit/8e8bbc1a6ef52653a01fb90785206bf8e75a207f))
* tuning failed test cases ([17e648b](https://github.com/zkDX-DeFi/ocp-contracts/commit/17e648bebe25a6c39247f2b213b197c83bb51ad1))
* tuning failed test cases ([886e3db](https://github.com/zkDX-DeFi/ocp-contracts/commit/886e3dbf2bf6ff04449615d55fdb87d5a0e664d2))


### Build System

* deploy testnet 1008 ([eda30b8](https://github.com/zkDX-DeFi/ocp-contracts/commit/eda30b8a3ce9fc8ef126ef825848d91def52ecc0))


### CI

* merge fix ([b7bb3ac](https://github.com/zkDX-DeFi/ocp-contracts/commit/b7bb3ace3809652faa5e64d29f2ade5bb480902b))
* update setup scripts ([4c5c369](https://github.com/zkDX-DeFi/ocp-contracts/commit/4c5c36928d60057c194c3b5ab2a3c8ba9ced3fa3))

## [1.2.0](https://github.com/zkDX-DeFi/ocp-contracts/compare/v1.1.0...v1.2.0) (2023-09-28)


### Features

* complete bridge mint messaging ([8dce794](https://github.com/zkDX-DeFi/ocp-contracts/commit/8dce79497d46ad0d051a9d361bba21be71c71466))


### Bug Fixes

* add code in OCPTM.requestAddSourceTokens ([e49a6fa](https://github.com/zkDX-DeFi/ocp-contracts/commit/e49a6fa077759d4dd72498d421a8c97d70f270d3))
* add mockTM.sol ([9bcdd89](https://github.com/zkDX-DeFi/ocp-contracts/commit/9bcdd895034af09e22cddee5c888b143e3408495))
* added code in OCPTM.approveSourceTokens ([16489a4](https://github.com/zkDX-DeFi/ocp-contracts/commit/16489a44c82dab1273c5a03282b7946b4bddbcf0))
* added MockUniswapV2Factory ([5e6d8cc](https://github.com/zkDX-DeFi/ocp-contracts/commit/5e6d8cc77260b99fb0a37744c6a0a84875ebba68))
* added token in OCP.sol ([46ffb12](https://github.com/zkDX-DeFi/ocp-contracts/commit/46ffb12b741cf11b2e5d21af3afb076ed3f3553e))
* implementation for OCPTM.approveSourceTokens ([b885758](https://github.com/zkDX-DeFi/ocp-contracts/commit/b885758dad4528994ad0d6fb3a6e0d2798256b4b))
* implementation in OCPTM.requestAddSourceTokens ([5a14faa](https://github.com/zkDX-DeFi/ocp-contracts/commit/5a14faaf471f974a1ae0cdcf18ddb405529b1dd6))
* mockTM.size = 16.155 kb ([4dd9bc9](https://github.com/zkDX-DeFi/ocp-contracts/commit/4dd9bc9a00d58c59cb1aca768666e864d3d60884))
* mockUniswapFactory ([9d11a5e](https://github.com/zkDX-DeFi/ocp-contracts/commit/9d11a5ec280899eed1dde9b51e980defe044d4e6))
* removed omniTokenList ([87e2909](https://github.com/zkDX-DeFi/ocp-contracts/commit/87e2909d263c9c0b23cd03723d0d230d6b66b66d))
* removed unused code ([677591c](https://github.com/zkDX-DeFi/ocp-contracts/commit/677591c315bb8843621b4fd5ea4b115e7d6e2dda))
* removed unused code ([7e67201](https://github.com/zkDX-DeFi/ocp-contracts/commit/7e67201bfbb625872f5f2c032dedab392ebeced4))
* removed unused code ([1d12ecb](https://github.com/zkDX-DeFi/ocp-contracts/commit/1d12ecb90e91b1c7cbbdcc190d80199e2db039ae))
* removed unused code && code coverage = 100% ([627d1f4](https://github.com/zkDX-DeFi/ocp-contracts/commit/627d1f432cba50d94992f835304813d313dd83a3))
* test contract size ([6d08cc2](https://github.com/zkDX-DeFi/ocp-contracts/commit/6d08cc2131a3ca50050b21a295ecb0fe7a0d10b1))
* tuning OCPTM.onlyTL ([439bd7a](https://github.com/zkDX-DeFi/ocp-contracts/commit/439bd7a9c7147c8b43173abad8babf8305dd8f5f))


### Code Refactoring

* update OmniToken and createToken ([cb66d58](https://github.com/zkDX-DeFi/ocp-contracts/commit/cb66d58995cd8d91c061e084b048cac4c3469799))


### Tests

* check OCPF.FUNC =&gt; createPool() v2 ([fb6a05a](https://github.com/zkDX-DeFi/ocp-contracts/commit/fb6a05a5204605692ed02c44c64ee8f037522b66))
* check OCPTM.FUNC =&gt; requestAddSourceTokens() ([d79c4a2](https://github.com/zkDX-DeFi/ocp-contracts/commit/d79c4a2a8c9f7e9df1c8c24303b1575f2f5d312a))
* check OCPTM.VARIABLES =&gt; router ([4df3257](https://github.com/zkDX-DeFi/ocp-contracts/commit/4df3257fc9c92788c08f593843fee9f8cf261456))
* check OP.FUNC =&gt; redeem && code coverage = 100% ([91df77c](https://github.com/zkDX-DeFi/ocp-contracts/commit/91df77c162919512d2d2c452dbfea3f32402117c))
* code coverage = 100% ([c3005cc](https://github.com/zkDX-DeFi/ocp-contracts/commit/c3005cc1a09b56e5df1cd5cd0a9619369b51e455))
* code coverage = 93.48% ([4fbace8](https://github.com/zkDX-DeFi/ocp-contracts/commit/4fbace8da47e12ee5db1b18a3f7ae689c4fdd517))
* mockTM.size = 15.983kb ([149d07d](https://github.com/zkDX-DeFi/ocp-contracts/commit/149d07d6b1e8aae3ad4335ccca569818d68ae9b1))
* modify mockTM.sol ([7c92b24](https://github.com/zkDX-DeFi/ocp-contracts/commit/7c92b24c748a871c402b9a501e1710f242052d41))
* OCPB = 100% ([0fc201c](https://github.com/zkDX-DeFi/ocp-contracts/commit/0fc201c3557ef95e6247cdece1a731953b513ed6))
* OCPTM code coverage = 100% ([0351348](https://github.com/zkDX-DeFi/ocp-contracts/commit/0351348f1e5363d9a1406cba91da2dcf9c2c8bc3))
* passed new code in OCPTM && coverage = 100% ([60696c8](https://github.com/zkDX-DeFi/ocp-contracts/commit/60696c8a5ecd152dc0534f1c479ba1c482c66d4d))
* removed unused test scripts ([b497719](https://github.com/zkDX-DeFi/ocp-contracts/commit/b4977199f06112bc1766b7cc59af9dfbea73aeb5))
* tuning failed test cases ([3d10061](https://github.com/zkDX-DeFi/ocp-contracts/commit/3d10061720da36cb02cf168cc3f52ebe9920259b))
* tuning failed test cases ([4fb59a0](https://github.com/zkDX-DeFi/ocp-contracts/commit/4fb59a0582f36671cb05f01059709f9626ec958e))
* tuning failed test cases && code coverage = 100% ([a07cd3e](https://github.com/zkDX-DeFi/ocp-contracts/commit/a07cd3e89e63e325804728fa6ee606188eab7541))
* tuning failed test cases && code coverage = 100% ([f71a3da](https://github.com/zkDX-DeFi/ocp-contracts/commit/f71a3da9c2b02217e0d1968a57bc442d83541ac2))
* tuning failed test cases && coverage = 100% ([658f555](https://github.com/zkDX-DeFi/ocp-contracts/commit/658f555cab15f7d6e516677439f077700e28dd3a))
* tuning failed test cases && coverage = 98.65% ([a73dcc2](https://github.com/zkDX-DeFi/ocp-contracts/commit/a73dcc2605b1a40f6fb4b7101d38d49fb91e7736))
* tuning OT.TEST.TS && code coverage = 100% ([2797cc9](https://github.com/zkDX-DeFi/ocp-contracts/commit/2797cc90ba22f374808c3bb9eda22c4d49adaf95))
* updateMockTM.sol ([f1ada0e](https://github.com/zkDX-DeFi/ocp-contracts/commit/f1ada0e24fdc1e57c51148e11bc89e6b29622f59))


### Build System

* tuning deploy scripts ([679aa03](https://github.com/zkDX-DeFi/ocp-contracts/commit/679aa039f94f6d2f1296e0c5132c827dddbb7ef5))

## [1.1.0](https://github.com/zkDX-DeFi/ocp-contracts/compare/v1.0.0...v1.1.0) (2023-09-27)


### Bug Fixes

* code coverage = 100% ([9e901c9](https://github.com/zkDX-DeFi/ocp-contracts/commit/9e901c94c1dcbf99583aedeefa3a050754430eb3))
* modify OCPool.sol ([105b674](https://github.com/zkDX-DeFi/ocp-contracts/commit/105b674cc995b127e408d3aaf8ff8503339bfc46))
* removed unused code ([4b8b6ac](https://github.com/zkDX-DeFi/ocp-contracts/commit/4b8b6ac30680b4cc6b041dc827b53122811bf641))


### Code Refactoring

* Bridge.sol ([7eeeaa6](https://github.com/zkDX-DeFi/ocp-contracts/commit/7eeeaa61a6ed08adf30994bc66c71ea1ae8fa461))
* IOCPB.SOL ([626215b](https://github.com/zkDX-DeFi/ocp-contracts/commit/626215b68c03ef0186baac2e28760b7c485cc9fb))
* IOCPOmniTokenFactory ([47c427e](https://github.com/zkDX-DeFi/ocp-contracts/commit/47c427e061201e9aba64eb5f22dbef3fd854075d))
* IOCPool ([af88a0d](https://github.com/zkDX-DeFi/ocp-contracts/commit/af88a0dde6d8c45e12ed49d2dde27b635c4f7d54))
* IOT ([021af30](https://github.com/zkDX-DeFi/ocp-contracts/commit/021af30be5306d3ab07c027ebdda68cf0365515a))
* IWETH ([dc87583](https://github.com/zkDX-DeFi/ocp-contracts/commit/dc875831ab5ae863855171662c475e1bcaf39402))
* move createToken to TokenManager.sol ([67652fd](https://github.com/zkDX-DeFi/ocp-contracts/commit/67652fde922f258cbae29267c2dfb22c4eef1f9f))
* OCPF.sol ([3654693](https://github.com/zkDX-DeFi/ocp-contracts/commit/3654693c67ddec80188e241b875c3eb284a1b888))
* OCPOmniTokenFactory.sol ([f275dbd](https://github.com/zkDX-DeFi/ocp-contracts/commit/f275dbd1267bc1a1563dcca7f1dad951eb3bb038))
* OCPool.sol ([bbe54bd](https://github.com/zkDX-DeFi/ocp-contracts/commit/bbe54bdb3ecfe9312f576417c965d1c3c55e1f69))
* OCPOTM ([d1d2d1e](https://github.com/zkDX-DeFi/ocp-contracts/commit/d1d2d1e61246b886f83076a32f0852a2ff75e8bc))
* OCPOTM ([097ea61](https://github.com/zkDX-DeFi/ocp-contracts/commit/097ea61c8aa91c44faab9289a17f5fe4b68b1bd4))
* OCPTokenFactory =&gt; OCPOmniTokenFactory ([2d90112](https://github.com/zkDX-DeFi/ocp-contracts/commit/2d9011205e106676a848347f127055ee378abab1))
* OmniToken.sol ([6d4f093](https://github.com/zkDX-DeFi/ocp-contracts/commit/6d4f093d3812837e05ad2a742e08dfbb52691a71))
* remove unused code ([25bc9e4](https://github.com/zkDX-DeFi/ocp-contracts/commit/25bc9e4c9aa8506a924e6b5b3e71d3650a46b534))
* removed unused code ([cf880b2](https://github.com/zkDX-DeFi/ocp-contracts/commit/cf880b2cd2569d6dfa56be0732394cbc023f0a12))
* TokenManager =&gt; OmniTokenManager.sol ([ae9aa45](https://github.com/zkDX-DeFi/ocp-contracts/commit/ae9aa4548efe907130ac05f650f2276b3f25533c))
* update oft, token manager variables ([93662e2](https://github.com/zkDX-DeFi/ocp-contracts/commit/93662e26ea55d1950ddbdb4ae531907de4ffec25))


### Tests

* check OCPTM.FUNC =&gt; approveSourceTokens ([63a97b9](https://github.com/zkDX-DeFi/ocp-contracts/commit/63a97b996eaee73a878cda1147001ab694602ce6))
* check OCPTM.FUNC =&gt; requestAddSourceTokens() && code coverage = 100% ([30c6aff](https://github.com/zkDX-DeFi/ocp-contracts/commit/30c6affa57e0bef88086567451a98efc99375ebb))
* refactoring ocpOmniTokenFactory ([b2e1a1c](https://github.com/zkDX-DeFi/ocp-contracts/commit/b2e1a1cc327ba14460e70500cfb2ee92552b7015))
* tuning failed test cases ([b19b670](https://github.com/zkDX-DeFi/ocp-contracts/commit/b19b6705d317a69c616cccb07b3cb66f57c96428))

## 1.0.0 (2023-09-26)


### Bug Fixes

* add fake code ([5d0a4e2](https://github.com/zkDX-DeFi/ocp-contracts/commit/5d0a4e2212737a1a9ce4a14731e583c099fb0f28))
* added "updateBridge" to pass code coverage ([c90954c](https://github.com/zkDX-DeFi/ocp-contracts/commit/c90954c3dc472f7ad9f0eba08191571ec6b3f608))
* refactoring IOCPool ([f3cca2a](https://github.com/zkDX-DeFi/ocp-contracts/commit/f3cca2a72de0e32c1f7272e260424c2c79a0187e))
* refactoring IOCPPool=&gt; IOCPool ([1473c5c](https://github.com/zkDX-DeFi/ocp-contracts/commit/1473c5cbc772af50e67d8934e1ac5864839e8e6b))
* refactoring OCPPool =&gt; OCPool ([c544213](https://github.com/zkDX-DeFi/ocp-contracts/commit/c5442136180e49942c1cd33e6ef527de40249c74))
* refactoring OCPPool.sol =&gt; OCPool.sol ([a322a3f](https://github.com/zkDX-DeFi/ocp-contracts/commit/a322a3f6cd6e7c8445d3c95166cf9a002be8492e))
* rename OCPPoolFactory =&gt; OCPoolFactory ([3edd27e](https://github.com/zkDX-DeFi/ocp-contracts/commit/3edd27e5806323a70345a064948a267b47450a10))


### Tests

* "check OCPTM.FUNC =&gt; addSourceToken" ([0aa4f49](https://github.com/zkDX-DeFi/ocp-contracts/commit/0aa4f495506be0def1d1b50845dd06a62988f998))
* check OCPB.FUNC =&gt; omniMint ([de7cec9](https://github.com/zkDX-DeFi/ocp-contracts/commit/de7cec9b1c21d4ccb54b345afbe40ece35588865))
* check OCPB.FUNC =&gt; omniRedeem ([54cfd8a](https://github.com/zkDX-DeFi/ocp-contracts/commit/54cfd8aa76996c16f8fa846c9b5a09d385f12d4c))
* check OCPB.FUNC =&gt; quoteLayerZeroFee ([19cf9f9](https://github.com/zkDX-DeFi/ocp-contracts/commit/19cf9f96ec9e9eb0169e966c5a64996a22042d9c))
* check OCPR.FUNC =&gt; OMNIMINT ([f132262](https://github.com/zkDX-DeFi/ocp-contracts/commit/f132262d33bd25426b06bc7d3a99590ac51c3c75))
* check OCPR.FUNC =&gt; omniMintETH ([a131b33](https://github.com/zkDX-DeFi/ocp-contracts/commit/a131b33bd9f5dda62495a1d2b07e4ba532df17f4))
* check OCPR.FUNC =&gt; omniMintRemote() ([ca6c530](https://github.com/zkDX-DeFi/ocp-contracts/commit/ca6c530c9cff3617816c9efd0042bd2ec0e9ffb1))
* check OCPR.FUNC =&gt; omniRedeem() ([cc0b481](https://github.com/zkDX-DeFi/ocp-contracts/commit/cc0b481fc4c20735f279d8a0ddd3c8b10a04fffc))
* check OCPR.FUNC =&gt; omniRedeemRemote() ([7b47be2](https://github.com/zkDX-DeFi/ocp-contracts/commit/7b47be2145df9780841d064f45f43385b61f68b6))
* check OCPR.FUNC =&gt; quoteLayerZeroFee() ([fd01211](https://github.com/zkDX-DeFi/ocp-contracts/commit/fd01211fcb925ce061588edc2ec8fa34ef30ddf0))
* check OCPR.FUNC =&gt; retryCachedMint() && code coverage = 100 for OCPR.SOL ([0a03000](https://github.com/zkDX-DeFi/ocp-contracts/commit/0a0300004063e05d2d099490652dc85251fa92a5))
* check OCPR.FUNC =&gt; updateBridge() ([1afa53e](https://github.com/zkDX-DeFi/ocp-contracts/commit/1afa53e192e080a521fbd122e4064c6c0134948d))
* check OCPTF.FUNC =&gt; createToken ([d324b65](https://github.com/zkDX-DeFi/ocp-contracts/commit/d324b65108c177fbd7759cdf670645b9e312b08d))
* check OCPTF.FUNC =&gt; updateTokenManager ([54450d3](https://github.com/zkDX-DeFi/ocp-contracts/commit/54450d31bda7ee59c3b83174195afa37f22f1a71))
* check OCPTM.FUNC =&gt; createToken ([470dfe3](https://github.com/zkDX-DeFi/ocp-contracts/commit/470dfe39e781737aa94c9841401629bc003000c0))
* check OCPTM.FUNC =&gt; getAssetURI ([cc6c274](https://github.com/zkDX-DeFi/ocp-contracts/commit/cc6c27469a19fbcdc3a601af6a1cb9a8d1c3c451))
* check OCPTM.FUNC =&gt; omniBurn ([1aa8398](https://github.com/zkDX-DeFi/ocp-contracts/commit/1aa839802b1d13887d0e9ca62a1c3a11fcc360cc))
* check OCPTM.FUNC =&gt; updateRouter + check OCPTM.FUNC => omniMint ([4082e95](https://github.com/zkDX-DeFi/ocp-contracts/commit/4082e958622cc1b1116af9904673cce8a6849f1e))
* check OT.FUNC =&gt; assetURIs ([3f365c9](https://github.com/zkDX-DeFi/ocp-contracts/commit/3f365c9a933ece4940ad375ad0f4b947f1a24b00))
* check OT.FUNC =&gt; BURN ([01098c0](https://github.com/zkDX-DeFi/ocp-contracts/commit/01098c0b7803791b197c35d1d0f1505d913166c1))
* create OCPB.TEST.TS ([650b2b8](https://github.com/zkDX-DeFi/ocp-contracts/commit/650b2b858bdabde1afc5c24c5a2a9e2e8c7c92ae))
* create OCPTF ([552a9d7](https://github.com/zkDX-DeFi/ocp-contracts/commit/552a9d705e0eae1a41a93009e9fda65d1a8b2c66))
* create OT.TEST.TS ([923535c](https://github.com/zkDX-DeFi/ocp-contracts/commit/923535cd4ab1478f4d830d3e82f4234702dfa197))
* min test ([b2652dc](https://github.com/zkDX-DeFi/ocp-contracts/commit/b2652dc1fb03473084dae099889c6ebc282eec1f))
* tuning check OCPR.FUNC =&gt; omniMintETH ([83cc3cf](https://github.com/zkDX-DeFi/ocp-contracts/commit/83cc3cf96f82b7bf012e55afe6a16c5f2a4cbf6c))
* tuning OCPF.TEST.TS ([3f37b9d](https://github.com/zkDX-DeFi/ocp-contracts/commit/3f37b9d01e392c4e750a5dc3d5af2886fa115ddf))


### Build System

* tuning deploy scripts ([dcdd811](https://github.com/zkDX-DeFi/ocp-contracts/commit/dcdd811c03fb477b7e959b33ab633a5a53b138ce))


### CI

* code coverage = 100% for OCPB ([0830aca](https://github.com/zkDX-DeFi/ocp-contracts/commit/0830aca453a8a09fc52449e32e8991289b98525d))
