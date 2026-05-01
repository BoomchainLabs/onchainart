// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {OnChainArt} from "../src/OnChainArt.sol";

contract OnChainArtTest is Test {
    OnChainArt public art;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    string constant SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#1a1a2e"/><circle cx="200" cy="200" r="100" fill="#e94560" opacity="0.8"/></svg>';
    string constant TITLE = "Genesis";

    function setUp() public {
        art = new OnChainArt(0.01 ether);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    // ── Minting ──────────────────────────────────────────────────────────────
    function test_MintSuccess() public {
        vm.prank(alice);
        uint256 tokenId = art.mint{value: 0.01 ether}(TITLE, SVG);
        assertEq(tokenId, 0);
        assertEq(art.ownerOf(0), alice);
        assertEq(art.balanceOf(alice), 1);
        assertEq(art.totalSupply(), 1);
    }

    function test_MintEmitsEvents() public {
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit OnChainArt.Transfer(address(0), alice, 0);
        vm.expectEmit(true, true, false, true);
        emit OnChainArt.ArtMinted(0, alice, TITLE);
        art.mint{value: 0.01 ether}(TITLE, SVG);
    }

    function test_MintRevertsIfUnderpaid() public {
        vm.prank(alice);
        vm.expectRevert(OnChainArt.MintPriceRequired.selector);
        art.mint{value: 0.001 ether}(TITLE, SVG);
    }

    function test_MintRevertsOnEmptyTitle() public {
        vm.prank(alice);
        vm.expectRevert(OnChainArt.EmptyTitle.selector);
        art.mint{value: 0.01 ether}("", SVG);
    }

    function test_MintRevertsOnEmptySVG() public {
        vm.prank(alice);
        vm.expectRevert(OnChainArt.EmptySVG.selector);
        art.mint{value: 0.01 ether}(TITLE, "");
    }

    function test_FreeMintWhenPriceZero() public {
        art.setMintPrice(0);
        vm.prank(alice);
        uint256 tokenId = art.mint(TITLE, SVG);
        assertEq(art.ownerOf(tokenId), alice);
    }

    // ── Art data ─────────────────────────────────────────────────────────────
    function test_GetArt() public {
        vm.prank(alice);
        art.mint{value: 0.01 ether}(TITLE, SVG);
        OnChainArt.ArtPiece memory piece = art.getArt(0);
        assertEq(piece.title, TITLE);
        assertEq(piece.svgData, SVG);
        assertEq(piece.artist, alice);
    }

    function test_GetArtRevertsForNonexistent() public {
        vm.expectRevert(OnChainArt.TokenDoesNotExist.selector);
        art.getArt(999);
    }

    function test_UpdateTitle() public {
        vm.startPrank(alice);
        art.mint{value: 0.01 ether}(TITLE, SVG);
        art.updateTitle(0, "Reborn");
        vm.stopPrank();
        assertEq(art.getArt(0).title, "Reborn");
    }

    function test_UpdateTitleRevertsIfNotOwner() public {
        vm.prank(alice);
        art.mint{value: 0.01 ether}(TITLE, SVG);
        vm.prank(bob);
        vm.expectRevert(OnChainArt.NotOwner.selector);
        art.updateTitle(0, "Hacked");
    }

    // ── Token URI ─────────────────────────────────────────────────────────────
    function test_TokenURIReturnsBase64JSON() public {
        vm.prank(alice);
        art.mint{value: 0.01 ether}(TITLE, SVG);
        string memory uri = art.tokenURI(0);
        assertTrue(bytes(uri).length > 0);
        // Should start with data:application/json;base64,
        bytes memory uriBytes = bytes(uri);
        bytes memory prefix = bytes("data:application/json;base64,");
        for (uint256 i = 0; i < prefix.length; i++) {
            assertEq(uriBytes[i], prefix[i]);
        }
    }

    // ── ERC-721 transfers ─────────────────────────────────────────────────────
    function test_Transfer() public {
        vm.prank(alice);
        art.mint{value: 0.01 ether}(TITLE, SVG);
        vm.prank(alice);
        art.transferFrom(alice, bob, 0);
        assertEq(art.ownerOf(0), bob);
        assertEq(art.balanceOf(alice), 0);
        assertEq(art.balanceOf(bob), 1);
    }

    function test_TransferRevertsIfNotApproved() public {
        vm.prank(alice);
        art.mint{value: 0.01 ether}(TITLE, SVG);
        vm.prank(bob);
        vm.expectRevert(OnChainArt.NotApproved.selector);
        art.transferFrom(alice, bob, 0);
    }

    function test_ApproveAndTransfer() public {
        vm.prank(alice);
        art.mint{value: 0.01 ether}(TITLE, SVG);
        vm.prank(alice);
        art.approve(bob, 0);
        assertEq(art.getApproved(0), bob);
        vm.prank(bob);
        art.transferFrom(alice, bob, 0);
        assertEq(art.ownerOf(0), bob);
    }

    function test_ApprovalForAll() public {
        vm.prank(alice);
        art.mint{value: 0.01 ether}(TITLE, SVG);
        vm.prank(alice);
        art.setApprovalForAll(bob, true);
        assertTrue(art.isApprovedForAll(alice, bob));
        vm.prank(bob);
        art.transferFrom(alice, bob, 0);
        assertEq(art.ownerOf(0), bob);
    }

    // ── Admin ────────────────────────────────────────────────────────────────
    function test_Withdraw() public {
        vm.prank(alice);
        art.mint{value: 0.01 ether}(TITLE, SVG);
        uint256 before = address(this).balance;
        art.withdraw();
        assertGt(address(this).balance, before);
    }

    function test_WithdrawRevertsIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert(OnChainArt.NotOwner.selector);
        art.withdraw();
    }

    function test_SetMintPrice() public {
        art.setMintPrice(0.05 ether);
        assertEq(art.mintPrice(), 0.05 ether);
    }

    function test_TransferOwnership() public {
        art.transferOwnership(alice);
        assertEq(art.owner(), alice);
    }

    function test_TransferOwnershipRevertsZeroAddress() public {
        vm.expectRevert(OnChainArt.ZeroAddress.selector);
        art.transferOwnership(address(0));
    }

    receive() external payable {}
}
