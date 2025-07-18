/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { WalletContext } from "@/context/Wallet";
import Link from "next/link";
import { connectWallet } from "@/utils/connectWallet";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletConnectButton = () => {
  const {
    setIsConnected,
    setUserAddress,
    setSigner,
    isConnected,
    userAddress,
  } = useContext(WalletContext);

  const handleConnect = async () => {
    await connectWallet(
      setIsConnected,
      setUserAddress,
      setSigner,
    );
  };

  return (
    <div className="flex gap-6">
      <Button
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-4"
        disabled={isConnected}
        onClick={handleConnect}
      >
        {userAddress
          ? `${userAddress.slice(0, 12)}...${userAddress.slice(-13)}`
          : "Connect Wallet"}
      </Button>

      {isConnected && userAddress && (
        <Link href="/upload">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-4 w-full"
          >
            Start Protest
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export default WalletConnectButton;