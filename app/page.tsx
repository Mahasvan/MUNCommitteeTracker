"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface Committee {
  id: string
  name: string
  createdAt: string
  portfolioCount: number
  hasPassword: boolean
}

export default function HomePage() {
  const router = useRouter()
  const [committees, setCommittees] = useState<Committee[]>([])
  const [newCommitteeName, setNewCommitteeName] = useState("")
  const [newCommitteePassword, setNewCommitteePassword] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [passwordPrompt, setPasswordPrompt] = useState<string | null>(null)
  const [accessPassword, setAccessPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    loadCommittees()
  }, [])

  const loadCommittees = async () => {
    try {
      const response = await fetch("/api/committees")
      if (response.ok) {
        const data = await response.json()
        setCommittees(data)
      }
    } catch (error) {
      console.error("Failed to load committees:", error)
    }
  }

  const createCommittee = async () => {
    if (!newCommitteeName.trim() || !newCommitteePassword.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newCommitteeName.trim(),
          password: newCommitteePassword.trim()
        }),
      })

      if (response.ok) {
        const newCommittee = await response.json()
        setCommittees([...committees, newCommittee])
        setNewCommitteeName("")
        setNewCommitteePassword("")
        router.push(`/committees/${newCommittee.id}`)
      }
    } catch (error) {
      console.error("Failed to create committee:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCommitteeAccess = (committeeId: string) => {
    const committee = committees.find(c => c.id === committeeId)
    if (committee?.hasPassword) {
      setPasswordPrompt(committeeId)
      setAccessPassword("")
    } else {
      router.push(`/committees/${committeeId}`)
    }
  }

  const verifyAccess = async () => {
    if (!passwordPrompt || !accessPassword.trim()) return

    setIsVerifying(true)
    try {
      const response = await fetch(`/api/committees/${passwordPrompt}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: accessPassword.trim() }),
      })

      if (response.ok) {
        router.push(`/committees/${passwordPrompt}`)
        setPasswordPrompt(null)
        setAccessPassword("")
      } else {
        const error = await response.json()
        alert(error.error || "Invalid password")
      }
    } catch (error) {
      console.error("Failed to verify access:", error)
      alert("Failed to verify access")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Committee Tracker - SSN-SNUC MUN 2025</h1>
              <p className="text-gray-600 dark:text-gray-400">Brought to you by the Tech Team. Hopefully it helps you manage your committee better!</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Create New Committee */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Committee
            </CardTitle>
            <CardDescription>Start a new MUN committee session with portfolio tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="committee-name">Committee Name</Label>
                  <Input
                    id="committee-name"
                    placeholder="e.g., Security Council, ECOSOC, DISEC"
                    value={newCommitteeName}
                    onChange={(e) => setNewCommitteeName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && createCommittee()}
                  />
                </div>
                <div>
                  <Label htmlFor="committee-password">Password</Label>
                  <Input
                    id="committee-password"
                    type="password"
                    placeholder="Enter a password (min 4 characters)"
                    value={newCommitteePassword}
                    onChange={(e) => setNewCommitteePassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && createCommittee()}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={createCommittee} 
                  disabled={!newCommitteeName.trim() || !newCommitteePassword.trim() || newCommitteePassword.length < 4 || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Committee"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Committees */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Existing Committees</h2>
          {committees.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No committees created yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Create your first committee to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {committees.map((committee) => (
                <Card
                  key={committee.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCommitteeAccess(committee.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {committee.name}
                      {committee.hasPassword && (
                        <Badge variant="secondary" className="text-xs">
                          🔒 Protected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {committee.portfolioCount} portfolios
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(committee.createdAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Password Prompt Dialog */}
      {passwordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Committee Access Required</CardTitle>
              <CardDescription>
                This committee is password protected. Please enter the password to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="access-password">Password</Label>
                <Input
                  id="access-password"
                  type="password"
                  placeholder="Enter committee password"
                  value={accessPassword}
                  onChange={(e) => setAccessPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && verifyAccess()}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswordPrompt(null)
                    setAccessPassword("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={verifyAccess}
                  disabled={!accessPassword.trim() || isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Access Committee"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
