"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PDFUpload } from "@/components/pdf-upload"
import { WalletConnector } from "@/components/wallet-connector"
import { useWallet } from "@/hooks/use-wallet"
import { ArrowLeft, Wheat, Shield, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

interface ParsedReceipt {
  amount: number
  currency: string
  date: string
  vendor: string
  isValid: boolean
  validationErrors: string[]
}

export default function UploadPage() {
  const { isConnected, walletType, connectWallet } = useWallet()
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null)

  const handleWalletConnect = async (selectedWalletType: "hashpack" | "metamask") => {
    try {
      await connectWallet(selectedWalletType)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleReceiptParsed = (receipt: ParsedReceipt) => {
    setParsedReceipt(receipt)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
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
                  <p className="text-sm text-muted-foreground">Upload Receipt</p>
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Step 1 of 3
            </Badge>
            <h1 className="text-3xl font-bold mb-4">Upload Your Payment Receipt</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload a PDF receipt from your agricultural purchase within the last 24 hours. We'll validate and extract
              the payment details for tokenization.
            </p>
          </div>

          {!isConnected && (
            <Card className="mb-8 border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Shield className="h-8 w-8 text-amber-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900">Wallet Required</h3>
                    <p className="text-sm text-amber-700">Connect your wallet to proceed with receipt tokenization</p>
                  </div>
                  <WalletConnector
                    onWalletConnect={handleWalletConnect}
                    isConnected={isConnected}
                    connectedWallet={walletType || undefined}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <PDFUpload onReceiptParsed={handleReceiptParsed} />
            </div>

            {/* Requirements Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Receipt Requirements</CardTitle>
                  <CardDescription>Ensure your receipt meets these criteria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Recent Payment</p>
                      <p className="text-sm text-muted-foreground">Receipt must be from within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Clear Amount</p>
                      <p className="text-sm text-muted-foreground">Payment amount must be clearly visible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Authentic Receipt</p>
                      <p className="text-sm text-muted-foreground">Must be a genuine payment receipt</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supported Currencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["USD", "EUR", "GBP", "CAD", "AUD"].map((currency) => (
                      <Badge key={currency} variant="outline">
                        {currency}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {parsedReceipt?.isValid && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-900">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-700 mb-4">
                      Your receipt has been validated successfully. You can now proceed to create a token.
                    </p>
                    <Button className="w-full" asChild>
                      <Link href="/tokenize">Continue to Tokenization</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
