const { ethers } = require("hardhat");

const MINT_PRICE = ethers.utils.parseEther("0.01");

const mintAndList = async () => {
	const nftExchange = await ethers.getContract("NftExchange");
	const basicNft = await ethers.getContract("BasicNft");

	console.log("Minting NFT...");
	const mintTx = await basicNft.mintNft();
	const mintTxReceipt = await mintTx.wait(1);
	const tokenId = mintTxReceipt.events[1].args.tokenId;
	console.log(`BasicNFT token #${tokenId.toString()} has been minted!`);

	console.log("Approving NFT for listing...");
	await basicNft.approve(nftExchange.address, tokenId);

	console.log("Listing NFT for sale...");
	await nftExchange.listNft(basicNft.address, tokenId, MINT_PRICE);
};

mintAndList()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
