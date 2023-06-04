// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

abstract contract EIP712Base {
    struct EIP712Domain {
        string name;
        string version;
        address verifyingContract;
        uint256 chainId;
    }

    bytes32 internal constant _EIP712_DOMAIN_TYPEHASH =
        keccak256(
            bytes(
                "EIP712Domain(string name,string version,address verifyingContract,uint256 chainId)"
            )
        );

    bytes32 internal _domainSeparator;

    constructor(string memory name, string memory version) {
        _domainSeparator = keccak256(
            abi.encode(
                _EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                address(this),
                getChainID()
            )
        );
    }

    /**
     * Accept message hash and returns hash message in EIP712 compatible form
     * So that it can be used to recover signer from signature signed using EIP712 formatted data
     * https://eips.ethereum.org/EIPS/eip-712
     * "\\x19" makes the encoding deterministic
     * "\\x01" is the version byte to make it compatible to EIP-191
     */
    function toTypedMessageHash(
        bytes32 messageHash
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19\x01", getDomainSeparator(), messageHash)
            );
    }

    function getChainID() internal pure returns (uint256 id) {
        id = 31337; // local network
    }

    function getDomainSeparator() private view returns (bytes32) {
        return _domainSeparator;
    }
}
