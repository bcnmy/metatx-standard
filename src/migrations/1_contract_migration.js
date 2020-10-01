const GasLessToken = artifacts.require("GasLessToken");

module.exports = function(deployer) {
  let totalSupply = "10000000000000000000000000000";
  let owner = "0x256144a60f34288F7b03D345F8Cb256C502e0f2C";

  deployer.deploy(GasLessToken, "Gasless Token", "BCNMY", totalSupply, owner);
};
