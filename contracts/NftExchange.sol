// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NftExchange__PriceMustBeAboveZero();
error NftExchange__NotApprovedForExchange();
error NftExchange__AlreadyListed(address nftAddr, uint256 tokenId);
error NftExchange__NotListed(address nftAddr, uint256 tokenId);
error NftExchange__NotOwner();
error NftExchange__PriceNotMet(address nftAddr, uint256 tokenId, uint256 price);

contract NftExchange is ReentrancyGuard {
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

	event ItemBought(
		address indexed buyer,
		address indexed nftAddr,
		uint256 indexed tokenId,
		uint256 price
	);

	event ListingCancelled(address indexed owner, address indexed nftAddr, uint256 indexed tokenId);

	// NFT contract address -> NFT Token ID -> Listing
	mapping(address => mapping(uint256 => Listing)) private s_listings;
	// Seller address -> Amount earned
	mapping(address => uint256) private s_proceeds;

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
		address _seller
	) {
		IERC721 nft = IERC721(_nftAddr);
		address owner = nft.ownerOf(_tokenId);
		if (_seller != owner) revert NftExchange__NotOwner();
		_;
	}

	modifier isListed(address _nftAddr, uint256 _tokenId) {
		Listing memory listing = s_listings[_nftAddr][_tokenId];
		if (listing.price <= 0) revert NftExchange__NotListed(_nftAddr, _tokenId);
		_;
	}

	constructor() {}

	/**
	 * @notice Function for listing an NFT on the exchange
	 * @param _nftAddr: Address of the NFT
	 * @param _tokenId: Token ID of the NFT
	 * @param _price: Listing price of the NFT, set by the seller
	 * @dev Sellers would still be able to hold the NFT in their wallet while it is being listed
	 */
	function listNft(
		address _nftAddr,
		uint256 _tokenId,
		uint256 _price
	) external notListed(_nftAddr, _tokenId, msg.sender) isOwner(_nftAddr, _tokenId, msg.sender) {
		if (_price <= 0) revert NftExchange__PriceMustBeAboveZero();

		IERC721 nft = IERC721(_nftAddr);
		if (nft.getApproved(_tokenId) != address(this))
			revert NftExchange__NotApprovedForExchange();

		s_listings[_nftAddr][_tokenId] = Listing(_price, msg.sender);
		emit ItemListed(msg.sender, _nftAddr, _tokenId, _price);
	}

	function buyNft(address _nftAddr, uint256 _tokenId)
		external
		payable
		nonReentrant
		isListed(_nftAddr, _tokenId)
	{
		Listing memory listing = s_listings[_nftAddr][_tokenId];
		if (msg.value < listing.price)
			revert NftExchange__PriceNotMet(_nftAddr, _tokenId, listing.price);

		s_proceeds[listing.seller] += msg.value;
		delete s_listings[_nftAddr][_tokenId];
		IERC721(_nftAddr).safeTransferFrom(listing.seller, msg.sender, _tokenId);
		emit ItemBought(msg.sender, _nftAddr, _tokenId, msg.value);
	}

	function cancelListing(address _nftAddr, uint256 _tokenId)
		external
		isOwner(_nftAddr, _tokenId, msg.sender)
		isListed(_nftAddr, _tokenId)
	{
		delete s_listings[_nftAddr][_tokenId];
		emit ListingCancelled(msg.sender, _nftAddr, _tokenId);
	}
}
