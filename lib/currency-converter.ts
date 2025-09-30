"use client"

export interface ExchangeRate {
  currency: string
  rate: number // Rate to USD
  lastUpdated: string
}

export interface HederaRate {
  hbarToUsd: number
  lastUpdated: string
}

export interface ConversionResult {
  originalAmount: number
  originalCurrency: string
  usdAmount: number
  hbarAmount: number
  tokenAmount: number
  exchangeRate: number
  hbarRate: number
}

class CurrencyConverter {
  private exchangeRates: Map<string, ExchangeRate> = new Map()
  private hederaRate: HederaRate | null = null
  private lastFetch = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.initializeMockRates()
  }

  private initializeMockRates() {
    // Mock exchange rates - in production, these would come from a real API
    const mockRates: ExchangeRate[] = [
      { currency: "USD", rate: 1.0, lastUpdated: new Date().toISOString() },
      { currency: "EUR", rate: 1.08, lastUpdated: new Date().toISOString() },
      { currency: "GBP", rate: 1.27, lastUpdated: new Date().toISOString() },
      { currency: "CAD", rate: 0.74, lastUpdated: new Date().toISOString() },
      { currency: "AUD", rate: 0.66, lastUpdated: new Date().toISOString() },
      { currency: "JPY", rate: 0.0067, lastUpdated: new Date().toISOString() },
      { currency: "CHF", rate: 1.12, lastUpdated: new Date().toISOString() },
      { currency: "CNY", rate: 0.14, lastUpdated: new Date().toISOString() },
    ]

    mockRates.forEach((rate) => {
      this.exchangeRates.set(rate.currency, rate)
    })

    this.hederaRate = {
      hbarToUsd: 0.08, // 1 HBAR = $0.08 (more realistic current rate)
      lastUpdated: new Date().toISOString(),
    }
  }

  async fetchLatestRates(): Promise<void> {
    const now = Date.now()
    if (now - this.lastFetch < this.CACHE_DURATION) {
      return // Use cached rates
    }

    try {
      // In production, you would fetch from real APIs like:
      // - Exchange rates: https://api.exchangerate-api.com/v4/latest/USD
      // - HBAR price: https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd

      // For now, simulate API call with realistic HBAR price fluctuation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add some realistic fluctuation to mock rates
      this.exchangeRates.forEach((rate, currency) => {
        if (currency !== "USD") {
          const fluctuation = (Math.random() - 0.5) * 0.02 // ±1% fluctuation
          rate.rate = rate.rate * (1 + fluctuation)
          rate.lastUpdated = new Date().toISOString()
        }
      })

      if (this.hederaRate) {
        const hbarFluctuation = (Math.random() - 0.5) * 0.08 // ±4% fluctuation (crypto volatility)
        this.hederaRate.hbarToUsd = Math.max(0.05, this.hederaRate.hbarToUsd * (1 + hbarFluctuation))
        this.hederaRate.lastUpdated = new Date().toISOString()
      }

      this.lastFetch = now
    } catch (error) {
      console.error("Failed to fetch latest rates:", error)
      // Continue with cached rates
    }
  }

  async convertToHbar(amount: number, fromCurrency: string): Promise<ConversionResult> {
    await this.fetchLatestRates()

    const exchangeRate = this.exchangeRates.get(fromCurrency.toUpperCase())
    if (!exchangeRate) {
      throw new Error(`Unsupported currency: ${fromCurrency}`)
    }

    if (!this.hederaRate) {
      throw new Error("HBAR rate not available")
    }

    // Convert to USD first
    const usdAmount = amount * exchangeRate.rate

    const hbarAmount = usdAmount * this.hederaRate.hbarToUsd

    const tokenAmount = Math.floor(hbarAmount * 10000) / 10000 // 4 decimal precision for HBAR

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency.toUpperCase(),
      usdAmount,
      hbarAmount,
      tokenAmount,
      exchangeRate: exchangeRate.rate,
      hbarRate: this.hederaRate.hbarToUsd,
    }
  }

  getSupportedCurrencies(): string[] {
    return Array.from(this.exchangeRates.keys())
  }

  getExchangeRate(currency: string): ExchangeRate | null {
    return this.exchangeRates.get(currency.toUpperCase()) || null
  }

  getHbarRate(): HederaRate | null {
    return this.hederaRate
  }

  async getMarketData(): Promise<{
    hbarPrice: number
    hbarChange24h: number
    supportedCurrencies: { currency: string; rate: number; change24h: number }[]
  }> {
    await this.fetchLatestRates()

    // Mock 24h changes
    const hbarChange24h = (Math.random() - 0.5) * 10 // ±5% change

    const supportedCurrencies = Array.from(this.exchangeRates.entries()).map(([currency, rate]) => ({
      currency,
      rate: rate.rate,
      change24h: (Math.random() - 0.5) * 4, // ±2% change
    }))

    return {
      hbarPrice: this.hederaRate?.hbarToUsd || 0.08,
      hbarChange24h,
      supportedCurrencies,
    }
  }
}

export const currencyConverter = new CurrencyConverter()
