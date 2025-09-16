"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WalletConnector } from "@/components/wallet-connector"
import { useWallet } from "@/hooks/use-wallet"
import { Wheat, Upload, Coins, TrendingUp, Shield, Zap, FileText, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { isConnected, walletType, address, connectWallet } = useWallet()

  const handleWalletConnect = async (selectedWalletType: "hashpack" | "metamask") => {
    try {
      await connectWallet(selectedWalletType)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
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
                <p className="text-sm text-muted-foreground">Payment Receipt Tokenization</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <a href="#dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </a>
                <a href="#marketplace" className="text-sm font-medium hover:text-primary transition-colors">
                  Marketplace
                </a>
                <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                  About
                </a>
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

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Powered by Hedera Network
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Tokenize Your Farm
            <span className="text-primary"> Payment Receipts</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Transform your agricultural payment receipts into tradeable tokens on the Hedera blockchain. Secure,
            transparent, and efficient farming finance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/upload">
                <Upload className="h-5 w-5" />
                Upload Receipt
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent" asChild>
              <Link href="/marketplace">
                <TrendingUp className="h-5 w-5" />
                View Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to tokenize your agricultural payments and access new financial opportunities
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Upload Receipt</CardTitle>
                <CardDescription>
                  Upload your payment receipt PDF. Our system validates authenticity and extracts payment details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• PDF validation & parsing</li>
                  <li>• Date verification (within 24h)</li>
                  <li>• Amount extraction</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Token Creation</CardTitle>
                <CardDescription>
                  Automatic token generation based on payment value, converted to HBAR equivalent on Hedera network.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Currency conversion</li>
                  <li>• HBAR value calculation</li>
                  <li>• HTS token minting</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Trade & Sell</CardTitle>
                <CardDescription>
                  List your tokens on our marketplace for buyers to purchase, creating liquidity for your farm payments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Marketplace listing</li>
                  <li>• Secure transactions</li>
                  <li>• Instant settlements</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$2.5M+</div>
              <div className="text-muted-foreground">Receipts Tokenized</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-muted-foreground">Active Farmers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">5,800+</div>
              <div className="text-muted-foreground">Tokens Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Coming Soon
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Future Roadmap</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Exciting features in development to enhance your agricultural finance experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">Q1 2025</Badge>
              </div>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Receipt Splitting</CardTitle>
                <CardDescription>
                  Split large receipts into multiple smaller tokens for better liquidity and trading flexibility.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">Q2 2025</Badge>
              </div>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Validation</CardTitle>
                <CardDescription>
                  Advanced AI system for enhanced receipt authenticity verification and fraud detection.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of farmers already tokenizing their receipts and accessing new financial opportunities.
          </p>
          {!isConnected ? (
            <WalletConnector
              onWalletConnect={handleWalletConnect}
              isConnected={isConnected}
              connectedWallet={walletType || undefined}
            />
          ) : (
            <Button size="lg" className="gap-2" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wheat className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold">AgriToken</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Revolutionizing agricultural finance through blockchain tokenization.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Marketplace
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Tokenize
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AgriToken. All rights reserved. Built on Hedera Network.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
