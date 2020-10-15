const GasLessToken = artifacts.require("GasLessToken");
const ERC20FeeProxy = artifacts.require("ERC20FeeProxy");
const BiconomyForwarder = artifacts.require("BiconomyForwarder");
const ExampleFeeMultiplier = artifacts.require("ExampleFeeMultiplier");

module.exports = function(deployer) {
  let totalSupply = "10000000000000000000000000000";
  let owner = "0x256144a60f34288F7b03D345F8Cb256C502e0f2C";

  // deployer.deploy(BiconomyForwarder).then((biconomyForwarder) => {
    // return deployer.deploy(ERC20FeeProxy, BiconomyForwarder.address, 0).then(async ()=>{
      // await biconomyForwarder.registerDomainSeparator("TestRecipient","1");
      return deployer.deploy(GasLessToken, "Stable Coin","USDT",totalSupply,owner,"0x3dBcD47Ca5477b5d2f996DBB6462E186c5841d0c").then(async ()=>{
        // return await deployer.deploy(ExampleFeeMultiplier);
      });
    // });
  // });
};
