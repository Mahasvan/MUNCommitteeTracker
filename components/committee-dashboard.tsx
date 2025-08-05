"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, ChevronDown, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import PortfolioUpload from "@/components/portfolio-upload"
import EventTracker from "@/components/event-tracker"
import DelegateAnalytics from "@/components/delegate-analytics"

interface Committee {
  id: string
  name: string
  portfolios: string[]
}

interface CommitteeDashboardProps {
  committeeId: string
  onBack: () => void
}

export default function CommitteeDashboard({ committeeId, onBack }: CommitteeDashboardProps) {
  const [committee, setCommittee] = useState<Committee | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPortfolioUpdateOpen, setIsPortfolioUpdateOpen] = useState(false)
  const [isPortfolioListOpen, setIsPortfolioListOpen] = useState(false)

  useEffect(() => {
    loadCommittee()
  }, [committeeId])

  const loadCommittee = async () => {
    try {
      const response = await fetch(`/api/committees/${committeeId}`)
      if (response.ok) {
        const data = await response.json()
        setCommittee(data)
      }
    } catch (error) {
      console.error("Failed to load committee:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePortfoliosUploaded = (portfolios: string[]) => {
    if (committee) {
      setCommittee({ ...committee, portfolios })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading committee...</p>
        </div>
      </div>
    )
  }

  if (!committee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Committee not found</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Committees
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{committee.name}</h1>
          <p className="text-gray-600">
            {committee.portfolios.length > 0
              ? `Tracking ${committee.portfolios.length} portfolios`
              : "Upload portfolios to begin tracking"}
          </p>
        </div>

        {committee.portfolios.length === 0 ? (
          /* Portfolio Upload */
          <PortfolioUpload committeeId={committeeId} onPortfoliosUploaded={handlePortfoliosUploaded} />
        ) : (
          /* Committee Management with Tabs */
          <div className="space-y-6">
            {/* Portfolio Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Committee Portfolios
                </CardTitle>
                <CardDescription>{committee.portfolios.length} portfolios loaded</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Collapsible Portfolio List */}
                <Collapsible open={isPortfolioListOpen} onOpenChange={setIsPortfolioListOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>View All Portfolios ({committee.portfolios.length})</span>
                      {isPortfolioListOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                      {committee.portfolios.map((portfolio, index) => (
                        <div key={index} className="bg-blue-50 text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                          {portfolio}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Collapsible Portfolio Update Section */}
                <Collapsible open={isPortfolioUpdateOpen} onOpenChange={setIsPortfolioUpdateOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="mt-4 w-full justify-between">
                      <span>Update Portfolios</span>
                      {isPortfolioUpdateOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <PortfolioUpload
                      committeeId={committeeId}
                      onPortfoliosUploaded={handlePortfoliosUploaded}
                      isUpdate={true}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="tracker" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tracker">Event Tracker</TabsTrigger>
                <TabsTrigger value="analytics">Delegate Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="tracker" className="mt-6">
                <EventTracker committeeId={committeeId} portfolios={committee.portfolios} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <DelegateAnalytics committeeId={committeeId} portfolios={committee.portfolios} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
