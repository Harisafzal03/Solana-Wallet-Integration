"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function CreateSubaccountButton() {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSubaccount = async () => {
    if (!wallet.connected || !wallet.signTransaction) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      
      // In a real implementation, this would make a call to your API endpoint
      // For now, we'll just simulate the process with a delay
      setTimeout(() => {
        setIsLoading(false);
        alert("Subaccount creation simulated successfully! In a real implementation, this would create a new Drift Protocol subaccount.");
        // You'd ideally refresh the subaccounts list here
      }, 1500);
      
    } catch (error: any) {
      console.error("Error creating subaccount:", error);
      alert("Failed to create subaccount: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreateSubaccount}
      disabled={isLoading || !wallet.connected}
      className={`px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 ${
        isLoading ? "animate-pulse" : ""
      }`}
    >
      {isLoading ? "Creating..." : "Create Subaccount"}
    </button>
  );
}