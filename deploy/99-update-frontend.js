const { ethers, network } = require("hardhat");
const fs = require("fs");

const frontendContractsFile = "../15.2-nextjs-moralis-nft-exchange/constants/networkMapping.json";
const frontendAbiLocation = "../15.2-nextjs-moralis-nft-exchange/constants/";

module.exports = async () => {
	if (process.env.UPDATE_FRONTEND) {
		console.log("Updating frontend...");
		await updateContractAddresses();
		await updateABI();
	}
};

async function updateABI() {
	const nftExchange = await ethers.getContract("NftExchange");
	fs.writeFileSync(
		`${frontendAbiLocation}NftExchange.json`,
		nftExchange.interface.format(ethers.utils.FormatTypes.json)
	);

	const basicNft = await ethers.getContract("BasicNft");
	fs.writeFileSync(
		`${frontendAbiLocation}BasicNft.json`,
		basicNft.interface.format(ethers.utils.FormatTypes.json)
	);
}

async function updateContractAddresses() {
	const nftExchange = await ethers.getContract("NftExchange");
	const chainId = network.config.chainId.toString();
	const contractAddresses = JSON.parse(fs.readFileSync(frontendContractsFile, "utf8"));

	if (chainId in contractAddresses) {
		if (!contractAddresses[chainId]["NftExchange"].includes(nftExchange.address)) {
			contractAddresses[chainId]["NftExchange"].push(nftExchange.address);
		}
	} else {
		contractAddresses[chainId] = { NftExchange: [nftExchange.address] };
	}

	fs.writeFileSync(frontendContractsFile, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all", "frontend"];
