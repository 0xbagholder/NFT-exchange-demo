const { ethers, network } = require("hardhat");
const { mineBlocks } = require("../utils/mine-blocks");

const TOKEN_ID = 3;

async function buyItem() {
	const nftExchange = await ethers.getContract("NftExchange");
	const basicNft = await ethers.getContract("BasicNft");
	const listing = await nftExchange.getListing(basicNft.address, TOKEN_ID);
	const price = listing.price.toString();

	await nftExchange.buyNft(basicNft.address, TOKEN_ID, { value: price });
	console.log("Bought an NFT!");

	if (network.config.chainId == "31337") {
		await mineBlocks(2, 1);
	}
}

buyItem()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
