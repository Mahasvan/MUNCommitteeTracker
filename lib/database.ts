import { supabase } from './supabase'
import { randomUUID } from "crypto"

export function verifyPassword(password: string, storedPassword: string): boolean {
  return password === storedPassword
}

export async function getCommitteePortfolios(committeeId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('portfolios')
    .select('name')
    .eq('committee_id', committeeId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching portfolios:', error)
    return []
  }

  return data?.map((row: any) => row.name) || []
}

export interface Committee {
  id: string
  name: string
  portfolios: string[]
  createdAt: string
  portfolioCount: number
  hasPassword: boolean
}

export interface Event {
  id: string
  committeeId: string
  type: string
  portfolio: string
  targetPortfolio?: string
  duration?: string
  description?: string
  motionType?: string
  motionStatus?: string
  timestamp: string
}

export async function getCommittees(): Promise<Committee[]> {
  const { data, error } = await supabase
    .from('committees')
    .select(`
      id,
      name,
      created_at,
      password,
      portfolios!inner(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching committees:', error)
    return []
  }

  const committees = await Promise.all(
    data?.map(async (row: any) => {
      const portfolios = await getCommitteePortfolios(row.id)
      return {
        id: row.id,
        name: row.name,
        portfolios,
        createdAt: row.created_at,
        portfolioCount: portfolios.length,
        hasPassword: !!row.password,
      }
    }) || []
  )

  return committees
}

export async function createCommittee(name: string, password: string): Promise<Committee> {
  const { data, error } = await supabase
    .from('committees')
    .insert({
      name,
      password,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating committee:', error)
    throw new Error('Failed to create committee')
  }

  return {
    id: data.id,
    name: data.name,
    portfolios: [],
    createdAt: data.created_at,
    portfolioCount: 0,
    hasPassword: true,
  }
}

export async function getCommitteeById(id: string): Promise<Committee | null> {
  const { data, error } = await supabase
    .from('committees')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  const portfolios = await getCommitteePortfolios(id)
  
  return {
    id: data.id,
    name: data.name,
    portfolios,
    createdAt: data.created_at,
    portfolioCount: portfolios.length,
    hasPassword: !!data.password,
  }
}

export async function verifyCommitteeAccess(id: string, password: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('committees')
    .select('password')
    .eq('id', id)
    .single()

  if (error || !data) {
    return false
  }

  // If no password exists, allow access
  if (!data.password) return true

  return verifyPassword(password, data.password)
}

export async function updateCommitteePortfolios(id: string, portfolios: string[]): Promise<void> {
  // Sort portfolios alphabetically, case-insensitive
  const sortedPortfolios = [...portfolios].sort((a, b) => 
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )

  // Delete existing portfolios for this committee
  const { error: deleteError } = await supabase
    .from('portfolios')
    .delete()
    .eq('committee_id', id)

  if (deleteError) {
    console.error('Error deleting portfolios:', deleteError)
    throw new Error('Failed to update portfolios')
  }

  // Insert new portfolios
  const portfolioData = sortedPortfolios.map(name => ({
    committee_id: id,
    name,
  }))

  const { error: insertError } = await supabase
    .from('portfolios')
    .insert(portfolioData)

  if (insertError) {
    console.error('Error inserting portfolios:', insertError)
    throw new Error('Failed to update portfolios')
  }
}

export async function getCommitteeEvents(committeeId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('committee_id', committeeId)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return data?.map((row: any) => ({
    id: row.id,
    committeeId: row.committee_id,
    type: row.type,
    portfolio: row.portfolio,
    targetPortfolio: row.target_portfolio || undefined,
    duration: row.duration || undefined,
    description: row.description || undefined,
    motionType: row.motion_type || undefined,
    motionStatus: row.motion_status || undefined,
    timestamp: row.timestamp,
  })) || []
}

export async function addCommitteeEvent(committeeId: string, type: string, details: any): Promise<Event> {
  console.log(`Adding event for committee: ${committeeId}, type: ${type}`)
  
  // First, verify the committee exists
  const { data: committee, error: committeeError } = await supabase
    .from('committees')
    .select('id')
    .eq('id', committeeId)
    .single()
  
  if (committeeError || !committee) {
    console.error(`Committee with ID ${committeeId} not found`)
    throw new Error(`Committee with ID ${committeeId} not found`)
  }
  
  console.log(`Committee found: ${committee.id}`)
  
  const eventData = {
    committee_id: committeeId,
    type,
    portfolio: details.portfolio || details.raiser || '',
    target_portfolio: details.target || details.targetPortfolio || null,
    duration: details.duration || null,
    description: details.description || null,
    motion_type: details.type || details.motionType || null,
    motion_status: details.status || details.motionStatus || null,
  }

  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single()

  if (error) {
    console.error('Error adding event:', error)
    throw new Error('Failed to add event')
  }

  return {
    id: data.id,
    committeeId: data.committee_id,
    type: data.type,
    portfolio: data.portfolio,
    targetPortfolio: data.target_portfolio || undefined,
    duration: data.duration || undefined,
    description: data.description || undefined,
    motionType: data.motion_type || undefined,
    motionStatus: data.motion_status || undefined,
    timestamp: data.timestamp,
  }
}
