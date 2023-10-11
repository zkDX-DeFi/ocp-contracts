// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interfaces/IOCPOmniTokenManager.sol";
import "./interfaces/IOmniToken.sol";
import "./libraries/Structs.sol";
import "./entity/OmniToken.sol";
import "hardhat/console.sol";
/**
    * @title OCPOmniTokenManager
    * @author Muller
    * @dev This contract is used to manage the OmniTokens
    * @dev It is used by the router to create OmniTokens and mint/burn tokens

    * @notice This contract is deployed on the source chain
    * @notice It is used by the router to create OmniTokens and mint/burn tokens
    * @notice It is also used by the timelock to add source tokens and update the router

    * createOmniToken: create a new OmniToken

    * omniMint: mint OmniTokens

    * omniBurn: burn OmniTokens

    * @notice the settings can only be updated by the timelock

    * @notice the timelock can call the following functions:

    * requestAddSourceTokens: add a source token

    * approveSourceTokens: approve a source token

    * updateRouter: update the router

    * updateTimeLock: update the timelock
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
        token = omniTokens[_mintParams.srcToken][_srcChainId];
        if (token != address(0x0)) return token;

        OmniToken newToken = new OmniToken{salt: keccak256(abi.encodePacked(_mintParams.srcToken))}(
            _mintParams.name,
            _mintParams.symbol,
            _mintParams.amount,
            _mintParams.to,
            _lzEndpoint
        );
        token = address(newToken);

        console.log("# OCPOTM.address: ", address(this));
        console.log("# OCPOTM.createOmniToken => _mintParams.srcToken: ", _mintParams.srcToken);
        console.log("# OCPOTM.createOmniToken => _srcChainId: ", _srcChainId);
        console.log("# OCPOTM.createOmniToken => token: ", token);
        console.log("# OCPOTM.createOmniToken => _mintParams.amount", _mintParams.amount);
        console.log("# OCPOTM.createOmniToken => _mintParams.to", _mintParams.to);

        omniTokens[_mintParams.srcToken][_srcChainId] = token;
        sourceTokens[token][_srcChainId] = _mintParams.srcToken;
        emit TokenCreated(_mintParams.srcToken, _srcChainId, token);
    }

    /**
        * @dev Mint OmniTokens

        * Requirements:

            * `srcToken` cannot be the zero address

            * `_srcChainId` cannot be the zero

            * `amount` cannot be the zero

            * `to` cannot be the zero address

            * only the router can call this function

        * @param _mintParams The mint parameters
        * @param _srcChainId The source chain id

        * @return token The address of the OmniToken
    */
    function omniMint(
        Structs.MintObj memory _mintParams,
        uint16 _srcChainId
    ) external onlyRouter override returns (address token) {
        token = omniTokens[_mintParams.srcToken][_srcChainId];
        console.log("# OCPOTM.address: ", address(this));
        console.log("# OCPOTM.omniMint => token: ", address(token));

        require(token != address(0x0), "OCPTokenManager: omni token is not deployed yet");
        IOmniToken(token).mint(_mintParams.to, _mintParams.amount);
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

    /**
        * @dev Add a source token

        * Requirements:

            * `_srcToken` cannot be the zero address

            * `_srcChainId` cannot be the zero address

            * `_omniToken` cannot be the zero address

            * only the timelock can call this function

        * @param _srcTokens The address of the source token
        * @param _srcChainIds The source chain id
        * @param _omniToken The address of the OmniToken
    */
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

    /**
        * @dev Approve a source token

        * Requirements:

            * `_omniTokens` cannot be the zero address

            * `_srcChainId` cannot be the zero address

            * `_srcTokens` cannot be the zero address

            * only the timelock can call this function

        * @param _omniTokens The address of the OmniToken
        * @param _srcChainId The source chain id
        * @param _srcTokens The address of the source token
    */
    function approveSourceTokens(address[] calldata _omniTokens, uint16 _srcChainId, address[] calldata _srcTokens) external onlyTimeLock {
        // TODO: alternative to addSourceToken -- 2
        require(_omniTokens.length == _srcTokens.length, "OCPTokenManager: invalid input");
        for (uint256 i = 0; i < _omniTokens.length; i++) {
            sourceTokens[_omniTokens[i]][_srcChainId] = _srcTokens[i];
        }
    }

    /**
        * @dev Update the router

        * Requirements:

            * `_router` cannot be the zero address

            * only the timelock can call this function

        * @param _router The address of the router
    */
    function updateRouter(address _router) external onlyTimeLock {
        router = _router;
    }

    /**
        * @dev Update the timelock

        * Requirements:

            * `_timeLock` cannot be the zero address

            * only the timelock can call this function

        * @param _timeLock The address of the timelock
    */
    function updateTimeLock(address _timeLock) external onlyTimeLock {
        timeLock = _timeLock;
    }
}
