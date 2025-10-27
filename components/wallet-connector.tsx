"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Shield, Zap, RefreshCw, LogOut } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

interface WalletConnectorProps {
  onWalletConnect: (walletType: "hashpack" | "metamask") => void
  isConnected: boolean
  connectedWallet?: string
}

export function WalletConnector({ onWalletConnect, isConnected, connectedWallet }: WalletConnectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { walletType, balance, address, connectWallet, refreshBalance, disconnectWallet, isInitialized } = useWallet()

  const handleWalletSelect = async (walletType: "hashpack" | "metamask") => {
    await connectWallet(walletType)
    onWalletConnect(walletType)
    setIsOpen(false)
  }

  const handleDisconnect = () => {
    disconnectWallet()
    onWalletConnect("hashpack") // Reset parent state
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Wallet className="h-4 w-4" />
        Loading...
      </Button>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium">{connectedWallet}</div>
          <div className="text-xs text-muted-foreground">
            {address && address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address}
          </div>
          <div className="text-xs text-green-600 font-medium">{balance}</div>
        </div>
        <div className="flex gap-2">
          {walletType === "metamask" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshBalance}
              className="p-2"
              title="Refresh Balance"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnect}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Disconnect Wallet"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Wallet className="h-4 w-4" />
            Connected
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to start tokenizing payment receipts on Hedera network.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => handleWalletSelect("hashpack")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                HashPack Wallet
              </CardTitle>
              <CardDescription>Native Hedera wallet with full HTS token support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Recommended for Hedera tokens
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => handleWalletSelect("metamask")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wallet className="h-5 w-5 text-orange-600" />
                </div>
                MetaMask
              </CardTitle>
              <CardDescription>Popular Ethereum wallet with Hedera support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Widely supported
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
