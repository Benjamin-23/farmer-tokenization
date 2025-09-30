"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletConnector } from "@/components/wallet-connector"
import { useWallet } from "@/hooks/use-wallet"
import { hederaClient, type CreatedToken } from "@/lib/hedera-client"
import {
  Wheat,
  Search,
  Filter,
  TrendingUp,
  Coins,
  Calendar,
  DollarSign,
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  Users,
} from "lucide-react"
import Link from "next/link"

interface MarketplaceListing {
  id: string
  token: CreatedToken
  price: number
  currency: string
  seller: string
  listedAt: string
  status: "active" | "sold" | "pending"
  rating: number
  location: string
}

export default function MarketplacePage() {
  const { isConnected, walletType, connectWallet } = useWallet()
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMarketplaceData()
  }, [])

  useEffect(() => {
    filterAndSortListings()
  }, [listings, searchQuery, sortBy, filterBy])

  const loadMarketplaceData = async () => {
    setIsLoading(true)
    try {
      // Get all tokens and create mock marketplace listings
      const allTokens = hederaClient.getAllTokens()

      // Create mock listings with some variety
      const mockListings: MarketplaceListing[] = [
        ...allTokens.map((token, index) => ({
          id: `listing_${token.tokenId}`,
          token,
          price: token.receiptData.amount * (0.8 + Math.random() * 0.4), // 80-120% of original value
          currency: "USD",
          seller: `0.0.${100000 + index}`,
          listedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: (Math.random() > 0.2 ? "active" : "sold") as "active" | "sold" | "pending",
          rating: 4 + Math.random(),
          location: ["Iowa", "Nebraska", "Kansas", "Illinois", "Indiana"][Math.floor(Math.random() * 5)],
        })),
        // Add some additional mock listings for variety
        {
          id: "listing_mock_1",
          token: {
            tokenId: "0.0.123456",
            name: "Corn Seed Purchase Token",
            symbol: "CSP",
            supply: 180000,
            treasuryAccount: "0.0.100001",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            receiptData: {
              amount: 1800,
              currency: "USD",
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              vendor: "Midwest Seed Co.",
              receiptHash: "hash_mock_1",
            },
            transactionId: "0.0.12345678-123456-1",
          },
          price: 1650,
          currency: "USD",
          seller: "0.0.100001",
          listedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          rating: 4.8,
          location: "Iowa",
        },
        {
          id: "listing_mock_2",
          token: {
            tokenId: "0.0.789012",
            name: "Fertilizer Receipt Token",
            symbol: "FRT",
            supply: 320000,
            treasuryAccount: "0.0.100002",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            receiptData: {
              amount: 3200,
              currency: "USD",
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              vendor: "AgriChem Solutions",
              receiptHash: "hash_mock_2",
            },
            transactionId: "0.0.87654321-654321-2",
          },
          price: 2950,
          currency: "USD",
          seller: "0.0.100002",
          listedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          rating: 4.6,
          location: "Nebraska",
        },
      ]

      setListings(mockListings)
    } catch (error) {
      console.error("Failed to load marketplace data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortListings = () => {
    let filtered = [...listings]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (listing) =>
          listing.token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.token.receiptData.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter((listing) => {
        switch (filterBy) {
          case "active":
            return listing.status === "active"
          case "high-value":
            return listing.price > 2000
          case "recent":
            return new Date(listing.listedAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "oldest":
          return new Date(a.listedAt).getTime() - new Date(b.listedAt).getTime()
        case "newest":
        default:
          return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
      }
    })

    setFilteredListings(filtered)
  }

  const handleWalletConnect = async (selectedWalletType: "hashpack" | "metamask") => {
    try {
      await connectWallet(selectedWalletType)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
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
                <p className="text-sm text-muted-foreground">Token Marketplace</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Token Marketplace</h1>
            <p className="text-muted-foreground">
              Buy and sell agricultural payment receipt tokens from farmers worldwide
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Coins className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{listings.filter((l) => l.status === "active").length}</div>
                    <div className="text-xs text-muted-foreground">Active Listings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      ${listings.reduce((sum, l) => sum + l.price, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{new Set(listings.map((l) => l.seller)).size}</div>
                    <div className="text-xs text-muted-foreground">Active Sellers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      ${Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg. Price</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens, vendors, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="high-value">High Value ($2000+)</SelectItem>
                <SelectItem value="recent">Listed Recently</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Marketplace Content */}
          <Tabs defaultValue="grid" className="space-y-6">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-32 bg-muted rounded mb-4"></div>
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{listing.token.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Badge variant="outline">{listing.token.symbol}</Badge>
                              <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                                {listing.status}
                              </Badge>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">${listing.price.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {(listing.token.supply / 10000).toFixed(2)} tokens
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{listing.location}</span>
                            <div className="flex items-center gap-1 ml-auto">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{listing.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>Receipt: {formatDate(listing.token.receiptData.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>Listed {getTimeAgo(listing.listedAt)}</span>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Original Receipt</div>
                          <div className="font-medium">{listing.token.receiptData.vendor}</div>
                          <div className="text-sm">
                            {listing.token.receiptData.currency} {listing.token.receiptData.amount.toLocaleString()}
                          </div>
                        </div>

                        <Button className="w-full gap-2" disabled={listing.status !== "active" || !isConnected}>
                          <ShoppingCart className="h-4 w-4" />
                          {listing.status === "active" ? "Buy Token" : "Sold"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{listing.token.name}</h3>
                            <Badge variant="outline">{listing.token.symbol}</Badge>
                            <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                              {listing.status}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>Vendor: {listing.token.receiptData.vendor}</div>
                            <div>Location: {listing.location}</div>
                            <div>Listed: {getTimeAgo(listing.listedAt)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-1">${listing.price.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {(listing.token.supply / 10000).toFixed(2)} tokens
                          </div>
                          <Button size="sm" className="gap-2" disabled={listing.status !== "active" || !isConnected}>
                            <ShoppingCart className="h-4 w-4" />
                            {listing.status === "active" ? "Buy" : "Sold"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
