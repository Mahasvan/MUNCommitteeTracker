"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PortfolioUploadProps {
  committeeId: string
  onPortfoliosUploaded: (portfolios: string[]) => void
  isUpdate?: boolean
}

export default function PortfolioUpload({ committeeId, onPortfoliosUploaded, isUpdate = false }: PortfolioUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validatePortfolioData = (data: any): string[] => {
    if (!Array.isArray(data)) {
      throw new Error("File must contain a JSON array")
    }

    if (data.length === 0) {
      throw new Error("Portfolio array cannot be empty")
    }

    const portfolios = data.map((item, index) => {
      if (typeof item !== "string") {
        throw new Error(`Item at index ${index} must be a string`)
      }
      const trimmed = item.trim()
      if (!trimmed) {
        throw new Error(`Item at index ${index} cannot be empty`)
      }
      return trimmed
    })

    // Check for duplicates
    const unique = new Set(portfolios)
    if (unique.size !== portfolios.length) {
      throw new Error("Duplicate portfolios found")
    }

    return portfolios
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate file type
      if (!file.name.endsWith(".json")) {
        throw new Error("Please upload a JSON file")
      }

      // Read and parse file
      const text = await file.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("Invalid JSON format")
      }

      // Validate structure
      const portfolios = validatePortfolioData(data)

      // Upload to server
      const response = await fetch(`/api/committees/${committeeId}/portfolios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolios }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload portfolios")
      }

      setSuccess(true)
      onPortfoliosUploaded(portfolios)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          {isUpdate ? "Update Portfolios" : "Upload Committee Portfolios"}
        </CardTitle>
        <CardDescription>
          Upload a JSON file containing an array of portfolio names (countries/delegates)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Click to upload or drag and drop your JSON file</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="portfolio-upload"
            />
            <Button variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        </div>

        {/* Example Format */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Expected JSON Format:</h4>
          <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
            {`[
  "United States of America",
  "Germany",
  "Namibia",
  "Japan",
  "Brazil"
]`}
          </pre>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Portfolios uploaded successfully!</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
