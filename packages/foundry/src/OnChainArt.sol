// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data)
        external
        returns (bytes4);
}

/**
 * @title OnChainArt
 * @notice A fully on-chain generative SVG art NFT contract.
 *         Each token stores its art metadata entirely on-chain.
 *         Artists can mint their own artwork with a title and SVG string.
 */
contract OnChainArt {
    // ── Errors ──────────────────────────────────────────────────────────────
    error NotOwner();
    error TokenDoesNotExist();
    error NotApproved();
    error EmptySVG();
    error EmptyTitle();
    error ZeroAddress();
    error MintPriceRequired();

    // ── Events ───────────────────────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event ArtMinted(uint256 indexed tokenId, address indexed artist, string title);
    event ArtUpdated(uint256 indexed tokenId, string newTitle);

    // ── Storage ──────────────────────────────────────────────────────────────
    string public name = "OnChainArt";
    string public symbol = "OCA";

    address public owner;
    uint256 public mintPrice;
    uint256 private _nextTokenId;

    struct ArtPiece {
        string title;
        string svgData;
        address artist;
        uint256 mintedAt;
    }

    mapping(uint256 => ArtPiece) private _art;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // ── Constructor ──────────────────────────────────────────────────────────
    constructor(uint256 _mintPrice) {
        owner = msg.sender;
        mintPrice = _mintPrice;
    }

    // ── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        _;
    }

    // ── Admin ────────────────────────────────────────────────────────────────
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function withdraw() external onlyOwner {
        (bool ok,) = owner.call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }

    // ── Minting ──────────────────────────────────────────────────────────────
    /**
     * @notice Mint a new on-chain art NFT.
     * @param title  Short title for the artwork (non-empty).
     * @param svgData  Raw SVG markup stored entirely on-chain.
     */
    function mint(string calldata title, string calldata svgData) external payable returns (uint256) {
        if (mintPrice > 0 && msg.value < mintPrice) revert MintPriceRequired();
        if (bytes(title).length == 0) revert EmptyTitle();
        if (bytes(svgData).length == 0) revert EmptySVG();

        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = msg.sender;
        _balances[msg.sender]++;

        _art[tokenId] = ArtPiece({
            title: title,
            svgData: svgData,
            artist: msg.sender,
            mintedAt: block.timestamp
        });

        emit Transfer(address(0), msg.sender, tokenId);
        emit ArtMinted(tokenId, msg.sender, title);

        return tokenId;
    }

    // ── Art accessors ────────────────────────────────────────────────────────
    function getArt(uint256 tokenId) external view tokenExists(tokenId) returns (ArtPiece memory) {
        return _art[tokenId];
    }

    function updateTitle(uint256 tokenId, string calldata newTitle) external tokenExists(tokenId) {
        if (_owners[tokenId] != msg.sender) revert NotOwner();
        if (bytes(newTitle).length == 0) revert EmptyTitle();
        _art[tokenId].title = newTitle;
        emit ArtUpdated(tokenId, newTitle);
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    // ── ERC-721 ──────────────────────────────────────────────────────────────
    function balanceOf(address _owner) external view returns (uint256) {
        if (_owner == address(0)) revert ZeroAddress();
        return _balances[_owner];
    }

    function ownerOf(uint256 tokenId) external view tokenExists(tokenId) returns (address) {
        return _owners[tokenId];
    }

    function approve(address to, uint256 tokenId) external tokenExists(tokenId) {
        address tokenOwner = _owners[tokenId];
        if (msg.sender != tokenOwner && !_operatorApprovals[tokenOwner][msg.sender]) {
            revert NotApproved();
        }
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view tokenExists(tokenId) returns (address) {
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address _owner, address operator) external view returns (bool) {
        return _operatorApprovals[_owner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) external tokenExists(tokenId) {
        if (to == address(0)) revert ZeroAddress();
        address tokenOwner = _owners[tokenId];
        if (from != tokenOwner) revert NotOwner();
        if (
            msg.sender != tokenOwner && msg.sender != _tokenApprovals[tokenId]
                && !_operatorApprovals[tokenOwner][msg.sender]
        ) revert NotApproved();

        delete _tokenApprovals[tokenId];
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        this.safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data)
        external
        tokenExists(tokenId)
    {
        if (to == address(0)) revert ZeroAddress();
        address tokenOwner = _owners[tokenId];
        if (from != tokenOwner) revert NotOwner();
        if (
            msg.sender != tokenOwner && msg.sender != _tokenApprovals[tokenId]
                && !_operatorApprovals[tokenOwner][msg.sender]
        ) revert NotApproved();

        delete _tokenApprovals[tokenId];
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        if (to.code.length > 0) {
            bytes4 retval =
                IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data);
            require(retval == IERC721Receiver.onERC721Received.selector, "ERC721: unsafe recipient");
        }
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x80ac58cd // ERC721
            || interfaceId == 0x5b5e139f // ERC721Metadata
            || interfaceId == 0x01ffc9a7; // ERC165
    }

    // ── Token URI (fully on-chain) ────────────────────────────────────────────
    function tokenURI(uint256 tokenId) external view tokenExists(tokenId) returns (string memory) {
        ArtPiece memory art = _art[tokenId];
        string memory svgB64 = _base64Encode(bytes(art.svgData));
        string memory json = string(
            abi.encodePacked(
                '{"name":"',
                art.title,
                '","description":"On-chain generative art minted on OnChainArt","image":"data:image/svg+xml;base64,',
                svgB64,
                '","attributes":[{"trait_type":"Artist","value":"',
                _toHexString(art.artist),
                '"},{"trait_type":"Minted At","value":',
                _uint2str(art.mintedAt),
                "}]}"
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", _base64Encode(bytes(json))));
    }

    // ── Utility ──────────────────────────────────────────────────────────────
    function _uint2str(uint256 n) internal pure returns (string memory) {
        if (n == 0) return "0";
        uint256 temp = n;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buf = new bytes(digits);
        while (n != 0) {
            digits--;
            buf[digits] = bytes1(uint8(48 + uint256(n % 10)));
            n /= 10;
        }
        return string(buf);
    }

    function _toHexString(address addr) internal pure returns (string memory) {
        bytes memory HEX = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = HEX[uint8(uint160(addr) >> (4 * (39 - 2 * i))) & 0xf];
            str[3 + i * 2] = HEX[uint8(uint160(addr) >> (4 * (38 - 2 * i))) & 0xf];
        }
        return string(str);
    }

    bytes private constant _TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        bytes memory table = _TABLE;
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            let i := 0
            let dataLen := mload(data)
            let dataPtr := add(data, 32)
            for {} lt(i, dataLen) {} {
                i := add(i, 3)
                let input := 0
                switch lt(sub(dataLen, i), 3)
                case 0 {
                    input := or(or(shl(16, byte(0, mload(add(dataPtr, sub(i, 3))))), shl(8, byte(0, mload(add(dataPtr, sub(i, 2)))))), byte(0, mload(add(dataPtr, sub(i, 1)))))
                }
                default {
                    switch eq(sub(dataLen, i), 0xfffffffffffffffe)
                    default {
                        input := or(shl(16, byte(0, mload(add(dataPtr, sub(i, 3))))), shl(8, byte(0, mload(add(dataPtr, sub(i, 2))))))
                    }
                }
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            switch mod(dataLen, 3)
            case 1 {
                mstore8(sub(resultPtr, 1), 0x3d)
                mstore8(sub(resultPtr, 2), 0x3d)
            }
            case 2 { mstore8(sub(resultPtr, 1), 0x3d) }
        }
        return string(result);
    }
}
