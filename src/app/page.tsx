"use client";

import WalletInput from "./components/WalletInput";
import SubaccountsList from "./components/SubaccountsList";
import DriftData from "./components/DriftData";
import MockWalletButton from "./components/MockWalletButton";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-100 dark:bg-gray-900">
      <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-400">
            Drift Subaccounts Viewer
          </h1>
          <div className="flex space-x-2">
            <MockWalletButton />
            <WalletMultiButton />
          </div>
        </div>

        <WalletInput />
        <SubaccountsList />

        <div className="my-8">
          <DriftData />
        </div>
      </div>
    </main>
  );
}