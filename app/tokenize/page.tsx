"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TokenCreator } from "@/components/token-creator"
import { CurrencyDisplay } from "@/components/currency-display"
import { WalletConnector } from "@/components/wallet-connector"
import { useWallet } from "@/hooks/use-wallet"
import { ArrowLeft, Wheat, AlertTriangle } from "lucide-react"
import Link from "next/link"
import type { ConversionResult } from "@/lib/currency-converter"

export default function TokenizePage() {
  const { isConnected, walletType, address, connectWallet } = useWallet()
  const [receiptData, setReceiptData] = useState<any>(null)
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null)

  useEffect(() => {
    // In real app, this would come from the previous step or URL params
    // For demo, we'll use mock data
    const mockReceiptData = {
      amount: 2500,
      currency: "USD",
      date: new Date().toISOString(),
      vendor: "Farm Supply Co.",
    }

    setReceiptData(mockReceiptData)
  }, [])

  const handleWalletConnect = async (selectedWalletType: "hashpack" | "metamask") => {
    try {
      await connectWallet(selectedWalletType)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleConversionUpdate = (result: ConversionResult) => {
    setConversionResult(result)
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Receipt Data Found</h2>
          <p className="text-muted-foreground mb-6">Please upload a receipt first to proceed with tokenization.</p>
          <Button asChild>
            <Link href="/upload">Upload Receipt</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/upload">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wheat className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">AgriToken</h1>
                  <p className="text-sm text-muted-foreground">Create Token</p>
                </div>
              </div>
            </div>
            <WalletConnector
              onWalletConnect={handleWalletConnect}
              isConnected={isConnected}
              connectedWallet={walletType || undefined}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Step 2 of 3
            </Badge>
            <h1 className="text-3xl font-bold mb-4">Create Your Token</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your receipt has been validated. Review the currency conversion and create your Hedera token.
            </p>
          </div>

          {!isConnected && (
            <Alert className="mb-8 border-amber-200 bg-amber-50/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Connect your wallet to create tokens on Hedera network</span>
                <WalletConnector
                  onWalletConnect={handleWalletConnect}
                  isConnected={isConnected}
                  connectedWallet={walletType || undefined}
                />
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Currency Conversion */}
            <div>
              <CurrencyDisplay
                amount={receiptData.amount}
                currency={receiptData.currency}
                onConversionUpdate={handleConversionUpdate}
              />
            </div>

            {/* Token Creation */}
            <div>
              {isConnected && address && conversionResult ? (
                <TokenCreator
                  receiptData={receiptData}
                  hbarValue={conversionResult.hbarAmount}
                  walletAddress={address}
                />
              ) : (
                <Card className="opacity-50">
                  <CardHeader>
                    <CardTitle>Create Hedera Token</CardTitle>
                    <CardDescription>
                      {!isConnected
                        ? "Connect your wallet to proceed with token creation"
                        : "Waiting for currency conversion..."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      {!isConnected ? "Wallet connection required" : "Loading conversion rates..."}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Receipt Summary */}
          {conversionResult && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
                <CardDescription>Review the details before creating your token</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-muted-foreground">
                      {receiptData.currency} {receiptData.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Original Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${conversionResult.usdAmount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">USD Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{conversionResult.hbarAmount.toFixed(4)}</div>
                    <div className="text-sm text-muted-foreground">HBAR Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{conversionResult.tokenAmount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Token Supply</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
