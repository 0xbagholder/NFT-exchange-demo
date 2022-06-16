const { ethers, network } = require("hardhat");
const { mineBlocks } = require("../utils/mine-blocks");

const TOKEN_ID = 1;

async function cancelListing() {
	const nftExchange = await ethers.getContract("NftExchange");
	const basicNft = await ethers.getContract("BasicNft");
	await nftExchange.cancelListing(basicNft.address, TOKEN_ID);
	console.log("NFT Listing cancelled!");
	if (network.config.chainId == "31337") {
		await mineBlocks(2, 1);
	}
}

cancelListing()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
