import { create } from "zustand";
import { Connection, PublicKey } from "@solana/web3.js";

interface DriftStore {
  connection: Connection;
  selectedAuthority: PublicKey | null;
  setSelectedAuthority: (authority: PublicKey | null) => void;
}

export const useDriftStore = create<DriftStore>((set) => ({
  connection: new Connection(
    process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com"
  ),
  selectedAuthority: null,
  setSelectedAuthority: (authority) => set({ selectedAuthority: authority }),
}));