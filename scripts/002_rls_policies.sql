-- RLS Policies for Organizations (Super Admin only)
CREATE POLICY "Super admins can view their organization"
  ON organizations FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super_admin'
    AND profiles.organization_id = organizations.id
  ));

CREATE POLICY "Super admins can update their organization"
  ON organizations FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super_admin'
    AND profiles.organization_id = organizations.id
  ));

-- RLS Policies for Profiles (Users can view their own, Admins can view all in org)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles in their organization"
  ON profiles FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid()
    AND p.role IN ('super_admin', 'admin')
    AND p.organization_id = profiles.organization_id
  ));

CREATE POLICY "Super admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('super_admin', 'admin')
    AND profiles.organization_id = profiles.organization_id
  ));

CREATE POLICY "Admins can update profiles in their organization"
  ON profiles FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid()
    AND p.role IN ('super_admin', 'admin')
    AND p.organization_id = profiles.organization_id
  ));

CREATE POLICY "Admins can delete profiles in their organization"
  ON profiles FOR DELETE
  USING (EXISTS(
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid()
    AND p.role IN ('super_admin', 'admin')
    AND p.organization_id = profiles.organization_id
  ));

-- RLS Policies for Branches
CREATE POLICY "Users can view branches in their organization"
  ON branches FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = branches.organization_id
  ));

CREATE POLICY "Admins can insert branches"
  ON branches FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
    AND profiles.organization_id = branches.organization_id
  ));

CREATE POLICY "Admins can update branches"
  ON branches FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
    AND profiles.organization_id = branches.organization_id
  ));

-- RLS Policies for Doctors
CREATE POLICY "Users can view doctors in their organization"
  ON doctors FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = doctors.organization_id
  ));

CREATE POLICY "Admins can insert doctors"
  ON doctors FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
    AND profiles.organization_id = doctors.organization_id
  ));

CREATE POLICY "Admins can update doctors"
  ON doctors FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
    AND profiles.organization_id = doctors.organization_id
  ));

-- RLS Policies for Patients
CREATE POLICY "Users can view patients in their organization"
  ON patients FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = patients.organization_id
  ));

CREATE POLICY "Users can insert patients"
  ON patients FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = patients.organization_id
  ));

CREATE POLICY "Users can update patients in their organization"
  ON patients FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = patients.organization_id
  ));

-- RLS Policies for Services
CREATE POLICY "Users can view services in their organization"
  ON services FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = services.organization_id
  ));

CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
    AND profiles.organization_id = services.organization_id
  ));

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
    AND profiles.organization_id = services.organization_id
  ));

-- RLS Policies for Treatment Records
CREATE POLICY "Users can view treatment records in their organization"
  ON treatment_records FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = treatment_records.organization_id
  ));

CREATE POLICY "Users can insert treatment records"
  ON treatment_records FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = treatment_records.organization_id
  ));

CREATE POLICY "Users can update treatment records"
  ON treatment_records FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = treatment_records.organization_id
  ));

-- RLS Policies for Invoices
CREATE POLICY "Users can view invoices in their organization"
  ON invoices FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = invoices.organization_id
  ));

CREATE POLICY "Receptionists and accountants can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'receptionist', 'accountant')
    AND profiles.organization_id = invoices.organization_id
  ));

CREATE POLICY "Accountants can update invoices"
  ON invoices FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'accountant')
    AND profiles.organization_id = invoices.organization_id
  ));

-- RLS Policies for Payments
CREATE POLICY "Users can view payments in their organization"
  ON payments FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = payments.organization_id
  ));

CREATE POLICY "Accountants can insert payments"
  ON payments FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'receptionist', 'accountant')
    AND profiles.organization_id = payments.organization_id
  ));

-- RLS Policies for X-Ray Files
CREATE POLICY "Users can view xray files in their organization"
  ON xray_files FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = xray_files.organization_id
  ));

CREATE POLICY "X-ray technicians can upload files"
  ON xray_files FOR INSERT
  WITH CHECK (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'xray_technician', 'doctor')
    AND profiles.organization_id = xray_files.organization_id
  ));

CREATE POLICY "X-ray technicians can update their files"
  ON xray_files FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'xray_technician')
    AND profiles.organization_id = xray_files.organization_id
  ));

-- RLS Policies for Audit Logs
CREATE POLICY "Users can view audit logs in their organization"
  ON audit_logs FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = audit_logs.organization_id
  ));
