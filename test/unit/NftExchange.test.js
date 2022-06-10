const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { expect } = require("chai");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("NftExchange Unit Tests", () => {
			let deployer, player, nftExchange, basicNft;
			const TOKEN_ID = 0;
			const PRICE = ethers.utils.parseEther("0.1");

			beforeEach(async () => {
				[deployer, player] = await ethers.getSigners();
				await deployments.fixture(["all"]);
				nftExchange = await ethers.getContract("NftExchange", deployer);
				basicNft = await ethers.getContract("BasicNft", deployer);
				await basicNft.mintNft();
				await basicNft.approve(nftExchange.address, TOKEN_ID);
			});

			it("Is able to list NFTs and allow users to buy them", async () => {
				await nftExchange.listNft(basicNft.address, TOKEN_ID, PRICE);
				await nftExchange
					.connect(player)
					.buyNft(basicNft.address, TOKEN_ID, { value: PRICE });

				const newOwner = await basicNft.ownerOf(TOKEN_ID);
				const sellerProceeds = await nftExchange.getProceeds(deployer.address);
				expect(newOwner).to.be.equal(player.address);
				expect(sellerProceeds).to.be.equal(PRICE);
			});
	  });
