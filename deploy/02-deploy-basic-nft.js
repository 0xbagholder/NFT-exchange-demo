const { BLOCK_CONFIRMATIONS, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	const waitConfirmations = !developmentChains.includes(network.name) ? BLOCK_CONFIRMATIONS : 1;
	const basicNft = await deploy("BasicNft", {
		from: deployer,
		args: [],
		log: true,
		waitConfirmations,
	});

	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(basicNft.address, []);
	}
	log("----------------------------------------------------------------------------------------");
};

module.exports.tags = ["all", "basicNft"];
