"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useDriftStore } from "../store/driftStore";

export default function MockWalletButton() {
  const { setSelectedAuthority } = useDriftStore();
  const [isMockActive, setIsMockActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Example public keys with known subaccounts on Drift devnet
  // These are real addresses with Drift accounts on devnet
  const testWallets = [
    "BUX7s2ef2htTGb2KKoPHWkmzxPj4nTWMWRgs5CSbQxf9",
    "2WgjxrUfkdPgLGr1vdwkpQ7KiP3joGnFx8zoTKPz6JGr",
    "11111111111111111111111111111111", // System program (likely no accounts)
    "GkzTnqZC5vgpLa6RWTzH5j8dVDQESpUUz5ktXUpKtozJ" // Another address
  ];

  const activateMockWallet = () => {
    try {
      // Cycle through the test wallets
      const nextIndex = (currentIndex + 1) % testWallets.length;
      const mockPublicKey = new PublicKey(testWallets[nextIndex]);
      setSelectedAuthority(mockPublicKey);
      setCurrentIndex(nextIndex);
      setIsMockActive(true);
    } catch (error) {
      console.error("Failed to set mock wallet:", error);
    }
  };

  return (
    <button
      onClick={activateMockWallet}
      className={`px-4 py-2 text-white rounded ${
        isMockActive ? "bg-orange-600" : "bg-orange-500 hover:bg-orange-600"
      }`}
    >
      {isMockActive 
        ? `Test Wallet ${currentIndex + 1}/${testWallets.length}` 
        : "Use Test Wallet"}
    </button>
  );
}