"use client";

import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDriftStore } from "../store/driftStore";

export default function WalletInput() {
  const wallet = useWallet();
  const { selectedAuthority, setSelectedAuthority } = useDriftStore();
  const [inputAddress, setInputAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      setSelectedAuthority(wallet.publicKey);
      setInputAddress(wallet.publicKey.toBase58());
    }
  }, [wallet.connected, wallet.publicKey, setSelectedAuthority]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(e.target.value);
    setError(null);
  };

  const handleSubmit = () => {
    try {
      const pubkey = new PublicKey(inputAddress);
      setSelectedAuthority(pubkey);
    } catch (err) {
      setError("Invalid public key");
      console.error("Invalid public key:", err);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 dark:text-gray-300 mb-2">
        View Wallet Subaccounts:
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputAddress}
          onChange={handleInputChange}
          placeholder="Enter wallet address"
          className="p-2 border rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <button
          onClick={handleSubmit}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}