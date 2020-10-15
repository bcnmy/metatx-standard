pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

contract ERC20ForwarderRequest{

    struct ERC20ForwardRequest {
        address from;
        address to;
        address token;
        address feeReceiver;
        address feeMultiplierManager;
        uint256 msgValue;
        uint256 gas;
        uint256 price;
        uint256 nonce;
        bytes data;
    }

}