const { ethers, network } = require("hardhat");
const { mineBlocks } = require("../utils/mine-blocks");

const mint = async () => {
	const basicNft = await ethers.getContract("BasicNft");
	console.log(`BasicNft: ${basicNft.address}`);

	console.log("Minting NFT...");
	const mintTx = await basicNft.mintNft();
	const mintTxReceipt = await mintTx.wait(1);
	const tokenId = mintTxReceipt.events[1].args.tokenId;
	console.log(`BasicNFT token #${tokenId.toString()} has been minted!`);

	if (network.config.chainId == "31337") {
		await mineBlocks(2, 100 /* 0.1s */);
	}
};

mint()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
