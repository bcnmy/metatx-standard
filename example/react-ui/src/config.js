let config = {};
config.contract = {
    address: "0x53633f72C17333a868276Ea6B451543CdfA40D4D",
    abi: [{"inputs":[{"internalType":"address","name":"_forwarder","type":"address"},{"internalType":"string","name":"_paymasterVersion","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"name":"isTrustedForwarder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"quote","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"newQuote","type":"string"}],"name":"setQuote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getQuote","outputs":[{"internalType":"string","name":"currentQuote","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"versionRecipient","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]
}

config.gsnConfig = {
	ourContract: '0x53633f72C17333a868276Ea6B451543CdfA40D4D',
	notOurs:     '0x6969Bc71C8f631f6ECE03CE16FdaBE51ae4d66B1',
	paymaster:   '0x21Dc51041a42262bDA26CA61E706485cAe54E86B',
	relayhub:    '0x2E0d94754b348D208D64d52d78BcD443aFA9fa52',
	stakemgr:    '0x0ecf783407C5C80D71CFEa37938C0b60BD255FF8',
	gasPrice:    20000000000   // 20 Gwei
}

module.exports = {config}
