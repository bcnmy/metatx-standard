pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

//to do, seperate into forwarderWithPersonalSign.sol and ERC20Forwarder.sol

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BiconomyForwarder.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/IFeeMultiplier.sol";
import "./ERC20ForwardRequest.sol";

contract ERC20FeeProxy is ERC20ForwarderRequest, Ownable{

    using SafeMath for uint256;
    uint256 transferHandlerGas;
    BiconomyForwarder forwarder;

    constructor(address payable _forwarder, uint256 tHGas) public {
        forwarder = BiconomyForwarder(_forwarder);
        transferHandlerGas = tHGas; //safe figure we can change later to be more accurate
    }

    function setTHG(uint256 tHGas) public onlyOwner{
        transferHandlerGas = tHGas;
    }

    function getNonce(address from)
    public view
    returns(uint256){
        uint256 nonce = forwarder.getNonce(from);
        return nonce;
    }

    function executeEIP712(
        ERC20ForwardRequest memory req,
        bytes32 domainSeparator,
        bytes memory sig
        )
        public payable
        returns (bool success, bytes memory ret){
            uint256 initialGas = gasleft();
            (success,ret) = forwarder.executeEIP712{value: req.msgValue}(req,domainSeparator,sig);
            if ( address(this).balance>0 ) {
                //can't fail: req.from signed (off-chain) the request, so it must be an EOA...
                payable(req.from).transfer(address(this).balance);
            }
            uint256 postGas = gasleft();
            _transferHandler(req,initialGas.sub(postGas));
    }


    function executePersonalSign(
        ERC20ForwardRequest memory req,
        bytes memory sig
        )
        public payable
        returns (bool success, bytes memory ret){
            uint256 initialGas = gasleft();
            (success,ret) = forwarder.executePersonalSign{value: req.msgValue}(req,sig);
            if ( address(this).balance>0 ) {
                //can't fail: req.from signed (off-chain) the request, so it must be an EOA...
                payable(req.from).transfer(address(this).balance);
            }
            uint256 postGas = gasleft();
            _transferHandler(req,initialGas.sub(postGas));
    }

    //good
    function _transferHandler(ERC20ForwardRequest memory req,uint256 executionGas) internal{
        uint16 multiplierBasisPoints = IFeeMultiplier(req.feeMultiplierManager).getFeeMultiplier(req.from,req.token);
        executionGas = executionGas.add(transferHandlerGas);
        require(IERC20(req.token).transferFrom(
            req.from,
            req.feeReceiver,
            req.price.mul(executionGas).mul(multiplierBasisPoints).div(10000)));
    }


}

