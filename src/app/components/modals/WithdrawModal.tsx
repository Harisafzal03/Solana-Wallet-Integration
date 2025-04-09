"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function WithdrawModal({ 
  isOpen, 
  onClose, 
  subAccountId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  subAccountId: number;
}) {
  const wallet = useWallet();
  const [amount, setAmount] = useState("");
  const [tokenIndex, setTokenIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokens = [
    { name: "USDC", index: 0 },
    { name: "SOL", index: 1 },
    { name: "BTC", index: 2 },
    { name: "ETH", index: 3 },
    // Add more tokens as needed
  ];

  const handleWithdraw = async () => {
    if (!wallet.connected || !wallet.signTransaction) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call server API to prepare transaction
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          tokenIndex,
          subAccountId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to withdraw");
      }

      // For now, just simulate success
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        alert(`Withdrawal of ${amount} from subaccount ${subAccountId} simulated successfully!`);
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || "Failed to withdraw");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full">
        <h3 className="text-xl font-bold mb-4">Withdraw from Subaccount {subAccountId}</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Token</label>
          <select
            value={tokenIndex}
            onChange={(e) => setTokenIndex(Number(e.target.value))}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {tokens.map((token) => (
              <option key={token.index} value={token.index}>
                {token.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className={`p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 ${
              isLoading ? "animate-pulse" : ""
            }`}
          >
            {isLoading ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}