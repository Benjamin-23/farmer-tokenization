"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ValidationReport } from "@/components/validation-report"
import { Upload, FileText, CheckCircle, XCircle, Loader2, Coins } from "lucide-react"
import { receiptValidator, type ValidationResult } from "@/lib/receipt-validator"
import { hederaClient, type TokenMetadata } from "@/lib/hedera-client"
import { useWallet } from "@/hooks/use-wallet"
import { toast } from "sonner"
import { ethers } from "ethers"
// import {PDFExtract, PDFExtractOptions} from 'pdf.js-extract';


interface ParsedReceipt {
  amount: number
  currency: string
  date: string
  vendor: string
  isValid: boolean
  validationErrors: string[]
}

interface PDFUploadProps {
  onReceiptParsed: (receipt: ParsedReceipt) => void
}

export function PDFUpload({ onReceiptParsed }: PDFUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCreatingToken, setIsCreatingToken] = useState(false)
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [authenticityResult, setAuthenticityResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { walletType, address, balance, walletData, refreshBalance } = useWallet()

  const simulatePDFParsing = async (file: File): Promise<ParsedReceipt> => {
    // Simulate PDF parsing with realistic data
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock parsed data - in real implementation, this would use PDF parsing library
    const mockReceipt = {
      amount: Math.floor(Math.random() * 5000) + 100,
      currency: ["USD", "EUR", "GBP"][Math.floor(Math.random() * 3)],
      date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Within 24 hours
      vendor: ["Farm Supply Co.", "Agricultural Equipment Ltd.", "Seed & Feed Store"][Math.floor(Math.random() * 3)],
      isValid: true, // Make it valid for testing
      validationErrors: [],
    }

    return mockReceipt
  }

  // Create token symbol from vendor name
  const createTokenSymbol = (vendorName: string): string => {
    // Remove common words and take first letters
    const words = vendorName
      .replace(/[^a-zA-Z\s]/g, '') // Remove special characters
      .split(' ')
      .filter(word => word.length > 2) // Filter out short words
      .slice(0, 3) // Take first 3 words
      .map(word => word.charAt(0).toUpperCase())
      .join('')
    
    return words.length >= 2 ? words : vendorName.substring(0, 4).toUpperCase()
  }

  // Check if wallet has sufficient HBAR balance
  const checkBalance = (): boolean => {
    if (!balance) return false
    const balanceNumber = parseFloat(balance.replace(' HBAR', ''))
    return balanceNumber >= 8 // 3 HBAR for token creation + 5 HBAR for verification
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

  // Create token from receipt
  const createToken = async () => {
    if (!parsedReceipt || !checkBalance()) {
      toast.error("Insufficient HBAR balance. You need at least 8 HBAR (3 for token creation + 5 for verification)")
      return
    }

    setIsCreatingToken(true)
    
    try {
      // Deduct HBAR for token creation (3 HBAR)
      toast.loading("Deducting 3 HBAR for token creation...")
      const tokenCreationDeduction = await deductHBAR(3)
      if (!tokenCreationDeduction) {
        toast.error("Failed to deduct HBAR for token creation")
        return
      }

      // Deduct HBAR for verification (5 HBAR)
      toast.loading("Deducting 5 HBAR for receipt verification...")
      const verificationDeduction = await deductHBAR(5)
      if (!verificationDeduction) {
        toast.error("Failed to deduct HBAR for verification")
        return
      }

      // Create token metadata
      const tokenSymbol = createTokenSymbol(parsedReceipt.vendor)
      const tokenMetadata: TokenMetadata = {
        name: `${parsedReceipt.vendor} Receipt Token`,
        symbol: tokenSymbol,
        decimals: 2,
        initialSupply: parsedReceipt.amount * 100, // Convert to smallest unit
        treasuryAccountId: address || "0.0.0",
        receiptData: {
          amount: parsedReceipt.amount,
          currency: parsedReceipt.currency,
          date: parsedReceipt.date,
          vendor: parsedReceipt.vendor,
          receiptHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock hash
        }
      }

      // Create token on Hedera
      toast.loading("Creating token on Hedera network...")
      const createdToken = await hederaClient.createToken(tokenMetadata)
      
      // Refresh wallet balance
      await refreshBalance()
      
      toast.success(`Token created successfully! Token ID: ${createdToken.tokenId}`)
      
      // Reset form
      setParsedReceipt(null)
      setValidationResult(null)
      setAuthenticityResult(null)
      
    } catch (error) {
      console.error("Token creation failed:", error)
      toast.error("Failed to create token. Please try again.")
    } finally {
      setIsCreatingToken(false)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setError(null)
      setIsProcessing(true)
      setUploadProgress(0)
      setValidationResult(null)
      setAuthenticityResult(null)

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 70) {
              clearInterval(progressInterval)
              return 70
            }
            return prev + 10
          })
        }, 200)
        // const pdfExtract = new PDFExtract();
        // const options: PDFExtractOptions = {};
        // const extractedData = await pdfExtract.extract(file.name, options);
        // console.log(extractedData, 'extracted data');
        const parsed = await simulatePDFParsing(file)

        setUploadProgress(80)

        const validation = receiptValidator.validate(parsed)
        setValidationResult(validation)

        const authenticity = receiptValidator.validateAuthenticity(parsed, {
          createdDate: new Date(file.lastModified),
          size: file.size,
          name: file.name,
        })
        setAuthenticityResult(authenticity)

        setUploadProgress(100)

        // Update parsed receipt with validation results
        const updatedReceipt = {
          ...parsed,
          isValid: validation.isValid,
          validationErrors: validation.errors.map((e) => e.message),
        }

        setParsedReceipt(updatedReceipt)
        onReceiptParsed(updatedReceipt)
      } catch (err) {
        setError("Failed to process PDF. Please ensure it's a valid payment receipt.")
      } finally {
        setIsProcessing(false)
      }
    },
    [onReceiptParsed],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Payment Receipt
          </CardTitle>
          <CardDescription>Upload a PDF receipt from the last 24 hours to tokenize your payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              {isProcessing ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
              <div>
                <p className="text-lg font-medium">
                  {isProcessing
                    ? "Processing receipt..."
                    : isDragActive
                      ? "Drop your PDF here"
                      : "Drag & drop your PDF receipt"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isProcessing ? "Extracting and validating payment details" : "or click to browse files"}
                </p>
              </div>
              {!isProcessing && (
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {uploadProgress < 70
                    ? "Uploading..."
                    : uploadProgress < 80
                      ? "Parsing PDF..."
                      : uploadProgress < 100
                        ? "Validating..."
                        : "Complete"}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {parsedReceipt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {parsedReceipt.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Receipt Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="text-lg font-semibold">
                  {parsedReceipt.currency} {parsedReceipt.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="text-lg font-semibold">{new Date(parsedReceipt.date).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                <p className="text-lg font-semibold">{parsedReceipt.vendor}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={parsedReceipt.isValid ? "default" : "destructive"}>
                {parsedReceipt.isValid ? "Valid Receipt" : "Invalid Receipt"}
              </Badge>
              {validationResult && <Badge variant="outline">Score: {validationResult.score}/100</Badge>}
            </div>

            {parsedReceipt.isValid && (
              <div className="pt-4 border-t">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Token Creation Cost</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <div>• Token Creation: 3 HBAR</div>
                    <div>• Receipt Verification: 5 HBAR</div>
                    <div className="font-semibold mt-1">Total Required: 8 HBAR</div>
                    <div className="text-xs mt-1">Current Balance: {balance || "0 HBAR"}</div>
                  </div>
                </div>
                
                {!checkBalance() && (
                  <Alert variant="destructive" className="mb-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient HBAR balance. You need at least 8 HBAR to create a token.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={createToken}
                  disabled={!checkBalance() || isCreatingToken}
                >
                  {isCreatingToken ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Token...
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      Create Token from Receipt
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {validationResult && (
        <ValidationReport validationResult={validationResult} authenticityResult={authenticityResult} />
      )}
    </div>
  )
}
