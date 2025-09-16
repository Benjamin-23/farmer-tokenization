"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Coins } from "lucide-react"
import { currencyConverter, type ConversionResult } from "@/lib/currency-converter"

interface CurrencyDisplayProps {
  amount: number
  currency: string
  onConversionUpdate?: (result: ConversionResult) => void
}

export function CurrencyDisplay({ amount, currency, onConversionUpdate }: CurrencyDisplayProps) {
  const [conversion, setConversion] = useState<ConversionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [marketData, setMarketData] = useState<any>(null)

  const performConversion = async () => {
    setIsLoading(true)
    try {
      const result = await currencyConverter.convertToHbar(amount, currency)
      setConversion(result)
      setLastUpdated(new Date())
      onConversionUpdate?.(result)

      // Fetch market data
      const market = await currencyConverter.getMarketData()
      setMarketData(market)
    } catch (error) {
      console.error("Conversion failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (amount > 0 && currency) {
      performConversion()
    }
  }, [amount, currency])

  if (!conversion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Conversion
          </CardTitle>
          <CardDescription>
            Converting {currency} {amount.toLocaleString()} to HBAR...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Conversion
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={performConversion}
              disabled={isLoading}
              className="gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>Live conversion rates • Last updated: {lastUpdated?.toLocaleTimeString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original Amount */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">
              {conversion.originalCurrency} {conversion.originalAmount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Original Receipt Amount</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* USD Conversion */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-green-600">${conversion.usdAmount.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">USD Equivalent</div>
              <div className="text-xs text-muted-foreground mt-1">Rate: {conversion.exchangeRate.toFixed(4)}</div>
            </div>

            {/* HBAR Conversion */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-primary">{conversion.hbarAmount.toFixed(4)} HBAR</div>
              <div className="text-xs text-muted-foreground">HBAR Equivalent</div>
              <div className="text-xs text-muted-foreground mt-1">Rate: ${conversion.hbarRate.toFixed(4)}</div>
            </div>
          </div>

          <Separator />

          {/* Token Amount */}
          <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-primary">{conversion.tokenAmount.toFixed(4)} Tokens</span>
            </div>
            <div className="text-sm text-muted-foreground">Token supply to be minted (1:1 with HBAR value)</div>
            <div className="text-xs text-muted-foreground mt-1">
              Formula: ${conversion.usdAmount.toFixed(2)} ÷ ${conversion.hbarRate.toFixed(4)} ={" "}
              {conversion.tokenAmount.toFixed(4)} HBAR
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Data */}
      {marketData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-semibold">HBAR Price</div>
                <div className="text-sm text-muted-foreground">Current market price</div>
              </div>
              <div className="text-right">
                <div className="font-bold">${marketData.hbarPrice.toFixed(4)}</div>
                <div
                  className={`text-sm flex items-center gap-1 ${
                    marketData.hbarChange24h >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {marketData.hbarChange24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(marketData.hbarChange24h).toFixed(2)}%
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Supported Currencies</h4>
              <div className="grid grid-cols-2 gap-2">
                {marketData.supportedCurrencies.slice(0, 6).map((curr: any) => (
                  <div key={curr.currency} className="flex items-center justify-between p-2 border rounded">
                    <Badge variant="outline">{curr.currency}</Badge>
                    <div className="text-sm">
                      <span className="font-medium">{curr.rate.toFixed(4)}</span>
                      <span className={`ml-1 text-xs ${curr.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {curr.change24h >= 0 ? "+" : ""}
                        {curr.change24h.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
