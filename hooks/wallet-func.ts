import { ethers } from "ethers";
async function walletConnectFcn(network:any) {
    console.log(`\n=======================================`);
    // ETHERS PROVIDER
    // ethers v6+ does not have ethers.providers, use ethers.BrowserProvider instead
    const provider = new ethers.BrowserProvider((window as any).ethereum, "any");
    // SWITCH TO HEDERA TEST NETWORK
    console.log(`- Switching network to the Hedera ${network}...🟠`);
    let chainId;
    if (network === "testnet") {
        chainId = "0x128";
    } else if (network === "previewnet") {
        chainId = "0x129";
    } else {
        chainId = "0x127";
    }
    await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
            {
                chainName: `Hedera ${network}`,
                chainId: chainId,
                nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
                rpcUrls: [`https://${network}.hashio.io/api`],
                blockExplorerUrls: [`https://hashscan.io/${network}/`],
            },
        ],
    });
    console.log("- Switched ✅");
    // // CONNECT TO ACCOUNT
    console.log("- Connecting wallet...🟠");
    let selectedAccount;
    await provider
        .send("eth_requestAccounts", [])
        .then((accounts:any) => {
            selectedAccount = accounts[0];
            console.log(`- Selected account: ${selectedAccount} ✅`);
        })
        .catch((connectError:any) => {
            console.log(`- ${connectError.message.toString()}`);
            return;
        });
    return [selectedAccount, provider];
}
export default walletConnectFcn;