"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Coins, Loader2, CheckCircle, ExternalLink, Copy } from "lucide-react"
import { hederaClient, type TokenMetadata, type CreatedToken } from "@/lib/hedera-client"

interface TokenCreatorProps {
  receiptData: {
    amount: number
    currency: string
    date: string
    vendor: string
  }
  hbarValue: number
  walletAddress: string
}

export function TokenCreator({ receiptData, hbarValue, walletAddress }: TokenCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [tokenName, setTokenName] = useState(`${receiptData.vendor} Receipt Token`)
  const [tokenSymbol, setTokenSymbol] = useState("ART")

  const handleCreateToken = async () => {
    setIsCreating(true)
    setError(null)
    setProgress(0)

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 500)

      const receiptHash = `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const tokenMetadata: TokenMetadata = {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: 4, // Updated to 4 decimals to match HBAR precision
        initialSupply: Math.floor(hbarValue * 10000), // Convert HBAR to smallest unit (4 decimals)
        treasuryAccountId: walletAddress,
        receiptData: {
          ...receiptData,
          receiptHash,
        },
      }

      const token = await hederaClient.createToken(tokenMetadata)

      clearInterval(progressInterval)
      setProgress(100)
      setCreatedToken(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token")
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (createdToken) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="h-5 w-5" />
            Token Created Successfully!
          </CardTitle>
          <CardDescription className="text-green-700">
            Your receipt has been tokenized on the Hedera network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Token ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-background px-2 py-1 rounded border">{createdToken.tokenId}</code>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(createdToken.tokenId)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Transaction ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-background px-2 py-1 rounded border">{createdToken.transactionId}</code>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(createdToken.transactionId)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Token Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{createdToken.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Symbol:</span>
                <span className="ml-2 font-medium">{createdToken.symbol}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Supply:</span>
                <span className="ml-2 font-medium">{(createdToken.supply / 10000).toFixed(4)} tokens</span>
              </div>
              <div>
                <span className="text-muted-foreground">Treasury:</span>
                <span className="ml-2 font-medium">{createdToken.treasuryAccount}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Receipt Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className="ml-2 font-medium">
                  {createdToken.receiptData.currency} {createdToken.receiptData.amount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2 font-medium">{new Date(createdToken.receiptData.date).toLocaleDateString()}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Vendor:</span>
                <span className="ml-2 font-medium">{createdToken.receiptData.vendor}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="flex-1" asChild>
              <a href="/marketplace" className="gap-2">
                List on Marketplace
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" asChild>
              <a href="/dashboard" className="gap-2">
                View Dashboard
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Create Hedera Token
        </CardTitle>
        <CardDescription>Generate an HTS token representing your payment receipt</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                id="tokenName"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="Receipt Token Name"
              />
            </div>
            <div>
              <Label htmlFor="tokenSymbol">Token Symbol</Label>
              <Input
                id="tokenSymbol"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                placeholder="ART"
                maxLength={5}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Token Value Calculation</h4>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Receipt Amount:</span>
                <span className="font-medium">
                  {receiptData.currency} {receiptData.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>HBAR Equivalent:</span>
                <span className="font-medium">{hbarValue.toFixed(4)} HBAR</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Token Supply:</span>
                <span>
                  {hbarValue.toFixed(4)} {tokenSymbol}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Token value is calculated as: Payment Amount (USD) ÷ Current HBAR Price
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Receipt Details</h4>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Vendor:</span>
                <span className="font-medium">{receiptData.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">{new Date(receiptData.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Treasury Account:</span>
                <span className="font-medium font-mono text-xs">{walletAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isCreating && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Creating token on Hedera network...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">This may take a few moments to complete</div>
          </div>
        )}

        <Button
          onClick={handleCreateToken}
          disabled={isCreating || !tokenName || !tokenSymbol}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Token...
            </>
          ) : (
            <>
              <Coins className="h-4 w-4 mr-2" />
              Create Token on Hedera
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          <Badge variant="outline" className="mr-2">
            Testnet
          </Badge>
          Token will be created on Hedera testnet
        </div>
      </CardContent>
    </Card>
  )
}
