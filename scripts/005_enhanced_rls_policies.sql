-- Enhanced RLS Policies with Branch-based Access Control

-- Drop existing policies that need to be enhanced
DROP POLICY IF EXISTS "Users can view patients in their organization" ON patients;
DROP POLICY IF EXISTS "Users can insert patients" ON patients;
DROP POLICY IF EXISTS "Users can update patients in their organization" ON patients;
DROP POLICY IF EXISTS "Users can view treatment records in their organization" ON treatment_records;
DROP POLICY IF EXISTS "Users can insert treatment records" ON treatment_records;
DROP POLICY IF EXISTS "Users can update treatment records" ON treatment_records;
DROP POLICY IF EXISTS "Users can view invoices in their organization" ON invoices;
DROP POLICY IF EXISTS "Users can view payments in their organization" ON payments;
DROP POLICY IF EXISTS "Users can view xray files in their organization" ON xray_files;
DROP POLICY IF EXISTS "Users can view doctors in their organization" ON doctors;

-- Enhanced RLS Policies for Doctors with Branch-based Access
CREATE POLICY "Users can view doctors in their organization"
  ON doctors FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = doctors.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR EXISTS(
        SELECT 1 FROM doctor_branch_assignments 
        WHERE doctor_branch_assignments.doctor_id = doctors.id
        AND doctor_branch_assignments.branch_id IN (
          SELECT branch_id FROM doctor_branch_assignments dba2
          WHERE dba2.doctor_id = profiles.id
        )
      )
      OR profiles.role IN ('admin', 'receptionist', 'accountant', 'branch_manager')
    )
  ));

-- Enhanced RLS Policies for Patients with Branch-based Access
CREATE POLICY "Users can view patients in their organization and branch"
  ON patients FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = patients.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR patients.id IN (
        SELECT DISTINCT pv.patient_id FROM patient_visits pv
        JOIN doctor_branch_assignments dba ON pv.doctor_id = dba.doctor_id
        WHERE dba.branch_id IN (
          SELECT branch_id FROM doctor_branch_assignments 
          WHERE doctor_id = profiles.id AND is_active = true
        )
      )
      OR profiles.role IN ('admin', 'receptionist', 'accountant', 'branch_manager')
    )
  ));

CREATE POLICY "Users can insert patients in their branch"
  ON patients FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = patients.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR profiles.role IN ('admin', 'receptionist', 'branch_manager')
      OR EXISTS(
        SELECT 1 FROM doctor_branch_assignments 
        WHERE doctor_id = profiles.id 
        AND is_active = true
      )
    )
  ));

CREATE POLICY "Users can update patients in their organization and branch"
  ON patients FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = patients.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR patients.id IN (
        SELECT DISTINCT pv.patient_id FROM patient_visits pv
        JOIN doctor_branch_assignments dba ON pv.doctor_id = dba.doctor_id
        WHERE dba.branch_id IN (
          SELECT branch_id FROM doctor_branch_assignments 
          WHERE doctor_id = profiles.id AND is_active = true
        )
      )
      OR profiles.role IN ('admin', 'receptionist', 'accountant', 'branch_manager')
    )
  ));

-- Enhanced RLS Policies for Treatment Records with Branch-based Access
CREATE POLICY "Users can view treatment records in their organization and branch"
  ON treatment_records FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = treatment_records.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR treatment_records.doctor_id = profiles.id
      OR treatment_records.branch_id IN (
        SELECT branch_id FROM doctor_branch_assignments 
        WHERE doctor_id = profiles.id AND is_active = true
      )
      OR profiles.role IN ('admin', 'receptionist', 'accountant', 'branch_manager')
    )
  ));

CREATE POLICY "Users can insert treatment records in their branch"
  ON treatment_records FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = treatment_records.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR profiles.role IN ('admin', 'doctor', 'branch_manager')
      OR EXISTS(
        SELECT 1 FROM doctor_branch_assignments 
        WHERE doctor_id = profiles.id 
        AND branch_id = treatment_records.branch_id
        AND is_active = true
      )
    )
  ));

CREATE POLICY "Users can update treatment records in their branch"
  ON treatment_records FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = treatment_records.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR treatment_records.doctor_id = profiles.id
      OR treatment_records.branch_id IN (
        SELECT branch_id FROM doctor_branch_assignments 
        WHERE doctor_id = profiles.id AND is_active = true
      )
      OR profiles.role IN ('admin', 'branch_manager')
    )
  ));

-- Enhanced RLS Policies for Invoices with Branch-based Access
CREATE POLICY "Users can view invoices in their organization and branch"
  ON invoices FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = invoices.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR invoices.doctor_id = profiles.id
      OR invoices.branch_id IN (
        SELECT branch_id FROM doctor_branch_assignments 
        WHERE doctor_id = profiles.id AND is_active = true
      )
      OR profiles.role IN ('admin', 'receptionist', 'accountant', 'branch_manager')
    )
  ));

-- Enhanced RLS Policies for Payments with Branch-based Access
CREATE POLICY "Users can view payments in their organization and branch"
  ON payments FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = payments.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR payments.created_by = profiles.id
      OR EXISTS(
        SELECT 1 FROM invoices i
        JOIN doctor_branch_assignments dba ON i.branch_id = dba.branch_id
        WHERE i.id = payments.invoice_id
        AND dba.doctor_id = profiles.id
        AND dba.is_active = true
      )
      OR profiles.role IN ('admin', 'accountant', 'branch_manager')
    )
  ));

-- Enhanced RLS Policies for X-Ray Files with Branch-based Access
CREATE POLICY "Users can view xray files in their organization and branch"
  ON xray_files FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = xray_files.organization_id
    AND (
      profiles.role = 'super_admin' 
      OR xray_files.uploaded_by = profiles.id
      OR xray_files.patient_id IN (
        SELECT DISTINCT pv.patient_id FROM patient_visits pv
        JOIN doctor_branch_assignments dba ON pv.doctor_id = dba.doctor_id
        WHERE dba.branch_id IN (
          SELECT branch_id FROM doctor_branch_assignments 
          WHERE doctor_id = profiles.id AND is_active = true
        )
      )
      OR profiles.role IN ('admin', 'xray_technician', 'branch_manager')
    )
  ));

-- Enhanced Policies for Super Admin Branch Switching
CREATE POLICY "Super admins can view all data in their organization"
  ON branches FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
    AND profiles.organization_id = branches.organization_id
  ));

-- Create function to check if user has access to a specific branch
CREATE OR REPLACE FUNCTION user_has_branch_access(branch_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles p
    JOIN doctor_branch_assignments dba ON p.id = dba.doctor_id
    WHERE p.id = auth.uid()
    AND dba.branch_id = branch_id
    AND dba.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;