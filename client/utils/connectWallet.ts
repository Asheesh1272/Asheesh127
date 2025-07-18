/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserProvider } from "ethers";
import { toast } from "sonner";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BNB_TESTNET_PARAMS = {
  chainId: "0x61",
  chainName: "BNB Smart Chain Testnet",
  nativeCurrency: {
    name: "Test BNB",
    symbol: "tBNB",
    decimals: 18,
  },
  rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
  blockExplorerUrls: ["https://testnet.bscscan.com/"],
};

export const connectWallet = async (
  setIsConnected: (val: boolean) => void,
  setUserAddress: (val: string) => void,
  setSigner: (val: any) => void,
  setSignature?: (val: string) => void // optional
) => {
  if (!window.ethereum) {
    toast.error(
      "🦊 No crypto wallet detected! Please install MetaMask or another Web3 wallet."
    );
    return;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setSigner(signer);

    const accounts = await provider.send("eth_requestAccounts", []);
    const address = accounts[0];
    setUserAddress(address);
    setIsConnected(true);

    const { chainId } = await provider.getNetwork();
    const bnbTestnetId = 97;

    if (parseInt(chainId.toString(), 10) !== bnbTestnetId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BNB_TESTNET_PARAMS.chainId }],
        });
        toast.success("🔗 Switched to BNB Smart Chain Testnet!");
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [BNB_TESTNET_PARAMS],
            });
            toast.success("✅ BNB Testnet added and connected!");
          } catch (addError) {
            toast.error("❌ Failed to add BNB Testnet. Try manually.");
            console.error("Add network error:", addError);
          }
        } else {
          toast.error("🔄 Failed to switch network. Try manually.");
          console.error("Switch error:", switchError);
        }
      }
    } else {
      toast.success("🎉 Wallet connected! Welcome to Voice Chain!");
    }

    // ✍️ Prompt for signature if handler is provided
    if (setSignature) {
      const message = `VoiceChain Authentication\nAddress: ${address}\nTime: ${new Date().toISOString()}`;
      try {
        const signature = await signer.signMessage(message);
        setSignature(signature);
        toast.success("🖊️ Wallet signature complete!");
        console.log("Signature:", signature);
      } catch (signError) {
        toast.error("⚠️ Signature declined.");
        console.error("Signature error:", signError);
      }
    }
  } catch (error) {
    toast.error("⚠️ Wallet connection failed. Try again.");
    console.error("Connection error:", error);
  }
};