const { ethers, network } = require("hardhat");
const { mineBlocks } = require("../utils/mine-blocks");

const LIST_PRICE = ethers.utils.parseEther("0.01");

const mintAndList = async () => {
	const nftExchange = await ethers.getContract("NftExchange");
	const basicNft = await ethers.getContract("BasicNft");
	console.log(`NftExchange: ${nftExchange.address}`);
	console.log(`BasicNft: ${basicNft.address}`);

	console.log("Minting NFT...");
	const mintTx = await basicNft.mintNft();
	const mintTxReceipt = await mintTx.wait(1);
	const tokenId = mintTxReceipt.events[1].args.tokenId;
	console.log(`BasicNFT token #${tokenId.toString()} has been minted!`);

	console.log("Approving NFT for listing...");
	await basicNft.approve(nftExchange.address, tokenId);

	console.log("Listing NFT for sale...");
	await nftExchange.listNft(basicNft.address, tokenId, LIST_PRICE);
	console.log("Listing successful!");

	if (network.config.chainId == "31337") {
		await mineBlocks(2, 10 /* 10ms */);
	}
};

mintAndList()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
