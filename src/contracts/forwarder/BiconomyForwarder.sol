pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "./ERC20ForwardRequest.sol";

contract BiconomyForwarder is ERC20ForwarderRequest{
    using ECDSA for bytes32;

    string public constant EIP712_DOMAIN_TYPE = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";

    bytes32 public constant REQUEST_TYPEHASH = keccak256(bytes("ERC20ForwardRequest(address from,address to,address token,address feeReceiver,address feeMultiplierManager,uint256 msgValue,uint256 gas,uint256 price,uint256 nonce,bytes32 dataHash)"));

    mapping(bytes32 => bool) public domains;

    mapping(address => uint256) private nonces;

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function getNonce(address from)
    public view
    returns (uint256) {
        return nonces[from];
    }

    function verifyEIP712(
        ERC20ForwardRequest memory req,
        bytes32 domainSeparator,
        bytes memory sig)
    public view {

        _verifyNonce(req);
        _verifySig(req, domainSeparator, sig);
    }

    function executeEIP712(
        ERC20ForwardRequest memory req,
        bytes32 domainSeparator,
        bytes memory sig
    )
    public payable
    returns (bool success, bytes memory ret) {
        _verifyNonce(req);
        _verifySig(req, domainSeparator, sig);
        _updateNonce(req);

        // solhint-disable-next-line avoid-low-level-calls
        (success,ret) = req.to.call{gas : req.gas, value : req.msgValue}(abi.encodePacked(req.data, req.from));
        if ( address(this).balance>0 ) {
            //can't fail: req.from signed (off-chain) the request, so it must be an EOA...
            payable(req.from).transfer(address(this).balance);
        }
        return (success,ret);
    }

    function verifyPersonalSign(
        ERC20ForwardRequest memory req,
        bytes memory sig)
    public view {
        _verifyNonce(req);
        _verifySigPersonalSign(req, sig);
    }

    function executePersonalSign(ERC20ForwardRequest memory req, bytes memory sig)
    public payable
    returns(bool success, bytes memory ret){
        _verifyNonce(req);
        _verifySigPersonalSign(req, sig);
        _updateNonce(req);

        // solhint-disable-next-line avoid-low-level-calls
        (success,ret) = req.to.call{gas : req.gas, value : req.msgValue}(abi.encodePacked(req.data, req.from));
        if ( address(this).balance>0 ) {
            //can't fail: req.from signed (off-chain) the request, so it must be an EOA...
            payable(req.from).transfer(address(this).balance);
        }
        return (success,ret);
    }

    function _verifyNonce(ERC20ForwardRequest memory req) internal view {
        require(nonces[req.from] == req.nonce, "nonce mismatch");
    }

    function _updateNonce(ERC20ForwardRequest memory req) internal {
        nonces[req.from]++;
    }

    function registerDomainSeparator(string memory name, string memory version) public {
        uint256 chainId;
        /* solhint-disable-next-line no-inline-assembly */
        assembly { chainId := chainid() }

        bytes memory domainValue = abi.encode(
            keccak256(bytes(EIP712_DOMAIN_TYPE)),
            keccak256(bytes(name)),
            keccak256(bytes(version)),
            chainId,
            address(this));

        bytes32 domainHash = keccak256(domainValue);

        domains[domainHash] = true;
        emit DomainRegistered(domainHash, domainValue);
    }

    event DomainRegistered(bytes32 indexed domainSeparator, bytes domainValue);

    function _verifySig(
        ERC20ForwardRequest memory req,
        bytes32 domainSeparator,
        bytes memory sig)
    internal
    view
    {
        require(domains[domainSeparator], "unregistered domain separator");
        bytes32 digest =
            keccak256(abi.encodePacked(
                "\x19\x01",
                domainSeparator,
                keccak256(abi.encode(REQUEST_TYPEHASH,
                                     req.from,
                                     req.to,
                                     req.token,
                                     req.feeReceiver,
                                     req.feeMultiplierManager,
                                     req.msgValue,
                                     req.gas,
                                     req.price,
                                     req.nonce,
                                     keccak256(req.data)))
        ));
        require(digest.recover(sig) == req.from, "signature mismatch");
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function _verifySigPersonalSign(
        ERC20ForwardRequest memory req,
        bytes memory sig)
    internal
    view
    {
        bytes32 digest = prefixed(keccak256(abi.encodePacked(
            req.from,
            req.to,
            req.token,
            req.feeReceiver,
            req.feeMultiplierManager,
            req.msgValue,
            req.gas,
            req.price,
            req.nonce,
            req.data
        )));
        require(digest.recover(sig) == req.from, "signature mismatch");
    }

}