// Mock data for the dental clinic management system
export interface MockPatient {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  city: string
  postal_code: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_history: string
  dental_history: string
  allergies: string
  current_medications: string
  is_active: boolean
  branch_id: string
  card_id?: string // Add card_id field
  assigned_doctor_id?: string // Add assigned doctor field
  created_at: string
  updated_at: string
}

export interface MockDoctor {
  id: string
  user_id: string
  first_name: string
  last_name:string
  license_number: string
  specialties: string[]
  qualifications: string
  experience_years: number
  is_active: boolean
  profile_picture_url: string
  branch_id: string
  created_at: string
  updated_at: string
}

export interface MockXRayRequest {
  id: string
  patient_id: string
  treatment_id: string
  doctor_id: string
  branch_id: string
  status: 'requested' | 'completed'
  requested_at: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MockService {
  id: string
  name: string
  description: string
  price: number
  is_active: boolean
  branch_id: string
  created_at: string
  updated_at: string
}

export interface MockTreatment {
  id: string
  patient_id: string
  doctor_id: string
  branch_id: string
  status: string
  treatment_date: string
  notes: string
  total_cost: number
  created_at: string
  updated_at: string
}

export interface MockTreatmentService {
  id: string
  treatment_id: string
  service_id: string
  quantity: number
  price_at_time: number
  created_at: string
}

export interface MockInvoice {
  id: string
  invoice_number: string
  patient_id: string
  doctor_id: string
  branch_id: string
  treatment_id: string
  subtotal: number
  tax: number
  discount: number
  total_amount: number
  amount_paid: number
  balance_remaining: number
  status: string
  invoice_date: string
  due_date: string
  created_at: string
  updated_at: string
}

export interface MockPayment {
  id: string
  invoice_id: string
  amount: number
  payment_method: string
  payment_date: string
  notes: string
  created_by: string
  created_at: string
}

export interface MockXRayFile {
  id: string
  patient_id: string
  uploaded_by: string
  file_type: string
  file_url: string
  file_size: number
  description: string
  treatment_id: string
  is_active: boolean
  branch_id: string
  created_at: string
  updated_at: string
}

export interface MockVisit {
  id: string
  patient_id: string
  doctor_id: string
  branch_id: string
  visit_date: string
  notes: string
  created_at: string
  updated_at: string
}

export interface MockBranch {
  id: string
  name: string
  address: string
  phone: string
  email: string
  opening_time: string
  closing_time: string
  is_active: boolean
  organization_id: string
  created_at: string
  updated_at: string
}

export interface MockEmployee {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  branch_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Helper function to generate card IDs
export function genCardId(existingIds = new Set()) {
  let id;
  do {
    id = Math.floor(10000000 + Math.random() * 90000000).toString();
  } while (existingIds.has(id));
  return id;
}

// Helper function to get visible patients by branch and doctor
export function getVisiblePatients({ role, userId, selectedBranchId, mockPatients }: { 
  role: string; 
  userId: string; 
  selectedBranchId: string; 
  mockPatients: MockPatient[] 
}) {
  let patients = mockPatients.filter(p => p.branch_id === selectedBranchId);
  if (role === 'doctor') {
    // Filter by assigned doctor using the assigned_doctor_id field
    const doctorId = `doctor-${userId.split('-')[1] || '1'}`;
    patients = patients.filter(p => p.assigned_doctor_id === doctorId);
  }
  return patients;
}

// Helper function to get visible doctors by branch
export function getVisibleDoctors({ selectedBranchId, mockDoctors }: { 
  selectedBranchId: string; 
  mockDoctors: MockDoctor[] 
}) {
  return mockDoctors.filter(d => d.branch_id === selectedBranchId);
}

// Helper function to get visible visits by branch
export function getVisibleVisits({ selectedBranchId, mockVisits }: { 
  selectedBranchId: string; 
  mockVisits: MockVisit[] 
}) {
  return mockVisits.filter(v => v.branch_id === selectedBranchId);
}

// Helper function to get visible invoices by branch
export function getVisibleInvoices({ selectedBranchId, mockInvoices }: { 
  selectedBranchId: string; 
  mockInvoices: MockInvoice[] 
}) {
  return mockInvoices.filter(i => i.branch_id === selectedBranchId);
}

// Helper function to get visible services by branch
export function getVisibleServices({ selectedBranchId, mockServices }: { 
  selectedBranchId: string; 
  mockServices: MockService[] 
}) {
  return mockServices.filter(s => s.branch_id === selectedBranchId);
}

// Helper function to get visible treatments by branch
export function getVisibleTreatments({ selectedBranchId, mockTreatments }: { 
  selectedBranchId: string; 
  mockTreatments: MockTreatment[] 
}) {
  return mockTreatments.filter(t => t.branch_id === selectedBranchId);
}

// Helper function to get visible X-ray files by branch
export function getVisibleXRayFiles({ selectedBranchId, mockXRayFiles }: { 
  selectedBranchId: string; 
  mockXRayFiles: MockXRayFile[] 
}) {
  return mockXRayFiles.filter(x => x.branch_id === selectedBranchId);
}

// Mock data
export const mockBranches: MockBranch[] = [
  {
    id: "branch-1",
    name: "Benas Dental Clinic",
    address: "123 Menelik Boulevard, Addis Ababa",
    phone: "+251 11 123 4567",
    email: "main@benasdental.com",
    opening_time: "08:00",
    closing_time: "18:00",
    is_active: true,
    organization_id: "org-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "branch-2",
    name: "Benas Westside Branch",
    address: "456 Unity Avenue, Bahirdar",
    phone: "+251 11 987 6543",
    email: "westside@benasdental.com",
    opening_time: "09:00",
    closing_time: "17:00",
    is_active: true,
    organization_id: "org-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "branch-3",
    name: "Benas North Plaza",
    address: "789 Peace Boulevard, Dire Dawa",
    phone: "+251 11 456 7890",
    email: "north@benasdental.com",
    opening_time: "07:00",
    closing_time: "19:00",
    is_active: true,
    organization_id: "org-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  }
]

export const mockDoctors: MockDoctor[] = [
  {
    id: "doctor-1",
    user_id: "user-1",
    first_name: "Abebe",
    last_name: "Kebede",
    license_number: "DOC12345",
    specialties: ["General Dentistry", "Cosmetic Dentistry"],
    qualifications: "DDS, MS in Orthodontics",
    experience_years: 10,
    is_active: true,
    profile_picture_url: "",
    branch_id: "branch-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "doctor-2",
    user_id: "user-2",
    first_name: "Alem",
    last_name: "Tesfaye",
    license_number: "DOC67890",
    specialties: ["Orthodontics", "Pediatric Dentistry"],
    qualifications: "DMD, Certificate in Pediatric Dentistry",
    experience_years: 8,
    is_active: true,
    profile_picture_url: "",
    branch_id: "branch-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "doctor-3",
    user_id: "user-3",
    first_name: "Mekonnen",
    last_name: "Girma",
    license_number: "DOC11111",
    specialties: ["Oral Surgery", "Periodontics"],
    qualifications: "DMD, MD in Oral Surgery",
    experience_years: 15,
    is_active: true,
    profile_picture_url: "",
    branch_id: "branch-2",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  }
];


// Generate card IDs for patients
const patientCardIds = new Set<string>();
const generateUniqueCardId = () => {
  let id;
  do {
    id = genCardId(patientCardIds);
  } while (patientCardIds.has(id));
  patientCardIds.add(id);
  return id;
};

export const mockPatients: MockPatient[] = [
  {
    id: "patient-1",
    first_name: "Kebede",
    last_name: "Alemu",
    email: "kebede.alemu@example.com",
    phone: "+251 91 111 2222",
    date_of_birth: "1985-06-15",
    gender: "male",
    address: "789 Unity Street",
    city: "Addis Ababa",
    postal_code: "1000",
    emergency_contact_name: "Aster Alemu",
    emergency_contact_phone: "+251 91 111 3333",
    medical_history: "No major health issues",
    dental_history: "Regular cleanings, one filling",
    allergies: "Penicillin",
    current_medications: "Blood pressure medication",
    is_active: true,
    branch_id: "branch-1",
    card_id: generateUniqueCardId(),
    assigned_doctor_id: "doctor-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "patient-2",
    first_name: "Aster",
    last_name: "Mengistu",
    email: "aster.mengistu@example.com",
    phone: "+251 91 222 3333",
    date_of_birth: "1990-03-22",
    gender: "female",
    address: "456 Menelik Avenue",
    city: "Bahirdar",
    postal_code: "2000",
    emergency_contact_name: "Mekonnen Mengistu",
    emergency_contact_phone: "+251 91 222 4444",
    medical_history: "Asthma",
    dental_history: "Braces for 2 years",
    allergies: "None",
    current_medications: "Inhaler",
    is_active: true,
    branch_id: "branch-1",
    card_id: generateUniqueCardId(),
    assigned_doctor_id: "doctor-2",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "patient-3",
    first_name: "Mekonnen",
    last_name: "Worku",
    email: "mekonnen.worku@example.com",
    phone: "+251 91 333 4444",
    date_of_birth: "1978-11-08",
    gender: "male",
    address: "123 Peace Road",
    city: "Dire Dawa",
    postal_code: "3000",
    emergency_contact_name: "Sara Worku",
    emergency_contact_phone: "+251 91 333 5555",
    medical_history: "Diabetes",
    dental_history: "Multiple fillings, crown",
    allergies: "Latex",
    current_medications: "Insulin, Blood pressure medication",
    is_active: true,
    branch_id: "branch-2",
    card_id: generateUniqueCardId(),
    assigned_doctor_id: "doctor-3",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "patient-4",
    first_name: "Sara",
    last_name: "Girma",
    email: "sara.girma@example.com",
    phone: "+251 91 444 5555",
    date_of_birth: "1988-12-15",
    gender: "female",
    address: "789 Freedom Street",
    city: "Addis Ababa",
    postal_code: "1000",
    emergency_contact_name: "James Girma",
    emergency_contact_phone: "+251 91 444 6666",
    medical_history: "No major health issues",
    dental_history: "Regular cleanings",
    allergies: "None",
    current_medications: "None",
    is_active: true,
    branch_id: "branch-1",
    card_id: generateUniqueCardId(),
    assigned_doctor_id: "doctor-2",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  }
]

export const mockServices: MockService[] = [
  {
    id: "service-1",
    name: "Dental Cleaning",
    description: "Professional teeth cleaning and polishing",
    price: 750.00,
    is_active: true,
    branch_id: "branch-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "service-2",
    name: "Tooth Extraction",
    description: "Removal of damaged or problematic tooth",
    price: 2000.00,
    is_active: true,
    branch_id: "branch-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "service-3",
    name: "Teeth Whitening",
    description: "Professional teeth whitening treatment",
    price: 3000.00,
    is_active: true,
    branch_id: "branch-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "service-4",
    name: "Dental Filling",
    description: "Filling of cavities with composite material",
    price: 1200.00,
    is_active: true,
    branch_id: "branch-2",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "service-5",
    name: "Root Canal",
    description: "Treatment for infected tooth pulp",
    price: 8000.00,
    is_active: true,
    branch_id: "branch-2",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  }
]

export const mockTreatments: MockTreatment[] = [
  {
    id: "treatment-1",
    patient_id: "patient-1",
    doctor_id: "doctor-1",
    branch_id: "branch-1",
    status: "completed",
    treatment_date: "2023-06-15T10:00:00Z",
    notes: "Routine cleaning and examination",
    total_cost: 750.00,
    created_at: "2023-06-15T10:00:00Z",
    updated_at: "2023-06-15T10:00:00Z"
  },
  {
    id: "treatment-2",
    patient_id: "patient-2",
    doctor_id: "doctor-2",
    branch_id: "branch-1",
    status: "completed",
    treatment_date: "2023-06-16T14:00:00Z",
    notes: "Braces adjustment",
    total_cost: 1500.00,
    created_at: "2023-06-16T14:00:00Z",
    updated_at: "2023-06-16T14:00:00Z"
  },
  {
    id: "treatment-3",
    patient_id: "patient-4",
    doctor_id: "doctor-2",
    branch_id: "branch-1",
    status: "pending",
    treatment_date: "2023-06-20T10:00:00Z",
    notes: "Initial consultation and examination",
    total_cost: 1000.00,
    created_at: "2023-06-20T10:00:00Z",
    updated_at: "2023-06-20T10:00:00Z"
  }
]

export const mockTreatmentServices: MockTreatmentService[] = [
  {
    id: "ts-1",
    treatment_id: "treatment-1",
    service_id: "service-1",
    quantity: 1,
    price_at_time: 750.00,
    created_at: "2023-06-15T10:00:00Z"
  },
  {
    id: "ts-2",
    treatment_id: "treatment-2",
    service_id: "service-1",
    quantity: 1,
    price_at_time: 750.00,
    created_at: "2023-06-16T14:00:00Z"
  },
  {
    id: "ts-3",
    treatment_id: "treatment-2",
    service_id: "service-3",
    quantity: 1,
    price_at_time: 3000.00,
    created_at: "2023-06-16T14:00:00Z"
  },
  {
    id: "ts-4",
    treatment_id: "treatment-3",
    service_id: "service-1",
    quantity: 1,
    price_at_time: 750.00,
    created_at: "2023-06-20T10:00:00Z"
  }
]

export const mockInvoices: MockInvoice[] = [
  {
    id: "invoice-1",
    invoice_number: "INV-2023-001",
    patient_id: "patient-1",
    doctor_id: "doctor-1",
    branch_id: "branch-1",
    treatment_id: "treatment-1",
    subtotal: 750.00,
    tax: 75.00,
    discount: 0.00,
    total_amount: 825.00,
    amount_paid: 825.00,
    balance_remaining: 0.00,
    status: "paid",
    invoice_date: "2023-06-15T10:00:00Z",
    due_date: "2023-07-15T10:00:00Z",
    created_at: "2023-06-15T10:00:00Z",
    updated_at: "2023-06-15T10:00:00Z"
  },
  {
    id: "invoice-2",
    invoice_number: "INV-2023-002",
    patient_id: "patient-2",
    doctor_id: "doctor-2",
    branch_id: "branch-1",
    treatment_id: "treatment-2",
    subtotal: 3750.00,
    tax: 375.00,
    discount: 0.00,
    total_amount: 4125.00,
    amount_paid: 2000.00,
    balance_remaining: 2125.00,
    status: "partial",
    invoice_date: "2023-06-16T14:00:00Z",
    due_date: "2023-07-16T14:00:00Z",
    created_at: "2023-06-16T14:00:00Z",
    updated_at: "2023-06-16T14:00:00Z"
  },
  {
    id: "invoice-3",
    invoice_number: "INV-2023-003",
    patient_id: "patient-4",
    doctor_id: "doctor-2",
    branch_id: "branch-1",
    treatment_id: "treatment-3",
    subtotal: 750.00,
    tax: 75.00,
    discount: 0.00,
    total_amount: 825.00,
    amount_paid: 0.00,
    balance_remaining: 825.00,
    status: "unpaid",
    invoice_date: "2023-06-20T10:00:00Z",
    due_date: "2023-07-20T10:00:00Z",
    created_at: "2023-06-20T10:00:00Z",
    updated_at: "2023-06-20T10:00:00Z"
  }
]

export const mockPayments: MockPayment[] = [
  {
    id: "payment-1",
    invoice_id: "invoice-1",
    amount: 825.00,
    payment_method: "credit_card",
    payment_date: "2023-06-15T10:30:00Z",
    notes: "Full payment",
    created_by: "user-4",
    created_at: "2023-06-15T10:30:00Z"
  },
  {
    id: "payment-2",
    invoice_id: "invoice-2",
    amount: 2000.00,
    payment_method: "cash",
    payment_date: "2023-06-16T14:30:00Z",
    notes: "Partial payment",
    created_by: "user-4",
    created_at: "2023-06-16T14:30:00Z"
  }
]

export const mockXRayRequests: MockXRayRequest[] = [
  {
    id: "xray-request-1",
    patient_id: "patient-3",
    treatment_id: "treatment-3",
    doctor_id: "doctor-2",
    branch_id: "branch-1",
    status: "requested",
    requested_at: "2023-06-20T09:00:00Z",
    created_at: "2023-06-20T09:00:00Z",
    updated_at: "2023-06-20T09:00:00Z"
  }
]

export const mockXRayFiles: MockXRayFile[] = [
  {
    id: "xray-1",
    patient_id: "patient-1",
    uploaded_by: "user-5",
    file_type: "xray",
    file_url: "https://placehold.co/600x800?text=Mock+Xray+1",
    file_size: 2048000,
    description: "Pre-treatment X-ray of upper molars",
    treatment_id: "treatment-1",
    is_active: true,
    branch_id: "branch-1",
    created_at: "2023-06-15T09:30:00Z",
    updated_at: "2023-06-15T09:30:00Z"
  },
  {
    id: "xray-2",
    patient_id: "patient-2",
    uploaded_by: "user-5",
    file_type: "scan",
    file_url: "https://placehold.co/600x800?text=Mock+Xray+2",
    file_size: 3072000,
    description: "3D scan for braces planning",
    treatment_id: "treatment-2",
    is_active: true,
    branch_id: "branch-1",
    created_at: "2023-06-16T13:30:00Z",
    updated_at: "2023-06-16T13:30:00Z"
  }
]

export const mockVisits: MockVisit[] = [
  {
    id: "visit-1",
    patient_id: "patient-1",
    doctor_id: "doctor-1",
    branch_id: "branch-1",
    visit_date: "2023-06-15T10:00:00Z",
    notes: "Annual checkup",
    created_at: "2023-06-15T10:00:00Z",
    updated_at: "2023-06-15T10:00:00Z"
  },
  {
    id: "visit-2",
    patient_id: "patient-2",
    doctor_id: "doctor-2",
    branch_id: "branch-1",
    visit_date: "2023-06-16T14:00:00Z",
    notes: "Monthly braces checkup",
    created_at: "2023-06-16T14:00:00Z",
    updated_at: "2023-06-16T14:00:00Z"
  },
  {
    id: "visit-3",
    patient_id: "patient-4",
    doctor_id: "doctor-2",
    branch_id: "branch-1",
    visit_date: "2023-06-20T10:00:00Z",
    notes: "Initial consultation",
    created_at: "2023-06-20T10:00:00Z",
    updated_at: "2023-06-20T10:00:00Z"
  }
]

export const mockEmployees: MockEmployee[] = [
  {
    id: "emp-1",
    first_name: "Amina",
    last_name: "Mohammed",
    email: "amina.admin@benasdental.com",
    phone: "+251 11 111 1111",
    role: "admin",
    branch_id: "branch-1",
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "emp-2",
    first_name: "Berhan",
    last_name: "Tekle",
    email: "berhan.receptionist@benasdental.com",
    phone: "+251 11 222 2222",
    role: "receptionist",
    branch_id: "branch-1",
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "emp-3",
    first_name: "Chala",
    last_name: "Bekele",
    email: "chala.accountant@benasdental.com",
    phone: "+251 11 333 3333",
    role: "accountant",
    branch_id: "branch-1",
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "emp-4",
    first_name: "Dagmawi",
    last_name: "Lemma",
    email: "dagmawi.xray@benasdental.com",
    phone: "+251 11 444 4444",
    role: "xray_technician",
    branch_id: "branch-1",
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "emp-5",
    first_name: "Elsa",
    last_name: "Tadesse",
    email: "elsa.manager@benasdental.com",
    phone: "+251 11 555 5555",
    role: "branch_manager",
    branch_id: "branch-2",
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  }
]