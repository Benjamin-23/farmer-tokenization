"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletConnector } from "@/components/wallet-connector"
import { useWallet } from "@/hooks/use-wallet"
import { hederaClient, type CreatedToken } from "@/lib/hedera-client"
import {
  Wheat,
  Plus,
  TrendingUp,
  Coins,
  FileText,
  Calendar,
  DollarSign,
  ExternalLink,
  Copy,
  AlertTriangle,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { isConnected, walletType, address, connectWallet } = useWallet()
  const [tokens, setTokens] = useState<CreatedToken[]>([])
  const [purchasedTokens, setPurchasedTokens] = useState<{ tokenId: string; amount: number; token: CreatedToken }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTokens: 0,
    totalValue: 0,
    totalReceipts: 0,
    avgTokenValue: 0,
  })

  useEffect(() => {
    if (isConnected) {
      loadDashboardData()
    }
  }, [isConnected])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load user's created tokens
      const allTokens = hederaClient.getAllTokens()
      setTokens(allTokens)

      // Load user's purchased tokens
      if (address) {
        const purchased = hederaClient.getUserTokens(address)
        setPurchasedTokens(purchased)
      }

      // Calculate stats
      const totalTokens = allTokens.length
      const totalValue = allTokens.reduce((sum, token) => sum + token.receiptData.amount, 0)
      const avgTokenValue = totalTokens > 0 ? totalValue / totalTokens : 0

      setStats({
        totalTokens,
        totalValue,
        totalReceipts: totalTokens,
        avgTokenValue,
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async (selectedWalletType: "hashpack" | "metamask") => {
    try {
      await connectWallet(selectedWalletType)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wheat className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">AgriToken</h1>
                  <p className="text-sm text-muted-foreground">Farmer Dashboard</p>
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

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
              <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-amber-900 mb-2">Wallet Required</h2>
              <p className="text-amber-700 mb-4">
                Connect your wallet to access your farmer dashboard and view your tokens.
              </p>
              <WalletConnector
                onWalletConnect={handleWalletConnect}
                isConnected={isConnected}
                connectedWallet={walletType || undefined}
              />
            </div>
          </div>
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wheat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AgriToken</h1>
                <p className="text-sm text-muted-foreground">Farmer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">
                  Marketplace
                </Link>
              </nav>
              <WalletConnector
                onWalletConnect={handleWalletConnect}
                isConnected={isConnected}
                connectedWallet={walletType || undefined}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, Farmer!</h1>
                <p className="text-muted-foreground">
                  Manage your tokenized receipts and track your agricultural finance portfolio
                </p>
              </div>
              <Button className="gap-2" asChild>
                <Link href="/upload">
                  <Plus className="h-4 w-4" />
                  Upload Receipt
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Coins className="h-4 w-4 text-primary" />
                  Total Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTokens}</div>
                <p className="text-xs text-muted-foreground">Active tokens created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Combined receipt value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Receipts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReceipts}</div>
                <p className="text-xs text-muted-foreground">Receipts tokenized</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  Avg. Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.avgTokenValue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">Per token average</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="tokens" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tokens">My Tokens</TabsTrigger>
              <TabsTrigger value="purchased">Purchased</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="tokens" className="space-y-6">
              {tokens.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tokens Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Upload your first payment receipt to create your first token
                    </p>
                    <Button asChild>
                      <Link href="/upload">Upload Receipt</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {tokens.map((token) => (
                    <Card key={token.tokenId}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Coins className="h-5 w-5 text-primary" />
                              {token.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                              <Badge variant="outline">{token.symbol}</Badge>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(token.createdAt)}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {(token.supply / 100).toFixed(2)} tokens
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {token.receiptData.currency} {token.receiptData.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Token Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Token ID:</span>
                                <div className="flex items-center gap-2">
                                  <code className="text-xs bg-muted px-1 rounded">{token.tokenId}</code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(token.tokenId)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Treasury:</span>
                                <span className="font-mono text-xs">{token.treasuryAccount}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Receipt Info</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Vendor:</span>
                                <span>{token.receiptData.vendor}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span>{formatDate(token.receiptData.date)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <TrendingUp className="h-4 w-4" />
                            List on Marketplace
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <ExternalLink className="h-4 w-4" />
                            View on Hedera
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="purchased" className="space-y-6">
              {purchasedTokens.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Purchased Tokens</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't purchased any tokens yet. Visit the marketplace to buy tokens from other farmers.
                    </p>
                    <Button asChild>
                      <Link href="/marketplace">Browse Marketplace</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {purchasedTokens.map((purchasedToken) => (
                    <Card key={purchasedToken.tokenId}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <ShoppingCart className="h-5 w-5 text-green-600" />
                              {purchasedToken.token.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                              <Badge variant="outline">{purchasedToken.token.symbol}</Badge>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(purchasedToken.token.createdAt)}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {purchasedToken.amount} tokens
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {purchasedToken.token.receiptData.currency} {purchasedToken.token.receiptData.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Token Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Token ID:</span>
                                <span className="font-mono text-xs">{purchasedToken.token.tokenId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Supply:</span>
                                <span>{(purchasedToken.token.supply / 100).toFixed(2)} tokens</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Receipt Info</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Vendor:</span>
                                <span>{purchasedToken.token.receiptData.vendor}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span>{formatDate(purchasedToken.token.receiptData.date)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <TrendingUp className="h-4 w-4" />
                            Sell Tokens
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <ExternalLink className="h-4 w-4" />
                            View on Hedera
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest transactions and token activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {tokens.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No activity yet. Create your first token to see activity here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tokens.slice(0, 5).map((token) => (
                        <div key={token.tokenId} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Coins className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Token Created: {token.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {(token.supply / 100).toFixed(2)} tokens • {formatDate(token.createdAt)}
                            </div>
                          </div>
                          <Badge variant="outline">Success</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Overview</CardTitle>
                    <CardDescription>Your tokenization performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
                        <span className="font-bold">${stats.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active Tokens</span>
                        <span className="font-bold">{stats.totalTokens}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Token Value</span>
                        <span className="font-bold">${stats.avgTokenValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start gap-2" asChild>
                      <Link href="/upload">
                        <Plus className="h-4 w-4" />
                        Upload New Receipt
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" asChild>
                      <Link href="/marketplace">
                        <TrendingUp className="h-4 w-4" />
                        Browse Marketplace
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <BarChart3 className="h-4 w-4" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
