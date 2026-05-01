// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {OnChainArt} from "../src/OnChainArt.sol";

contract DeployOnChainArt is Script {
    function run() external returns (OnChainArt) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        uint256 mintPrice = vm.envOr("MINT_PRICE", uint256(0.01 ether));

        vm.startBroadcast(deployerKey);
        OnChainArt artContract = new OnChainArt(mintPrice);
        vm.stopBroadcast();

        console.log("OnChainArt deployed at:", address(artContract));
        console.log("Owner:", artContract.owner());
        console.log("Mint price:", artContract.mintPrice());

        return artContract;
    }
}
