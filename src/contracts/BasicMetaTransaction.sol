pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./lib/SafeMath.sol";

contract BasicMetaTransaction {

    using SafeMath for uint256;

    event MetaTransactionExecuted(address userAddress, address payable relayerAddress, bytes functionSignature);
    mapping(address => uint256) nonces;

    function getChainID() public pure returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    /**
     * Main function to be called when user wants to execute meta transaction.
     * The actual function to be called should be passed as param with name functionSignature
     * Here the basic signature recovery is being used. Signature is expected to be generated using
     * personal_sign method.
     * @param userAddress Address of user trying to do meta transaction
     * @param functionSignature Signature of the actual function to be called via meta transaction
     * @param message Message to be signed by the user
     * @param length Length of complete message that was signed
     * @param sigR R part of the signature
     * @param sigS S part of the signature
     * @param sigV V part of the signature
     */
    function executeMetaTransaction(address userAddress,
        bytes memory functionSignature, string memory message, string memory length,
        bytes32 sigR, bytes32 sigS, uint8 sigV) public payable returns(bytes memory) {

        require(verify(userAddress, message, length, nonces[userAddress], getChainID(), sigR, sigS, sigV), "Signer and signature do not match");
        // Append userAddress and relayer address at the end to extract it from calling context
        (bool success, bytes memory returnData) = address(this).call(abi.encodePacked(functionSignature, userAddress));

        require(success, "Function call not successfull");
        nonces[userAddress] = nonces[userAddress].add(1);
        emit MetaTransactionExecuted(userAddress, msg.sender, functionSignature);
        return returnData;
    }

    function getNonce(address user) public view returns(uint256 nonce) {
        nonce = nonces[user];
    }



    function verify(address owner, string memory message, string memory length, uint256 nonce, uint256 chainID,
        bytes32 sigR, bytes32 sigS, uint8 sigV) public pure returns (bool) {

        string memory nonceStr = uint2str(nonce);
        string memory chainIDStr = uint2str(chainID);
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", length, message, nonceStr, chainIDStr));
		return (owner == ecrecover(hash, sigV, sigR, sigS));
    }

    /**
     * Internal utility function used to convert an int to string.
     * @param _i integer to be converted into a string
     */
    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        uint256 temp = _i;
        while (temp != 0) {
            bstr[k--] = byte(uint8(48 + temp % 10));
            temp /= 10;
        }
        return string(bstr);
    }

    function msgSender() internal view returns(address sender) {
        if(msg.sender == address(this)) {
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
                sender := and(mload(add(array, index)), 0xffffffffffffffffffffffffffffffffffffffff)
            }
        } else {
            sender = msg.sender;
        }
        return sender;
    }

    // To recieve ether in contract
    receive() external payable { }
    fallback() external payable { }
}