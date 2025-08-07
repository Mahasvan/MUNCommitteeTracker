"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, ChevronDown, ChevronRight, Github } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import PortfolioUpload from "@/components/portfolio-upload"
import EventTracker from "@/components/event-tracker"
import DelegateAnalytics from "@/components/delegate-analytics"
import { ThemeToggle } from "@/components/theme-toggle"
import Head from "next/head"

interface Committee {
  id: string
  name: string
  portfolios: string[]
}

interface CommitteePageProps {
  params: { id: string }
}

export default function CommitteePage({ params }: CommitteePageProps) {
  const router = useRouter()
  const [committee, setCommittee] = useState<Committee | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPortfolioUpdateOpen, setIsPortfolioUpdateOpen] = useState(false)
  const [isPortfolioListOpen, setIsPortfolioListOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadCommittee()
  }, [params.id])

  useEffect(() => {
    if (committee) {
      document.title = `${committee.name} - SSN-SNUC MUN 2025`
    }
  }, [committee])

  const loadCommittee = async () => {
    try {
      const response = await fetch(`/api/committees/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCommittee(data)
      } else {
        toast.error("Committee not found")
        router.push("/")
      }
    } catch (error) {
      console.error("Failed to load committee:", error)
      toast.error("Failed to load committee")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handlePortfoliosUploaded = (portfolios: string[]) => {
    if (committee) {
      setCommittee({ ...committee, portfolios })
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/committees/${params.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      })
      if (res.ok) {
        toast.success("Committee deleted successfully")
        setShowDeleteDialog(false)
        router.push("/")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete committee")
      }
    } catch (e) {
      toast.error("Failed to delete committee")
    } finally {
      setDeleteLoading(false)
      setDeletePassword("")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white">Loading committee...</p>
        </div>
      </div>
    )
  }

  if (!committee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Committee not found</p>
          <Button onClick={() => router.push("/")}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{committee.name} - SSN-SNUC MUN 2025</title>
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Committees
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open('https://github.com/Mahasvan/MUNCommitteeTracker', '_blank')}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub Repository</span>
                </Button>
                <ThemeToggle />
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{committee.name}</h1>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={deleteLoading}>
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {committee.portfolios.length > 0
                ? `Tracking ${committee.portfolios.length} portfolios`
                : "Upload portfolios to begin tracking"}
            </p>
          </div>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Committee</DialogTitle>
              </DialogHeader>
              <p>Enter the committee password to confirm deletion. This action cannot be undone.</p>
              <Input
                type="password"
                placeholder="Password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                disabled={deleteLoading}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteLoading}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={!deletePassword || deleteLoading}>
                  {deleteLoading ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {committee.portfolios.length === 0 ? (
            /* Portfolio Upload */
            <PortfolioUpload committeeId={params.id} onPortfoliosUploaded={handlePortfoliosUploaded} />
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
                          <div key={index} className="bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-md text-sm font-medium">
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
                        committeeId={params.id}
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
                  <EventTracker committeeId={params.id} portfolios={committee.portfolios} />
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                  <DelegateAnalytics committeeId={params.id} portfolios={committee.portfolios} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 