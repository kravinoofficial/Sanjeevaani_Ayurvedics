-- Add report field to physical_treatment_prescriptions table
ALTER TABLE physical_treatment_prescriptions
ADD COLUMN IF NOT EXISTS report TEXT;

-- Add comment to describe the field
COMMENT ON COLUMN physical_treatment_prescriptions.report IS 'Physical medicine practitioner report after serving the treatment';
