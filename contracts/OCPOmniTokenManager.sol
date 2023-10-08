// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./interfaces/IOCPOmniTokenManager.sol";
import "./libraries/Structs.sol";
import "./entity/OmniToken.sol";

/**
    @title OCPOmniTokenManager
    @author Muller
    @dev This contract is used to manage the OmniTokens
    @dev It is used by the router to create OmniTokens and mint/burn tokens


*/

contract OCPOmniTokenManager is IOCPOmniTokenManager {
    address public router;
    address public timeLock;
    constructor () {
        timeLock = msg.sender;
    }
    mapping(address => mapping(uint16 => address)) public omniTokens; // srcToken -> srcChainId -> omniToken
    mapping(address => mapping(uint16 => address)) public sourceTokens; // omniToken -> srcChainId -> srcToken
    event TokenCreated(address indexed srcToken, uint16 indexed srcChainId, address indexed token);
    modifier onlyRouter() {
        require(msg.sender == router, "OCPTokenManager: caller is not the router");
        _;
    }

    modifier onlyTimeLock() {
        require(msg.sender == timeLock, "OCPTokenManager: caller is not the timelock");
        _;
    }

    /**
        * @dev Create a new OmniToken

        * Requirements:

            * `_mintParams.srcToken` cannot be the zero address

            * `_mintParams.srcChainId` cannot be the zero address

            * `_mintParams.name` cannot be the zero address

            * `_mintParams.symbol` cannot be the zero address

            * `_mintParams.amount` cannot be the zero address

            * `_mintParams.to` cannot be the zero address

            * `_lzEndpoint` cannot be the zero address

            * `_srcChainId` cannot be the zero address


        * @param _mintParams The mint parameters
        * @param _lzEndpoint The endpoint of the Lazynode
        * @param _srcChainId The source chain id
        * @return token The address of the new OmniToken
    */
    function createOmniToken(
        Structs.MintObj memory _mintParams,
        address _lzEndpoint,
        uint16 _srcChainId
    ) external returns (address token) {  // TODO: onlyRouter
        token  = omniTokens[_mintParams.srcToken][_srcChainId];
        if (token != address(0x0)) return token;

        OmniToken newToken = new OmniToken{salt: keccak256(abi.encodePacked(_mintParams.srcToken))}(
            _mintParams.name,
            _mintParams.symbol,
            _mintParams.amount,
            _mintParams.to,
            _lzEndpoint
        );
        token = address(newToken);

        omniTokens[_mintParams.srcToken][_srcChainId] = token;
        sourceTokens[token][_srcChainId] = _mintParams.srcToken;
        emit TokenCreated(_mintParams.srcToken, _srcChainId, token);
    }

    /**
        * @dev Mint OmniTokens

        * Requirements:

            * `_srcToken` cannot be the zero address

            * `_dstChainId` cannot be the zero address

            * `_amount` cannot be the zero address

            * `_to` cannot be the zero address

            * only the router can call this function

        * @param _srcToken The address of the source token
        * @param _dstChainId The destination chain id
        * @param _amount The amount to mint
        * @param _to The address to mint to
        * @return token The address of the new OmniToken
    */
    function omniMint(address _srcToken, uint16 _dstChainId, uint256 _amount, address _to) external onlyRouter override returns (address token) {
        //todo: v0.2: TYPES=2
        return address(0x0);
    }

    /**
        * @dev Burn OmniTokens

        * Requirements:

            * `_omniToken` cannot be the zero address

            * `_amount` cannot be the zero address

            * `_from` cannot be the zero address

            * only the router can call this function

        * @param _omniToken The address of the OmniToken
        * @param _amount The amount to burn
        * @param _from The address to burn from
    */
    function omniBurn(address _omniToken, uint256 _amount, address _from) external onlyRouter override {
        //todo: v0.3: TYPES=3
    }

    //DAO
    function requestAddSourceTokens(
        address[] calldata _srcTokens,
        uint16[] calldata _srcChainIds,
        address _omniToken
    ) external onlyTimeLock {
        // TODO: alternative to addSourceToken -- 1
        require(_srcTokens.length == _srcChainIds.length, "OCPTokenManager: invalid input");
        for (uint256 i = 0; i < _srcTokens.length; i++) {
            sourceTokens[_srcTokens[i]][_srcChainIds[i]] = _omniToken;
        }
    }
    function approveSourceTokens(address[] calldata _omniTokens, uint16 _srcChainId, address[] calldata _srcTokens) external onlyTimeLock {
        // TODO: alternative to addSourceToken -- 2
        require(_omniTokens.length == _srcTokens.length, "OCPTokenManager: invalid input");
        for (uint256 i = 0; i < _omniTokens.length; i++) {
            sourceTokens[_omniTokens[i]][_srcChainId] = _srcTokens[i];
        }
    }
    function updateRouter(address _router) external onlyTimeLock {
        router = _router;
    }
    function updateTimeLock(address _timeLock) external onlyTimeLock {
        timeLock = _timeLock;
    }
}
