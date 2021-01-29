const ForwarderTest = artifacts.require("ForwarderTest");

module.exports = function(deployer) {
  let trustedForwarder = "0x672F90079b45FA12D74D8e0c8f07BD9505188984";
  deployer.deploy(ForwarderTest, trustedForwarder);
};
