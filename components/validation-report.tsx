"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertTriangle, Info, Shield, AlertCircle } from "lucide-react"
import type { ValidationResult } from "@/lib/receipt-validator"

interface ValidationReportProps {
  validationResult: ValidationResult
  authenticityResult?: {
    authenticityScore: number
    flags: string[]
    recommendation: string
  }
}

export function ValidationReport({ validationResult, authenticityResult }: ValidationReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {validationResult.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Validation Report
          </CardTitle>
          <CardDescription>{validationResult.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Validation Score</span>
            <span className={`text-lg font-bold ${getScoreColor(validationResult.score)}`}>
              {validationResult.score}/100
            </span>
          </div>
          <Progress value={validationResult.score} className="h-2" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className={`p-3 rounded-lg ${validationResult.errors.length === 0 ? "bg-green-50" : "bg-red-50"}`}>
              <div
                className={`text-lg font-bold ${validationResult.errors.length === 0 ? "text-green-600" : "text-red-600"}`}
              >
                {validationResult.errors.length}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div
              className={`p-3 rounded-lg ${validationResult.warnings.length === 0 ? "bg-green-50" : "bg-yellow-50"}`}
            >
              <div
                className={`text-lg font-bold ${validationResult.warnings.length === 0 ? "text-green-600" : "text-yellow-600"}`}
              >
                {validationResult.warnings.length}
              </div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <div className="text-lg font-bold text-blue-600">{validationResult.info.length}</div>
              <div className="text-xs text-muted-foreground">Info</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authenticity Check */}
      {authenticityResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Authenticity Analysis
            </CardTitle>
            <CardDescription>Advanced fraud detection and authenticity verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authenticity Score</span>
              <span className={`text-lg font-bold ${getScoreColor(authenticityResult.authenticityScore)}`}>
                {authenticityResult.authenticityScore}/100
              </span>
            </div>
            <Progress value={authenticityResult.authenticityScore} className="h-2" />

            <Alert className={`${getScoreBackground(authenticityResult.authenticityScore)} border-current`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authenticityResult.recommendation}</AlertDescription>
            </Alert>

            {authenticityResult.flags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Detected Flags:</h4>
                <div className="space-y-2">
                  {authenticityResult.flags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {(validationResult.errors.length > 0 ||
        validationResult.warnings.length > 0 ||
        validationResult.info.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
            <CardDescription>Complete breakdown of all validation checks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Errors ({validationResult.errors.length})
                </h4>
                <div className="space-y-3">
                  {validationResult.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{error.name}</div>
                        <div className="text-sm mt-1">{error.message}</div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <>
                {validationResult.errors.length > 0 && <Separator />}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings ({validationResult.warnings.length})
                  </h4>
                  <div className="space-y-3">
                    {validationResult.warnings.map((warning, index) => (
                      <Alert key={index} className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription>
                          <div className="font-medium text-yellow-800">{warning.name}</div>
                          <div className="text-sm mt-1 text-yellow-700">{warning.message}</div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Info */}
            {validationResult.info.length > 0 && (
              <>
                {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && <Separator />}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                    <Info className="h-4 w-4" />
                    Information ({validationResult.info.length})
                  </h4>
                  <div className="space-y-2">
                    {validationResult.info.map((info, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{info.name}:</span>
                        <span className="text-blue-700">{info.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
