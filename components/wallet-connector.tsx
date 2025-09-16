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
import { Wallet, Shield, Zap } from "lucide-react"

interface WalletConnectorProps {
  onWalletConnect: (walletType: "hashpack" | "metamask") => void
  isConnected: boolean
  connectedWallet?: string
}

export function WalletConnector({ onWalletConnect, isConnected, connectedWallet }: WalletConnectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleWalletSelect = (walletType: "hashpack" | "metamask") => {
    onWalletConnect(walletType)
    setIsOpen(false)
  }

  if (isConnected) {
    return (
      <Button variant="outline" className="gap-2 bg-transparent">
        <Wallet className="h-4 w-4" />
        Connected: {connectedWallet}
      </Button>
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
