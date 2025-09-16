"use client"

export interface ValidationRule {
  id: string
  name: string
  description: string
  severity: "error" | "warning" | "info"
  check: (receipt: any) => boolean
  message: string
}

export interface ValidationResult {
  isValid: boolean
  score: number // 0-100
  errors: ValidationRule[]
  warnings: ValidationRule[]
  info: ValidationRule[]
  summary: string
}

export class ReceiptValidator {
  private rules: ValidationRule[] = [
    // Critical validation rules (errors)
    {
      id: "date_recent",
      name: "Recent Date",
      description: "Receipt must be from within the last 24 hours",
      severity: "error",
      check: (receipt) => {
        if (!receipt.date) return false
        const receiptDate = new Date(receipt.date)
        const now = new Date()
        const hoursDiff = (now.getTime() - receiptDate.getTime()) / (1000 * 60 * 60)
        return hoursDiff <= 24
      },
      message: "Receipt date must be within the last 24 hours",
    },
    {
      id: "amount_valid",
      name: "Valid Amount",
      description: "Receipt must have a valid payment amount",
      severity: "error",
      check: (receipt) => receipt.amount && receipt.amount > 0,
      message: "Receipt must contain a valid payment amount greater than 0",
    },
    {
      id: "currency_supported",
      name: "Supported Currency",
      description: "Currency must be supported by the platform",
      severity: "error",
      check: (receipt) => {
        const supportedCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "CNY"]
        return receipt.currency && supportedCurrencies.includes(receipt.currency.toUpperCase())
      },
      message: "Currency is not supported by the platform",
    },
    {
      id: "vendor_present",
      name: "Vendor Information",
      description: "Receipt must contain vendor information",
      severity: "error",
      check: (receipt) => receipt.vendor && receipt.vendor.trim().length >= 3,
      message: "Receipt must contain valid vendor information",
    },

    // Warning validation rules
    {
      id: "amount_reasonable",
      name: "Reasonable Amount",
      description: "Amount should be within typical agricultural purchase range",
      severity: "warning",
      check: (receipt) => receipt.amount >= 50 && receipt.amount <= 50000,
      message: "Amount seems unusually high or low for agricultural purchases",
    },
    {
      id: "vendor_agricultural",
      name: "Agricultural Vendor",
      description: "Vendor appears to be agriculture-related",
      severity: "warning",
      check: (receipt) => {
        if (!receipt.vendor) return false
        const agriKeywords = [
          "farm",
          "seed",
          "fertilizer",
          "equipment",
          "supply",
          "agricultural",
          "agri",
          "crop",
          "livestock",
          "feed",
          "grain",
          "harvest",
          "tractor",
          "irrigation",
        ]
        const vendorLower = receipt.vendor.toLowerCase()
        return agriKeywords.some((keyword) => vendorLower.includes(keyword))
      },
      message: "Vendor may not be agriculture-related",
    },
    {
      id: "date_not_future",
      name: "Not Future Date",
      description: "Receipt date should not be in the future",
      severity: "warning",
      check: (receipt) => {
        if (!receipt.date) return true
        const receiptDate = new Date(receipt.date)
        const now = new Date()
        return receiptDate <= now
      },
      message: "Receipt date appears to be in the future",
    },

    // Info validation rules
    {
      id: "format_standard",
      name: "Standard Format",
      description: "Receipt follows standard formatting",
      severity: "info",
      check: (receipt) => {
        // Check if receipt has all expected fields
        return !!(receipt.date && receipt.amount && receipt.vendor && receipt.currency)
      },
      message: "Receipt contains all standard fields",
    },
    {
      id: "high_value",
      name: "High Value Transaction",
      description: "Transaction is of significant value",
      severity: "info",
      check: (receipt) => receipt.amount > 5000,
      message: "This is a high-value transaction",
    },
  ]

  validate(receipt: any): ValidationResult {
    const errors: ValidationRule[] = []
    const warnings: ValidationRule[] = []
    const info: ValidationRule[] = []

    // Run all validation rules
    this.rules.forEach((rule) => {
      const passed = rule.check(receipt)

      if (!passed && rule.severity === "error") {
        errors.push(rule)
      } else if (!passed && rule.severity === "warning") {
        warnings.push(rule)
      } else if (passed && rule.severity === "info") {
        info.push(rule)
      }
    })

    // Calculate validation score
    const totalRules = this.rules.filter((r) => r.severity === "error" || r.severity === "warning").length
    const passedRules = totalRules - errors.length - warnings.length
    const score = Math.round((passedRules / totalRules) * 100)

    // Determine if valid (no errors)
    const isValid = errors.length === 0

    // Generate summary
    let summary = ""
    if (isValid) {
      if (warnings.length === 0) {
        summary = "Receipt passed all validation checks"
      } else {
        summary = `Receipt is valid with ${warnings.length} warning${warnings.length > 1 ? "s" : ""}`
      }
    } else {
      summary = `Receipt failed validation with ${errors.length} error${errors.length > 1 ? "s" : ""}`
    }

    return {
      isValid,
      score,
      errors,
      warnings,
      info,
      summary,
    }
  }

  // Advanced validation for suspicious patterns
  detectSuspiciousPatterns(receipt: any): string[] {
    const suspiciousPatterns: string[] = []

    // Check for round numbers (might indicate fake receipts)
    if (receipt.amount && receipt.amount % 100 === 0 && receipt.amount > 1000) {
      suspiciousPatterns.push("Amount is a round number, which is uncommon for real purchases")
    }

    // Check for weekend dates (many agricultural suppliers are closed)
    if (receipt.date) {
      const receiptDate = new Date(receipt.date)
      const dayOfWeek = receiptDate.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        suspiciousPatterns.push("Receipt is dated on a weekend when many suppliers are closed")
      }
    }

    // Check for very recent timestamps (might indicate rushed creation)
    if (receipt.date) {
      const receiptDate = new Date(receipt.date)
      const now = new Date()
      const minutesDiff = (now.getTime() - receiptDate.getTime()) / (1000 * 60)
      if (minutesDiff < 30) {
        suspiciousPatterns.push("Receipt timestamp is very recent (less than 30 minutes ago)")
      }
    }

    return suspiciousPatterns
  }

  // Validate receipt authenticity using various heuristics
  validateAuthenticity(
    receipt: any,
    fileMetadata?: any,
  ): {
    authenticityScore: number
    flags: string[]
    recommendation: string
  } {
    const flags: string[] = []
    let authenticityScore = 100

    // Check file metadata if available
    if (fileMetadata) {
      // Check if PDF was recently created
      if (fileMetadata.createdDate) {
        const createdDate = new Date(fileMetadata.createdDate)
        const now = new Date()
        const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)

        if (hoursDiff < 1) {
          flags.push("PDF was created very recently")
          authenticityScore -= 20
        }
      }

      // Check for suspicious PDF properties
      if (fileMetadata.producer && fileMetadata.producer.includes("fake")) {
        flags.push("PDF producer suggests artificial generation")
        authenticityScore -= 30
      }
    }

    // Check receipt content patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(receipt)
    flags.push(...suspiciousPatterns)
    authenticityScore -= suspiciousPatterns.length * 10

    // Ensure score doesn't go below 0
    authenticityScore = Math.max(0, authenticityScore)

    // Generate recommendation
    let recommendation = ""
    if (authenticityScore >= 80) {
      recommendation = "Receipt appears authentic and can be safely tokenized"
    } else if (authenticityScore >= 60) {
      recommendation = "Receipt has some suspicious elements but may be valid - proceed with caution"
    } else {
      recommendation = "Receipt shows multiple signs of being inauthentic - manual review recommended"
    }

    return {
      authenticityScore,
      flags,
      recommendation,
    }
  }
}

export const receiptValidator = new ReceiptValidator()
