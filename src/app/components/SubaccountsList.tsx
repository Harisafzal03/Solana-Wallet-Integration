"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDriftStore } from "../store/driftStore";
import { PublicKey } from "@solana/web3.js";
import DepositModal from "./modals/DepositModal";
import WithdrawModal from "./modals/WithdrawModal";
import PlaceOrderModal from "./modals/PlaceOrderModal";
import CreateSubaccountButton from "./CreateSubaccountButton";

// Define types without importing from the drift SDK
type SpotPosition = {
  marketIndex: number;
  scaledBalance: number;
};

type PerpPosition = {
  marketIndex: number;
  baseAssetAmount: {
    toNumber: () => number;
  };
};

type Order = {
  marketIndex: number;
  slot: number;
  direction: number;
  baseAssetAmount: {
    toNumber: () => number;
  };
};

type UserAccount = {
  subAccountId: number;
  spotPositions: SpotPosition[];
  perpPositions: PerpPosition[];
  orders: Order[];
};

export default function SubaccountsList() {
  const wallet = useWallet();
  const { selectedAuthority } = useDriftStore();
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    const fetchSubaccounts = async () => {
      if (!selectedAuthority) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/subaccounts?authority=${selectedAuthority.toBase58()}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setUserAccounts(data.userAccounts || []);
      } catch (err: any) {
        console.error("Error fetching subaccounts:", err);
        setError(err.message || "Failed to fetch subaccounts");
      } finally {
        setLoading(false);
      }
    };

    fetchSubaccounts();
  }, [selectedAuthority]);

  const isOwnAccount =
    wallet.publicKey && selectedAuthority && wallet.publicKey.equals(selectedAuthority);
    
  // Market names mapping (for better display)
  const getSpotMarketName = (marketIndex: number) => {
    const markets: Record<number, string> = {
      0: "USDC",
      1: "SOL",
      2: "BTC",
      3: "ETH",
      // Add more as needed
    };
    return markets[marketIndex] || `Spot#${marketIndex}`;
  };
  
  const getPerpMarketName = (marketIndex: number) => {
    const markets: Record<number, string> = {
      0: "BTC-PERP",
      1: "ETH-PERP",
      2: "SOL-PERP",
      // Add more as needed
    };
    return markets[marketIndex] || `Perp#${marketIndex}`;
  };

  if (loading) return <p className="text-gray-600 dark:text-gray-400">Loading subaccounts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  
  return (
    <div>
      {/* Account info section */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {isOwnAccount 
              ? "Your Connected Wallet" 
              : selectedAuthority
                ? "Viewing Wallet" 
                : "Enter a wallet address above"}
          </h2>
          
          {isOwnAccount && <CreateSubaccountButton />}
        </div>
        
        {selectedAuthority && (
          <div className="mt-2">
            <p className="text-gray-600 dark:text-gray-300">
              Address: <span className="font-mono">{selectedAuthority.toBase58()}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Total Subaccounts: {userAccounts.length}
            </p>
          </div>
        )}
      </div>

      {!selectedAuthority && (
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
          <p className="text-blue-700 dark:text-blue-200">
            Enter a wallet address above or connect your wallet to view subaccounts.
          </p>
        </div>
      )}
      
      {selectedAuthority && userAccounts.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
          <p className="text-yellow-700 dark:text-yellow-200">
            No subaccounts found for this wallet. 
            {isOwnAccount && " Click 'Create Subaccount' to get started."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userAccounts.map((account) => (
          <div
            key={account.subAccountId}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <h3 className="text-lg font-bold text-blue-500">
              Subaccount {account.subAccountId}
            </h3>

            {/* Balances */}
            <div className="mt-2">
              <h4 className="font-semibold">Balances:</h4>
              {account.spotPositions
                .filter((pos) => pos.scaledBalance > 0)
                .length > 0 ? (
                <ul className="list-disc pl-5">
                  {account.spotPositions
                    .filter((pos) => pos.scaledBalance > 0)
                    .map((pos, idx) => (
                      <li key={idx}>
                        {getSpotMarketName(pos.marketIndex)}: {(pos.scaledBalance / 1e9).toFixed(4)}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No balances found</p>
              )}
            </div>

            {/* Perp Positions */}
            <div className="mt-2">
              <h4 className="font-semibold">Perp Positions:</h4>
              {account.perpPositions
                .filter((pos) => pos.baseAssetAmount.toNumber() !== 0)
                .length > 0 ? (
                <ul className="list-disc pl-5">
                  {account.perpPositions
                    .filter((pos) => pos.baseAssetAmount.toNumber() !== 0)
                    .map((pos, idx) => (
                      <li key={idx}>
                        {getPerpMarketName(pos.marketIndex)}: {(pos.baseAssetAmount.toNumber() / 1e9).toFixed(4)}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No positions found</p>
              )}
            </div>

            {/* Open Orders */}
            <div className="mt-2">
              <h4 className="font-semibold">Open Orders:</h4>
              {account.orders
                .filter((order) => order.slot > 0)
                .length > 0 ? (
                <ul className="list-disc pl-5">
                  {account.orders
                    .filter((order) => order.slot > 0)
                    .map((order, idx) => (
                      <li key={idx} className={order.direction === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {getPerpMarketName(order.marketIndex)} - {order.direction === 0 ? "Long" : "Short"}{" "}
                        {(order.baseAssetAmount.toNumber() / 1e9).toFixed(4)}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No open orders</p>
              )}
            </div>

            {/* Actions (only for connected wallet) */}
            {isOwnAccount && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedAccount(account.subAccountId);
                    setShowDepositModal(true);
                  }}
                  className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Deposit
                </button>
                <button
                  onClick={() => {
                    setSelectedAccount(account.subAccountId);
                    setShowWithdrawModal(true);
                  }}
                  className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Withdraw
                </button>
                <button
                  onClick={() => {
                    setSelectedAccount(account.subAccountId);
                    setShowOrderModal(true);
                  }}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Place Perp Order
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedAccount !== null && (
        <>
          <DepositModal
            isOpen={showDepositModal}
            onClose={() => setShowDepositModal(false)}
            subAccountId={selectedAccount}
          />
          
          <WithdrawModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            subAccountId={selectedAccount}
          />
          
          <PlaceOrderModal
            isOpen={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            subAccountId={selectedAccount}
          />
        </>
      )}
    </div>
  );
}