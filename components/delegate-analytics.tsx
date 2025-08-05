"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, MessageSquare, AlertTriangle, HelpCircle, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface Event {
  id: string
  type: "speech" | "point_of_order" | "point_of_information" | "motion"
  portfolio: string
  timestamp: string
  details: any
}

interface DelegateStats {
  portfolio: string
  speeches: number
  pointsOfOrder: number
  pointsOfInformation: number
  totalParticipation: number
}

type SortField = "portfolio" | "speeches" | "pointsOfOrder" | "pointsOfInformation" | "totalParticipation"
type SortDirection = "asc" | "desc"

interface DelegateAnalyticsProps {
  committeeId: string
  portfolios: string[]
}

export default function DelegateAnalytics({ committeeId, portfolios }: DelegateAnalyticsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<DelegateStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>("totalParticipation")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  useEffect(() => {
    loadEventsAndCalculateStats()
  }, [committeeId, portfolios, sortField, sortDirection])

  const loadEventsAndCalculateStats = async () => {
    try {
      const response = await fetch(`/api/committees/${committeeId}/events`)
      if (response.ok) {
        const eventsData = await response.json()
        setEvents(eventsData)
        calculateStats(eventsData)
      }
    } catch (error) {
      console.error("Failed to load events:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (eventsData: Event[]) => {
    const statsMap = new Map<string, DelegateStats>()

    // Initialize stats for all portfolios
    portfolios.forEach(portfolio => {
      statsMap.set(portfolio, {
        portfolio,
        speeches: 0,
        pointsOfOrder: 0,
        pointsOfInformation: 0,
        totalParticipation: 0
      })
    })

    // Process events and count activities
    eventsData.forEach(event => {
      switch (event.type) {
        case "speech":
          const speaker = event.portfolio
          if (statsMap.has(speaker)) {
            const stats = statsMap.get(speaker)!
            stats.speeches++
            stats.totalParticipation++
          }
          break

        case "point_of_order":
          const pooRaiser = event.portfolio
          if (statsMap.has(pooRaiser)) {
            const stats = statsMap.get(pooRaiser)!
            stats.pointsOfOrder++
            stats.totalParticipation++
          }
          break

        case "point_of_information":
          const poiRaiser = event.portfolio
          if (statsMap.has(poiRaiser)) {
            const stats = statsMap.get(poiRaiser)!
            stats.pointsOfInformation++
            stats.totalParticipation++
          }
          break
      }
    })

    // Convert to array and apply sorting
    const sortedStats = Array.from(statsMap.values()).sort((a, b) => {
      let aValue: string | number
      let bValue: string | number
      
      switch (sortField) {
        case "portfolio":
          aValue = a.portfolio.toLowerCase()
          bValue = b.portfolio.toLowerCase()
          break
        case "speeches":
          aValue = a.speeches
          bValue = b.speeches
          break
        case "pointsOfOrder":
          aValue = a.pointsOfOrder
          bValue = b.pointsOfOrder
          break
        case "pointsOfInformation":
          aValue = a.pointsOfInformation
          bValue = b.pointsOfInformation
          break
        case "totalParticipation":
        default:
          aValue = a.totalParticipation
          bValue = b.totalParticipation
          break
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })

    setStats(sortedStats)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  const getTotalStats = () => {
    return stats.reduce(
      (totals, delegate) => ({
        speeches: totals.speeches + delegate.speeches,
        pointsOfOrder: totals.pointsOfOrder + delegate.pointsOfOrder,
        pointsOfInformation: totals.pointsOfInformation + delegate.pointsOfInformation,
        totalParticipation: totals.totalParticipation + delegate.totalParticipation
      }),
      { speeches: 0, pointsOfOrder: 0, pointsOfInformation: 0, totalParticipation: 0 }
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }

  const totalStats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Speeches</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.speeches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points of Order</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.pointsOfOrder}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points of Information</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.pointsOfInformation}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Delegates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.filter(s => s.totalParticipation > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">of {portfolios.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Delegate Participation Analytics
          </CardTitle>
          <CardDescription>
            Detailed breakdown of each delegate's participation in committee activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("portfolio")}
                      className="h-auto p-0 font-medium"
                    >
                      Portfolio
                      {getSortIcon("portfolio")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("speeches")}
                      className="h-auto p-0 font-medium"
                    >
                      Speeches
                      {getSortIcon("speeches")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("pointsOfOrder")}
                      className="h-auto p-0 font-medium"
                    >
                      Points of Order
                      {getSortIcon("pointsOfOrder")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("pointsOfInformation")}
                      className="h-auto p-0 font-medium"
                    >
                      Points of Information
                      {getSortIcon("pointsOfInformation")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalParticipation")}
                      className="h-auto p-0 font-medium"
                    >
                      Total Participation
                      {getSortIcon("totalParticipation")}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((delegate) => (
                  <TableRow key={delegate.portfolio}>
                    <TableCell className="font-medium">{delegate.portfolio}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 mr-1 text-blue-600" />
                        {delegate.speeches}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                        {delegate.pointsOfOrder}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 mr-1 text-yellow-600" />
                        {delegate.pointsOfInformation}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-lg">{delegate.totalParticipation}</span>
                    </TableCell>
                  </TableRow>
                ))}
                {stats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No delegate data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {stats.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Note:</strong> Delegates are sorted by total participation. 
                Motions are not included in individual delegate statistics as they represent procedural actions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}