"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Loader2, Coins, AlertTriangle, CheckCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { hederaClient } from "@/lib/hedera-client"
import { toast } from "sonner"
import { ethers } from "ethers"
import type { MarketplaceListing } from "@/app/marketplace/page"

interface TokenPurchaseDialogProps {
  listing: MarketplaceListing
  onPurchaseComplete?: () => void
}

export function TokenPurchaseDialog({ listing, onPurchaseComplete }: TokenPurchaseDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tokenAmount, setTokenAmount] = useState("")
  const [isPurchasing, setIsPurchasing] = useState(false)
  const { walletType, address, balance, walletData, refreshBalance } = useWallet()

  // Calculate purchase details
  const calculatePurchaseDetails = () => {
    const amount = parseFloat(tokenAmount) || 0
    const tokenPrice = listing.price
    const totalTokens = listing.token.supply / 100 // Convert to actual token count
    const pricePerToken = tokenPrice / totalTokens
    const totalCost = amount * pricePerToken
    const hbarCost = totalCost * 0.1 // Assuming 1 USD = 0.1 HBAR (mock conversion)
    
    return {
      amount,
      pricePerToken,
      totalCost,
      hbarCost,
      totalTokens,
    }
  }

  const purchaseDetails = calculatePurchaseDetails()

  // Check if wallet has sufficient HBAR balance
  const checkBalance = (): boolean => {
    if (!balance) return false
    const balanceNumber = parseFloat(balance.replace(' HBAR', ''))
    return balanceNumber >= purchaseDetails.hbarCost
  }

  // Deduct HBAR from wallet
  const deductHBAR = async (amount: number): Promise<boolean> => {
    try {
      if (walletType === "metamask" && walletData) {
        const provider = walletData[1]
        const signer = await provider.getSigner()
        
        // Convert HBAR to wei (assuming 1 HBAR = 10^18 wei)
        const amountInWei = ethers.parseEther(amount.toString())
        
        // Send transaction to deduct HBAR
        const tx = await signer.sendTransaction({
          to: "0x0000000000000000000000000000000000000000", // Burn address
          value: amountInWei,
          gasLimit: 21000,
        })
        
        await tx.wait()
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to deduct HBAR:", error)
      return false
    }
  }

  // Purchase tokens
  const handlePurchase = async () => {
    if (!tokenAmount || purchaseDetails.amount <= 0) {
      toast.error("Please enter a valid token amount")
      return
    }

    if (!checkBalance()) {
      toast.error(`Insufficient HBAR balance. You need ${purchaseDetails.hbarCost.toFixed(4)} HBAR`)
      return
    }

    setIsPurchasing(true)
    
    try {
      // Deduct HBAR for purchase
      toast.loading(`Deducting ${purchaseDetails.hbarCost.toFixed(4)} HBAR for token purchase...`)
      const deductionSuccess = await deductHBAR(purchaseDetails.hbarCost)
      
      if (!deductionSuccess) {
        toast.error("Failed to deduct HBAR for purchase")
        return
      }

      // Simulate token transfer (in real implementation, this would transfer tokens)
      toast.loading("Transferring tokens to your wallet...")
      await hederaClient.purchaseTokens(listing.token.tokenId, address!, purchaseDetails.amount)

      // Refresh wallet balance
      await refreshBalance()
      
      toast.success(`Successfully purchased ${purchaseDetails.amount} tokens!`)
      
      // Close dialog and reset form
      setIsOpen(false)
      setTokenAmount("")
      
      // Notify parent component
      if (onPurchaseComplete) {
        onPurchaseComplete()
      }
      
    } catch (error) {
      console.error("Token purchase failed:", error)
      toast.error("Failed to purchase tokens. Please try again.")
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full gap-2" 
          disabled={listing.status !== "active" || !address}
        >
          <ShoppingCart className="h-4 w-4" />
          {listing.status === "active" ? "Buy Token" : "Sold"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Purchase {listing.token.name}
          </DialogTitle>
          <DialogDescription>
            Buy tokens from this agricultural receipt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Token Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{listing.token.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline">{listing.token.symbol}</Badge>
                <span>Total Supply: {(listing.token.supply / 100).toFixed(2)} tokens</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Original Value</Label>
                  <div className="font-semibold">
                    {listing.token.receiptData.currency} {listing.token.receiptData.amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Price</Label>
                  <div className="font-semibold">${listing.price.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vendor</Label>
                  <div className="font-semibold">{listing.token.receiptData.vendor}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Receipt Date</Label>
                  <div className="font-semibold">
                    {new Date(listing.token.receiptData.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="tokenAmount">Token Amount</Label>
              <Input
                id="tokenAmount"
                type="number"
                placeholder="Enter number of tokens to buy"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                min="0.01"
                step="0.01"
                max={purchaseDetails.totalTokens}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {(listing.token.supply / 100).toFixed(2)} tokens
              </p>
            </div>

            {/* Purchase Summary */}
            {tokenAmount && purchaseDetails.amount > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Purchase Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Token Amount:</span>
                      <span className="font-semibold">{purchaseDetails.amount} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Price per Token:</span>
                      <span className="font-semibold">${purchaseDetails.pricePerToken.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Total Cost:</span>
                      <span className="font-semibold">${purchaseDetails.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-300 pt-2">
                      <span className="text-blue-900 font-semibold">HBAR Required:</span>
                      <span className="font-bold text-blue-900">{purchaseDetails.hbarCost.toFixed(4)} HBAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Your Balance:</span>
                      <span className="font-semibold">{balance || "0 HBAR"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Balance Validation */}
            {tokenAmount && purchaseDetails.amount > 0 && !checkBalance() && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient HBAR balance. You need {purchaseDetails.hbarCost.toFixed(4)} HBAR to complete this purchase.
                </AlertDescription>
              </Alert>
            )}

            {/* Purchase Button */}
            <Button 
              className="w-full gap-2" 
              onClick={handlePurchase}
              disabled={!tokenAmount || purchaseDetails.amount <= 0 || !checkBalance() || isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Purchase...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Purchase Tokens
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
