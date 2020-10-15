pragma solidity ^0.6.8;

import "../interfaces/IFeeMultiplier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ExampleFeeMultiplier is IFeeMultiplier, Ownable{
    uint16 public defaultBP;
    mapping(address=>uint16) public userBP;

    function setDefaultBP(uint16 bp) external onlyOwner{
        defaultBP = bp;
    }

    function setUserBP(address user, uint16 bp) external onlyOwner{
        userBP[user] = bp;
    }

    function getFeeMultiplier(address user, address token) external override returns (uint16 basisPoints){
        uint16 basisPoints = userBP[user];
        basisPoints = basisPoints > 0 ? basisPoints : defaultBP;
        return basisPoints;
    }

}