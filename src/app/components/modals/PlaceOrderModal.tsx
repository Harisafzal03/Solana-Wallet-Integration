"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function PlaceOrderModal({
  isOpen,
  onClose,
  subAccountId
}: {
  isOpen: boolean;
  onClose: () => void;
  subAccountId: number;
}) {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [marketIndex, setMarketIndex] = useState(0);
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  
  // Example markets
  const markets = [
    { name: "BTC-PERP", index: 0 },
    { name: "ETH-PERP", index: 1 },
    { name: "SOL-PERP", index: 2 },
  ];

  const handleSubmit = async () => {
    if (!wallet.connected || !wallet.signTransaction) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call server API to prepare transaction
      const response = await fetch("/api/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subAccountId,
          orderType,
          direction,
          marketIndex,
          size: parseFloat(size),
          price: orderType === "limit" ? parseFloat(price) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      // For now, just simulate success
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        alert(`${direction === "long" ? "Buy" : "Sell"} ${size} ${markets[marketIndex].name} order placed successfully!`);
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || "Failed to place order");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full">
        <h3 className="text-xl font-bold mb-4">Place Order on Subaccount {subAccountId}</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Market</label>
          <select
            value={marketIndex}
            onChange={(e) => setMarketIndex(Number(e.target.value))}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {markets.map((market) => (
              <option key={market.index} value={market.index}>
                {market.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Order Type</label>
          <div className="flex">
            <button
              className={`flex-1 p-2 border ${
                orderType === "market" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-700"
              }`}
              onClick={() => setOrderType("market")}
            >
              Market
            </button>
            <button
              className={`flex-1 p-2 border ${
                orderType === "limit" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-700"
              }`}
              onClick={() => setOrderType("limit")}
            >
              Limit
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Direction</label>
          <div className="flex">
            <button
              className={`flex-1 p-2 border ${
                direction === "long" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-700"
              }`}
              onClick={() => setDirection("long")}
            >
              Long
            </button>
            <button
              className={`flex-1 p-2 border ${
                direction === "short" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-700"
              }`}
              onClick={() => setDirection("short")}
            >
              Short
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Size</label>
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="0.00"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        {orderType === "limit" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        )}
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !size || parseFloat(size) <= 0 || (orderType === "limit" && (!price || parseFloat(price) <= 0))}
            className={`p-2 ${direction === "long" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white rounded disabled:opacity-50 ${
              isLoading ? "animate-pulse" : ""
            }`}
          >
            {isLoading ? "Processing..." : `${direction === "long" ? "Buy" : "Sell"} ${orderType === "market" ? "Market" : "Limit"}`}
          </button>
        </div>
      </div>
    </div>
  );
}