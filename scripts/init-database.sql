-- Initialize MUN Committee Tracker Database
-- This script creates the necessary tables and indexes

-- Committees table to store committee information
CREATE TABLE IF NOT EXISTS committees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    portfolios TEXT DEFAULT '[]',  -- JSON array of portfolio names
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events table to store all committee activities
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    committee_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('speech', 'point_of_order', 'point_of_information', 'motion')),
    details TEXT NOT NULL,  -- JSON object with event-specific details
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (committee_id) REFERENCES committees (id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_committee_id ON events (committee_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events (timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (type);

-- Sample data for testing (optional)
INSERT OR IGNORE INTO committees (id, name, portfolios) VALUES 
('sample-committee-1', 'Security Council', '["United States of America", "Russian Federation", "China", "United Kingdom", "France"]');

INSERT OR IGNORE INTO events (id, committee_id, type, details) VALUES 
('sample-event-1', 'sample-committee-1', 'speech', '{"portfolio": "United States of America", "duration": "3 minutes"}'),
('sample-event-2', 'sample-committee-1', 'motion', '{"raiser": "Russian Federation", "type": "moderated_caucus", "description": "5 minute moderated caucus on nuclear disarmament", "status": "passed"}');
