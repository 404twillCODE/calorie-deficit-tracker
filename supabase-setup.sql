-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Drop existing table if you need to recreate it (remove this line if you have existing data)
-- DROP TABLE IF EXISTS calorie_entries CASCADE;

-- Create the calorie_entries table with user_id
CREATE TABLE IF NOT EXISTS calorie_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories_eaten NUMERIC(10, 2) DEFAULT 0,
    calories_burned NUMERIC(10, 2) DEFAULT 0,
    deficit NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_calorie_entries_user_id ON calorie_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_calorie_entries_date ON calorie_entries(date);
CREATE INDEX IF NOT EXISTS idx_calorie_entries_user_date ON calorie_entries(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE calorie_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Users can view their own entries" ON calorie_entries;
DROP POLICY IF EXISTS "Users can insert their own entries" ON calorie_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON calorie_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON calorie_entries;

-- Create RLS policies that ensure users can only access their own data

-- Policy: Users can view their own entries
CREATE POLICY "Users can view their own entries" ON calorie_entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own entries
CREATE POLICY "Users can insert their own entries" ON calorie_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own entries
CREATE POLICY "Users can update their own entries" ON calorie_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own entries
CREATE POLICY "Users can delete their own entries" ON calorie_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_calorie_entries_updated_at ON calorie_entries;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_calorie_entries_updated_at
    BEFORE UPDATE ON calorie_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
