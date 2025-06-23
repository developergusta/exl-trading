-- Add deleted status to the profiles table
-- This script should be run in the Supabase SQL editor

-- First, add the deleted_at column
ALTER TABLE profiles 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update the status check constraint to include 'deleted'
-- First drop the existing constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_status_check;

-- Add the new constraint with deleted status
ALTER TABLE profiles 
ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'deleted'));

-- Create an index on deleted_at for performance
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

-- Create an index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Optional: Add a comment to document the soft delete approach
COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when the user was soft-deleted. NULL means user is active.';
COMMENT ON COLUMN profiles.status IS 'User status: pending (awaiting approval), approved (active), rejected (denied access), deleted (soft-deleted)'; 