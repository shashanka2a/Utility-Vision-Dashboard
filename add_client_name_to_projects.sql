-- Run this SQL in your Supabase SQL Editor to add the client_name column to the projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS client_name TEXT;
