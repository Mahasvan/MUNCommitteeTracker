# Supabase Migration Setup

This project has been migrated from local SQLite to Supabase. Follow these steps to set up your Supabase database:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

## 2. Set up Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Run the Database Migration

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `scripts/supabase-migration.sql`
4. Run the migration script

## 4. Install Dependencies

```bash
pnpm install
```

## 5. Start the Development Server

```bash
pnpm dev
```

## Database Schema

The migration creates three tables:

- **committees**: Stores committee information with passwords
- **portfolios**: Stores portfolio names linked to committees
- **events**: Stores all MUN events (speeches, POIs, POOs, motions)

## Features

- ✅ Multi-committee support
- ✅ Password protection for committees
- ✅ Portfolio upload with validation
- ✅ Event tracking (speeches, POIs, POOs, motions)
- ✅ Delegate analytics with sorting
- ✅ Collapsible UI elements
- ✅ Searchable portfolio dropdowns
- ✅ Alphabetical portfolio sorting

## Migration Benefits

- **Scalability**: No more local database file limitations
- **Reliability**: Cloud-hosted database with backups
- **Collaboration**: Multiple users can access the same data
- **Deployment**: Easy deployment to Vercel, Netlify, etc.
- **Real-time**: Built-in real-time capabilities (if needed later) 