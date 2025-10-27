"use client"

import { useState, useCallback, useEffect } from "react"
import walletConnectFcn from "./wallet-func"
import { ethers } from "ethers"

// Session storage keys
const WALLET_SESSION_KEY = "wallet_session"
const WALLET_EXPIRY_KEY = "wallet_expiry"

export interface WalletState {
  isConnected: boolean
  walletType: "hashpack" | "metamask" | null
  address: string | null
  balance: string | null
}

// Session management functions
const saveWalletSession = (walletState: WalletState, account: string, network: string) => {
  if (typeof window !== "undefined") {
    const sessionData = {
      walletState,
      account,
      network,
      timestamp: Date.now()
    }
    localStorage.setItem(WALLET_SESSION_KEY, JSON.stringify(sessionData))
    localStorage.setItem(WALLET_EXPIRY_KEY, (Date.now() + 24 * 60 * 60 * 1000).toString()) // 24 hours
  }
}

const loadWalletSession = () => {
  if (typeof window !== "undefined") {
    const expiry = localStorage.getItem(WALLET_EXPIRY_KEY)
    if (expiry && Date.now() < parseInt(expiry)) {
      const sessionData = localStorage.getItem(WALLET_SESSION_KEY)
      if (sessionData) {
        return JSON.parse(sessionData)
      }
    } else {
      // Clear expired session
      localStorage.removeItem(WALLET_SESSION_KEY)
      localStorage.removeItem(WALLET_EXPIRY_KEY)
    }
  }
  return null
}

const clearWalletSession = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(WALLET_SESSION_KEY)
    localStorage.removeItem(WALLET_EXPIRY_KEY)
  }
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    walletType: null,
    address: null,
    balance: null,
  })
  const [account, setAccount] = useState<string | null>(null)
  const [network, setNetwork] = useState<string>("testnet")
  const [walletData, setWalletData] = useState<any | null>(null)
  const [connectText, setConnectText] = useState<string>("")
  const [connectLink, setConnectLink] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize wallet from session on mount
  useEffect(() => {
    const initializeWallet = async () => {
      const sessionData = loadWalletSession()
      if (sessionData) {
        setWalletState(sessionData.walletState)
        setAccount(sessionData.account)
        setNetwork(sessionData.network)
        setConnectText(`🔌 Account ${sessionData.account} connected ⚡ ✅`)
        setConnectLink(`https://hashscan.io/${sessionData.network}/account/${sessionData.account}`)
        
        // Refresh balance for MetaMask wallets
        if (sessionData.walletState.walletType === "metamask" && sessionData.walletState.address) {
          try {
            if (typeof window !== "undefined" && (window as any).ethereum) {
              const provider = new ethers.BrowserProvider((window as any).ethereum, "any")
              const balance = await getWalletBalance(provider, sessionData.walletState.address)
              setWalletState(prev => ({
                ...prev,
                balance: balance,
              }))
            }
          } catch (error) {
            console.error("Failed to refresh balance on initialization:", error)
          }
        }
      }
      setIsInitialized(true)
    }
    
    initializeWallet()
  }, [])

  // Get wallet balance
  const getWalletBalance = useCallback(async (provider: any, address: string) => {
    try {
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      return `${parseFloat(balanceInEth).toFixed(4)} HBAR`;
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0 HBAR";
    }
  }, []);

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
          setConnectText(`🔌 HashPack wallet connected ⚡ ✅`);
        } else {
          throw new Error("HashPack wallet not found. Please install HashPack extension.")
        }
      } else if (walletType === "metamask") {
        // MetaMask wallet connection logic
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const wData = await walletConnectFcn(network);
          const provider = wData[1];
          const newAccount = wData[0];

          if (newAccount !== undefined) {
            const accountAddress = String(newAccount);
            // Get the wallet balance
            const balance = await getWalletBalance(provider, accountAddress);
            
            setWalletState({
              isConnected: true,
              walletType: "metamask",
              address: accountAddress,
              balance: balance,
            });
            
            setConnectText(`🔌 Account ${accountAddress} connected ⚡ ✅`);
            setConnectLink(`https://hashscan.io/${network}/account/${accountAddress}`);
            setWalletData(wData);
            setAccount(accountAddress);
            
            // Save session
            saveWalletSession({
              isConnected: true,
              walletType: "metamask",
              address: accountAddress,
              balance: balance,
            }, accountAddress, network);
          }
        } else {
          throw new Error("MetaMask not found. Please install MetaMask extension.")
        }
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    }
  }, [network, getWalletBalance])

  // Refresh wallet balance
  const refreshBalance = useCallback(async () => {
    if (walletState.isConnected && walletState.walletType === "metamask" && walletData) {
      try {
        const provider = walletData[1];
        const address = walletState.address;
        if (address) {
          const balance = await getWalletBalance(provider, address);
          setWalletState(prev => ({
            ...prev,
            balance: balance,
          }));
        }
      } catch (error) {
        console.error("Failed to refresh balance:", error);
      }
    }
  }, [walletState.isConnected, walletState.walletType, walletState.address, walletData, getWalletBalance])

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      walletType: null,
      address: null,
      balance: null,
    })
    // Reset all state
    setAccount(null)
    setWalletData(null)
    setConnectText("")
    setConnectLink("")
    
    // Clear session
    clearWalletSession()
  }, [])

  return {
    ...walletState,
    // Connection state
    account,
    network,
    walletData,
    // UI text states
    connectText,
    connectLink,
    // Loading state
    isInitialized,
    // Functions
    connectWallet,
    disconnectWallet,
    refreshBalance,
  }
}