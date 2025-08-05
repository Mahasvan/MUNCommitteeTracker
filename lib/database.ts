import Database from "better-sqlite3"
import { randomUUID } from "crypto"

let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    db = new Database("./data/mun-tracker.db")
    db.pragma("journal_mode = WAL")
    db.pragma("foreign_keys = ON")
  }
  return db
}

export function verifyPassword(password: string, storedPassword: string): boolean {
  return password === storedPassword
}

export function getCommitteePortfolios(committeeId: string): string[] {
  const database = getDatabase()
  const stmt = database.prepare(`
    SELECT name FROM portfolios 
    WHERE committee_id = ? 
    ORDER BY created_at ASC
  `)
  
  const rows = stmt.all(committeeId) as any[]
  return rows.map(row => row.name)
}

export async function initDatabase() {
  const database = getDatabase()

  // Check if tables already exist
  const tableCheck = database.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name IN ('committees', 'portfolios', 'events')
  `)
  const existingTables = tableCheck.all() as any[]
  
  if (existingTables.length === 3) {
    // All tables exist, no need to recreate
    return
  }

  // Disable foreign key constraints temporarily
  database.exec(`PRAGMA foreign_keys = OFF`)

  // Force drop all tables to ensure clean slate
  try {
    database.exec(`DROP TABLE IF EXISTS events`)
    database.exec(`DROP TABLE IF EXISTS portfolios`) 
    database.exec(`DROP TABLE IF EXISTS committees`)
  } catch (error) {
    // Ignore errors if tables don't exist
  }

  // Create committees table with clean structure
  database.exec(`
    CREATE TABLE committees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create portfolios table for better normalization
  database.exec(`
    CREATE TABLE portfolios (
      id TEXT PRIMARY KEY,
      committee_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (committee_id) REFERENCES committees (id) ON DELETE CASCADE
    )
  `)

  // Create events table with clean structure
  database.exec(`
    CREATE TABLE events (
      id TEXT PRIMARY KEY,
      committee_id TEXT NOT NULL,
      type TEXT NOT NULL,
      portfolio TEXT NOT NULL,
      target_portfolio TEXT,
      duration TEXT,
      description TEXT,
      motion_type TEXT,
      motion_status TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (committee_id) REFERENCES committees (id) ON DELETE CASCADE
    )
  `)

  // Create indexes for better performance
  database.exec(`
    CREATE INDEX idx_committees_created_at ON committees (created_at);
    CREATE INDEX idx_portfolios_committee_id ON portfolios (committee_id);
    CREATE INDEX idx_events_committee_id ON events (committee_id);
    CREATE INDEX idx_events_timestamp ON events (timestamp);
    CREATE INDEX idx_events_type ON events (type);
    CREATE INDEX idx_events_portfolio ON events (portfolio);
  `)

  // Re-enable foreign key constraints
  database.exec(`PRAGMA foreign_keys = ON`)
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

export function getCommittees(): Committee[] {
  const database = getDatabase()
  const stmt = database.prepare(`
    SELECT 
      c.id,
      c.name,
      c.created_at as createdAt,
      c.password,
      COUNT(p.id) as portfolioCount
    FROM committees c
    LEFT JOIN portfolios p ON c.id = p.committee_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `)

  const rows = stmt.all() as any[]
  return rows.map((row) => ({
    ...row,
    portfolios: getCommitteePortfolios(row.id),
    portfolioCount: row.portfolioCount,
    hasPassword: !!row.password,
  }))
}

export function createCommittee(name: string, password: string): Committee {
  const database = getDatabase()
  const id = randomUUID()
  const createdAt = new Date().toISOString()

  const stmt = database.prepare(`
    INSERT INTO committees (id, name, password, created_at)
    VALUES (?, ?, ?, ?)
  `)

  stmt.run(id, name, password, createdAt)

  return {
    id,
    name,
    portfolios: [],
    createdAt,
    portfolioCount: 0,
    hasPassword: true,
  }
}

export function getCommitteeById(id: string): Committee | null {
  const database = getDatabase()
  const stmt = database.prepare(`
    SELECT 
      id,
      name,
      created_at as createdAt,
      password
    FROM committees 
    WHERE id = ?
  `)

  const row = stmt.get(id) as any
  if (!row) return null

  const portfolios = getCommitteePortfolios(id)
  
  return {
    ...row,
    portfolios,
    portfolioCount: portfolios.length,
    hasPassword: !!row.password,
  }
}

export function verifyCommitteeAccess(id: string, password: string): boolean {
  const database = getDatabase()
  const stmt = database.prepare(`
    SELECT password
    FROM committees 
    WHERE id = ?
  `)

  const row = stmt.get(id) as any
  if (!row) return false

  // If no password exists, allow access
  if (!row.password) return true

  return verifyPassword(password, row.password)
}

export function updateCommitteePortfolios(id: string, portfolios: string[]): void {
  const database = getDatabase()
  
  // Delete existing portfolios for this committee
  const deleteStmt = database.prepare(`DELETE FROM portfolios WHERE committee_id = ?`)
  deleteStmt.run(id)
  
  // Insert new portfolios
  const insertStmt = database.prepare(`
    INSERT INTO portfolios (id, committee_id, name, created_at)
    VALUES (?, ?, ?, ?)
  `)
  
  portfolios.forEach(portfolio => {
    const portfolioId = randomUUID()
    const createdAt = new Date().toISOString()
    insertStmt.run(portfolioId, id, portfolio, createdAt)
  })
}

export function getCommitteeEvents(committeeId: string): Event[] {
  const database = getDatabase()
  const stmt = database.prepare(`
    SELECT 
      id,
      committee_id as committeeId,
      type,
      portfolio,
      target_portfolio as targetPortfolio,
      duration,
      description,
      motion_type as motionType,
      motion_status as motionStatus,
      timestamp
    FROM events 
    WHERE committee_id = ?
    ORDER BY timestamp DESC
  `)

  const rows = stmt.all(committeeId) as any[]
  return rows.map((row) => ({
    ...row,
    // Convert empty strings to undefined for optional fields
    targetPortfolio: row.targetPortfolio || undefined,
    duration: row.duration || undefined,
    description: row.description || undefined,
    motionType: row.motionType || undefined,
    motionStatus: row.motionStatus || undefined,
  }))
}

export function addCommitteeEvent(committeeId: string, type: string, details: any): Event {
  const database = getDatabase()
  
  console.log(`Adding event for committee: ${committeeId}, type: ${type}`)
  
  // First, verify the committee exists
  const committeeCheck = database.prepare(`SELECT id FROM committees WHERE id = ?`)
  const committee = committeeCheck.get(committeeId)
  
  if (!committee) {
    console.error(`Committee with ID ${committeeId} not found`)
    throw new Error(`Committee with ID ${committeeId} not found`)
  }
  
  console.log(`Committee found: ${committee.id}`)
  
  const id = randomUUID()
  const timestamp = new Date().toISOString()

  const stmt = database.prepare(`
    INSERT INTO events (
      id, committee_id, type, portfolio, target_portfolio, 
      duration, description, motion_type, motion_status, timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id, 
    committeeId, 
    type, 
    details.portfolio || details.raiser || '',
    details.target || details.targetPortfolio || null,
    details.duration || null,
    details.description || null,
    details.type || details.motionType || null,
    details.status || details.motionStatus || null,
    timestamp
  )

  return {
    id,
    committeeId,
    type,
    portfolio: details.portfolio || details.raiser || '',
    targetPortfolio: details.target || details.targetPortfolio || undefined,
    duration: details.duration || undefined,
    description: details.description || undefined,
    motionType: details.type || details.motionType || undefined,
    motionStatus: details.status || details.motionStatus || undefined,
    timestamp,
  }
}
