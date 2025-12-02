-- Insert default organization
INSERT INTO organizations (name, brand_color)
VALUES ('Dental Clinic', '#D4AF37')
ON CONFLICT DO NOTHING;

-- Create a default super admin user profile (optional)
-- Note: Real users would be created via Supabase Auth signup
