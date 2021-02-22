const TestContract = artifacts.require("TestContract");

module.exports = function(deployer) {
  let kovanTrustedForwarder = "0xE8Df44bcaedD41586cE73eB85e409bcaa834497B";
  deployer.deploy(TestContract, kovanTrustedForwarder);
};
