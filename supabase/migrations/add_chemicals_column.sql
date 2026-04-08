-- Add the 'chemicals' JSONB column to chemicals_logs
-- This stores an array of { name: string, amount: number, unit: string }
ALTER TABLE chemicals_logs
  ADD COLUMN IF NOT EXISTS chemicals JSONB DEFAULT '[]'::jsonb;

-- Example of what the column stores:
-- [
--   { "name": "Glyphosate",    "amount": 15, "unit": "GAL" },
--   { "name": "Surfactant",    "amount": 50, "unit": "oz"  },
--   { "name": "Super Dye",     "amount": 36, "unit": "oz"  },
--   { "name": "2,4-D",         "amount": 21, "unit": "GAL" },
--   { "name": "Ecomazapyr 2SL","amount": 36, "unit": "GAL" },
--   { "name": "Regular Dye",   "amount": 25, "unit": "oz"  }
-- ]

-- Optional: add an index for faster project+date queries
CREATE INDEX IF NOT EXISTS idx_chemicals_logs_project_date
  ON chemicals_logs (project_id, logged_at DESC);
