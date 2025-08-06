"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, AlertTriangle, HelpCircle, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command"

interface Event {
  id: string
  type: "speech" | "point_of_order" | "point_of_information" | "motion"
  portfolio: string
  timestamp: string
  details: any
}

interface EventTrackerProps {
  committeeId: string
  portfolios: string[]
}

export default function EventTracker({ committeeId, portfolios }: EventTrackerProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [speechForm, setSpeechForm] = useState({ portfolio: "", duration: "", description: "" })
  const [poiForm, setPoiForm] = useState({ raiser: "", target: "", description: "" })
  const [pooForm, setPooForm] = useState({ raiser: "", target: "", description: "" })
  const [motionForm, setMotionForm] = useState({
    raiser: "",
    type: "",
    description: "",
    status: "pending",
  })

  useEffect(() => {
    loadEvents()
  }, [committeeId])

  const loadEvents = async () => {
    try {
      const response = await fetch(`/api/committees/${committeeId}/events`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Failed to load events:", error)
    } finally {
      setLoading(false)
    }
  }

  const addEvent = async (type: string, details: any) => {
    try {
      const response = await fetch(`/api/committees/${committeeId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, details }),
      })

      if (response.ok) {
        const newEvent = await response.json()
        setEvents([newEvent, ...events])
        return true
      }
    } catch (error) {
      console.error("Failed to add event:", error)
    }
    return false
  }

  const handleSpeechSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!speechForm.portfolio) return

    const success = await addEvent("speech", {
      portfolio: speechForm.portfolio,
      duration: speechForm.duration || null,
      description: speechForm.description || null,
    })

    if (success) {
      setSpeechForm({ portfolio: "", duration: "", description: "" })
    }
  }

  const handlePOISubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!poiForm.raiser || !poiForm.target) return

    const success = await addEvent("point_of_information", {
      raiser: poiForm.raiser,
      target: poiForm.target,
      description: poiForm.description || null,
    })

    if (success) {
      setPoiForm({ raiser: "", target: "", description: "" })
    }
  }

  const handlePOOSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pooForm.raiser || !pooForm.target) return

    const success = await addEvent("point_of_order", {
      raiser: pooForm.raiser,
      target: pooForm.target,
      description: pooForm.description || null,
    })

    if (success) {
      setPooForm({ raiser: "", target: "", description: "" })
    }
  }

  const handleMotionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!motionForm.raiser || !motionForm.type) return

    const success = await addEvent("motion", {
      raiser: motionForm.raiser,
      type: motionForm.type,
      description: motionForm.description,
      status: motionForm.status,
    })

    if (success) {
      setMotionForm({ raiser: "", type: "", description: "", status: "pending" })
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "speech":
        return <MessageSquare className="w-4 h-4" />
      case "point_of_order":
        return <AlertTriangle className="w-4 h-4" />
      case "point_of_information":
        return <HelpCircle className="w-4 h-4" />
      case "motion":
        return <FileText className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "speech":
        return "bg-blue-100 text-blue-800"
      case "point_of_order":
        return "bg-red-100 text-red-800"
      case "point_of_information":
        return "bg-yellow-100 text-yellow-800"
      case "motion":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>
  }

  function SearchablePortfolioDropdown({
    value,
    onChange,
    portfolios,
    placeholder = "Select portfolio",
    id
  }: {
    value: string
    onChange: (value: string) => void
    portfolios: string[]
    placeholder?: string
    id?: string
  }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    return (
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          id={id}
        >
          {value ? value : <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white border rounded-md shadow-lg">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search portfolios..."
                value={search}
                onValueChange={setSearch}
                autoFocus
              />
              <CommandList>
                {portfolios
                  .filter((p) => p.toLowerCase().includes(search.toLowerCase()))
                  .map((portfolio) => (
                    <CommandItem
                      key={portfolio}
                      value={portfolio}
                      onSelect={() => {
                        onChange(portfolio)
                        setOpen(false)
                        setSearch("")
                      }}
                    >
                      {portfolio}
                    </CommandItem>
                  ))}
                {portfolios.filter((p) => p.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                  <div className="p-2 text-sm text-gray-500">No portfolios found</div>
                )}
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="track" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="track">Track Events</TabsTrigger>
          <TabsTrigger value="history">Event History</TabsTrigger>
        </TabsList>

        <TabsContent value="track" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Speech Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Record Speech
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSpeechSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="speech-portfolio">Portfolio</Label>
                    <SearchablePortfolioDropdown value={speechForm.portfolio} onChange={v => setSpeechForm({ ...speechForm, portfolio: v })} portfolios={portfolios} id="speech-portfolio" />
                  </div>
                  <div>
                    <Label htmlFor="speech-duration">Duration (optional)</Label>
                    <Input
                      id="speech-duration"
                      placeholder="e.g., 3 minutes"
                      value={speechForm.duration}
                      onChange={(e) => setSpeechForm({ ...speechForm, duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="speech-description">Description (optional)</Label>
                    <Textarea
                      id="speech-description"
                      placeholder="Enter speech details, topics discussed, or key points..."
                      value={speechForm.description}
                      onChange={(e) => setSpeechForm({ ...speechForm, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={!speechForm.portfolio}>
                    Record Speech
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Point of Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Point of Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePOISubmit} className="space-y-4">
                  <div>
                    <Label>Raised by</Label>
                    <SearchablePortfolioDropdown value={poiForm.raiser} onChange={v => setPoiForm({ ...poiForm, raiser: v })} portfolios={portfolios} />
                  </div>
                  <div>
                    <Label>Target speaker</Label>
                    <SearchablePortfolioDropdown value={poiForm.target} onChange={v => setPoiForm({ ...poiForm, target: v })} portfolios={portfolios} />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      placeholder="Enter the question asked or additional details..."
                      value={poiForm.description}
                      onChange={(e) => setPoiForm({ ...poiForm, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={!poiForm.raiser || !poiForm.target}>
                    Record POI
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Point of Order */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Point of Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePOOSubmit} className="space-y-4">
                  <div>
                    <Label>Raised by</Label>
                    <SearchablePortfolioDropdown value={pooForm.raiser} onChange={v => setPooForm({ ...pooForm, raiser: v })} portfolios={portfolios} />
                  </div>
                  <div>
                    <Label>Target speaker</Label>
                    <SearchablePortfolioDropdown value={pooForm.target} onChange={v => setPooForm({ ...pooForm, target: v })} portfolios={portfolios} />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      placeholder="Enter the reason for the point of order or additional details..."
                      value={pooForm.description}
                      onChange={(e) => setPooForm({ ...pooForm, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={!pooForm.raiser || !pooForm.target}>
                    Record POO
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Motion Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Record Motion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMotionSubmit} className="space-y-4">
                  <div>
                    <Label>Raised by</Label>
                    <SearchablePortfolioDropdown value={motionForm.raiser} onChange={v => setMotionForm({ ...motionForm, raiser: v })} portfolios={portfolios} />
                  </div>
                  <div>
                    <Label>Motion Type</Label>
                    <Input
                      placeholder="e.g., Moderated Caucus, Close Debate, Suspend Meeting..."
                      value={motionForm.type}
                      onChange={(e) => setMotionForm({ ...motionForm, type: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Enter motion details..."
                      value={motionForm.description}
                      onChange={(e) => setMotionForm({ ...motionForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={motionForm.status}
                      onValueChange={(value) => setMotionForm({ ...motionForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={!motionForm.raiser || !motionForm.type}>
                    Record Motion
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Event History</CardTitle>
              <CardDescription>All recorded events for this committee session</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No events recorded yet</div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Badge className={getEventColor(event.type)}>
                            {getEventIcon(event.type)}
                            <span className="ml-1 capitalize">{event.type.replace("_", " ")}</span>
                          </Badge>
                          <div className="space-y-1">
                            {event.type === "speech" && (
                              <div>
                                <p className="font-medium">{event.portfolio} spoke</p>
                                {event.duration && (
                                  <p className="text-sm text-gray-600">Duration: {event.duration}</p>
                                )}
                                {event.description && (
                                  <p className="text-sm text-gray-600">{event.description}</p>
                                )}
                              </div>
                            )}
                            {event.type === "point_of_information" && (
                              <div>
                                <p className="font-medium">
                                  {event.portfolio} → {event.targetPortfolio}
                                </p>
                                {event.description && (
                                  <p className="text-sm text-gray-600">{event.description}</p>
                                )}
                              </div>
                            )}
                            {event.type === "point_of_order" && (
                              <div>
                                <p className="font-medium">
                                  {event.portfolio} → {event.targetPortfolio}
                                </p>
                                {event.description && (
                                  <p className="text-sm text-gray-600">{event.description}</p>
                                )}
                              </div>
                            )}
                            {event.type === "motion" && (
                              <div>
                                <p className="font-medium">
                                  {event.portfolio} - {event.motionType?.replace("_", " ")}
                                </p>
                                {event.description && (
                                  <p className="text-sm text-gray-600">{event.description}</p>
                                )}
                                <div className="flex items-center gap-1 mt-1">
                                  {event.motionStatus === "passed" && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  {event.motionStatus === "failed" && <XCircle className="w-4 h-4 text-red-600" />}
                                  <span
                                    className={`text-sm capitalize ${
                                      event.motionStatus === "passed"
                                        ? "text-green-600"
                                        : event.motionStatus === "failed"
                                          ? "text-red-600"
                                          : "text-yellow-600"
                                    }`}
                                  >
                                    {event.motionStatus}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
