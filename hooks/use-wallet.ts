"use client"

import { useState, useCallback } from "react"

export interface WalletState {
  isConnected: boolean
  walletType: "hashpack" | "metamask" | null
  address: string | null
  balance: string | null
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    walletType: null,
    address: null,
    balance: null,
  })

  const connectWallet = useCallback(async (walletType: "hashpack" | "metamask") => {
    try {
      if (walletType === "hashpack") {
        // HashPack wallet connection logic
        if (typeof window !== "undefined" && (window as any).hashconnect) {
          // Simulate HashPack connection
          setWalletState({
            isConnected: true,
            walletType: "hashpack",
            address: "0.0.123456",
            balance: "1000 HBAR",
          })
        } else {
          throw new Error("HashPack wallet not found. Please install HashPack extension.")
        }
      } else if (walletType === "metamask") {
        // MetaMask wallet connection logic
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          })
          setWalletState({
            isConnected: true,
            walletType: "metamask",
            address: accounts[0],
            balance: "0.5 ETH",
          })
        } else {
          throw new Error("MetaMask not found. Please install MetaMask extension.")
        }
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      walletType: null,
      address: null,
      balance: null,
    })
  }, [])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
  }
}
