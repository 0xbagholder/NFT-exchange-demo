// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error NftExchange__PriceMustBeAboveZero();
error NftExchange__NotApprovedForExchange();
error NftExchange__AlreadyListed(address nftAddr, uint256 tokenId);

contract NftExchange {
	struct Listing {
		uint256 price;
		address seller;
	}

	event ItemListed(
		address indexed seller,
		address indexed nftAddr,
		uint256 indexed tokenId,
		uint256 price
	);

	// NFT contract address -> NFT Token ID -> Listing
	mapping(address => mapping(uint256 => Listing)) private s_listings;

	modifier notListed(
		address _nftAddr,
		uint256 _tokenId,
		address _owner
	) {
		Listing memory listing = s_listings[_nftAddr][_tokenId];
		if (listing.price > 0) revert NftExchange__AlreadyListed(_nftAddr, _tokenId);
		_;
	}

	modifier isOwner(
		address _nftAddr,
		uint256 _tokenId,
		address _spender
	) {}

	constructor() {}

	function listItem(
		address _nftAddr,
		uint256 _tokenId,
		uint256 _price
	) external notListed(_nftAddr, _tokenId, msg.sender) {
		if (_price <= 0) revert NftExchange__PriceMustBeAboveZero();

		IERC721 nft = IERC721(_nftAddr);
		if (nft.getApproved(_tokenId) != address(this))
			revert NftExchange__NotApprovedForExchange();

		s_listings[_nftAddr][_tokenId] = Listing(_price, msg.sender);
		emit ItemListed(msg.sender, _nftAddr, _tokenId, _price);
	}
}
