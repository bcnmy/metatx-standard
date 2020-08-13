pragma solidity ^0.5.13;
pragma experimental ABIEncoderV2;

import "./lib/EIP712Base.sol";
import "./lib/SafeMath.sol";

contract EIP712MetaTransaction is EIP712Base {
    using SafeMath for uint256;
    bytes32 private constant META_TRANSACTION_TYPEHASH = keccak256(bytes("MetaTransaction(uint256 nonce,address from,bytes functionSignature)"));

    event MetaTransactionExecuted(address userAddress, address payable relayerAddress, bytes functionSignature);
    mapping(address => uint256) nonces;

    /*
     * Meta transaction structure.
     * No point of including value field here as if user is doing value transfer then he has the funds to pay for gas
     * He should call the desired function directly in that case.
     */
    struct MetaTransaction {
		uint256 nonce;
		address from;
        bytes functionSignature;
	}

    constructor(string memory name, string memory version) public EIP712Base(name, version) {}

    function executeMetaTransaction(address userAddress,
        bytes memory functionSignature, bytes32 sigR, bytes32 sigS, uint8 sigV) public payable returns(bytes memory) {

        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[userAddress],
            from: userAddress,
            functionSignature: functionSignature
        });
        require(verify(userAddress, metaTx, sigR, sigS, sigV), "Signer and signature do not match");
	nonces[userAddress] = nonces[userAddress].add(1);
        // Append userAddress at the end to extract it from calling context
        (bool success, bytes memory returnData) = address(this).call(abi.encodePacked(functionSignature, userAddress, msg.sender));

        require(success, "Function call not successfull");
        emit MetaTransactionExecuted(userAddress, msg.sender, functionSignature);
        return returnData;
    }

    function hashMetaTransaction(MetaTransaction memory metaTx) internal view returns (bytes32) {
		return keccak256(abi.encode(
            META_TRANSACTION_TYPEHASH,
            metaTx.nonce,
            metaTx.from,
            keccak256(metaTx.functionSignature)
        ));
	}

    function getNonce(address user) public view returns(uint256 nonce) {
        nonce = nonces[user];
    }

    function verify(address user, MetaTransaction memory metaTx, bytes32 sigR, bytes32 sigS, uint8 sigV) internal view returns (bool) {
        address signer = ecrecover(toTypedMessageHash(hashMetaTransaction(metaTx)), sigV, sigR, sigS);
        require(signer != address(0), "Invalid signature");
	return signer == user;
    }

    function msgSender() internal view returns(address sender) {
        if(msg.sender == address(this)) {
            bytes20 userAddress;
            bytes memory data = msg.data;
            uint256 dataLength = msg.data.length;
            assembly {
                calldatacopy(0x0, sub(dataLength, 40), sub(dataLength, 20))
                userAddress := mload(0x0)
            }
            sender = address(uint160(userAddress));
        } else {
            sender = msg.sender;
        }
    }

    function msgRelayer() internal view returns(address relayer) {
        if(msg.sender == address(this)) {
            bytes20 relayerAddress;
            bytes memory data = msg.data;
            uint256 dataLength = msg.data.length;
            assembly {
                calldatacopy(0x0, sub(dataLength, 20), dataLength)
                relayerAddress := mload(0x0)
            }
            relayer = address(uint160(relayerAddress));
        }
    }
}
