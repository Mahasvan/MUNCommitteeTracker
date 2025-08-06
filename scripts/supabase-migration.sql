-- Create committees table
CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  portfolio TEXT NOT NULL,
  target_portfolio TEXT,
  duration TEXT,
  description TEXT,
  motion_type TEXT,
  motion_status TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_committees_created_at ON committees (created_at);
CREATE INDEX IF NOT EXISTS idx_portfolios_committee_id ON portfolios (committee_id);
CREATE INDEX IF NOT EXISTS idx_events_committee_id ON events (committee_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events (timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (type);
CREATE INDEX IF NOT EXISTS idx_events_portfolio ON events (portfolio);

-- Enable Row Level Security (RLS)
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo app)
-- In production, you'd want proper authentication
CREATE POLICY "Allow public read access to committees" ON committees
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to committees" ON committees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to portfolios" ON portfolios
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to portfolios" ON portfolios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to portfolios" ON portfolios
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to portfolios" ON portfolios
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access to events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to events" ON events
  FOR INSERT WITH CHECK (true); 