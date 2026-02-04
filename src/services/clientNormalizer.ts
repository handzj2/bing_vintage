// src/services/clientNormalizer.ts

export interface BackendClient {
  id: string;

  // Names
  fullName?: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;

  // Contact
  phone?: string;
  email?: string;

  // Identification
  ninNumber?: string;
  nin?: string;
  idNumber?: string;

  // Personal
  dateOfBirth?: string;
  date_of_birth?: string;
  gender?: string;
  maritalStatus?: string;
  marital_status?: string;

  // Address
  address?: string;
  physical_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  postal_code?: string;

  // Employment / Income
  occupation?: string;
  business_name?: string;
  employment_status?: string;
  monthly_income?: number;
  monthlyIncome?: number;

  // Next of kin
  nextOfKinName?: string;
  next_of_kin_name?: string;
  nextOfKinPhone?: string;
  next_of_kin_phone?: string;
  nextOfKinRelationship?: string;
  next_of_kin_relationship?: string;

  // Bank
  bankName?: string;
  bank_name?: string;
  accountNumber?: string;
  account_number?: string;
  bankBranch?: string;
  bank_branch?: string;

  // System
  status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export function normalizeClient(backend: BackendClient): any {
  // ---------- NAME NORMALIZATION ----------
  const fullName =
    backend.fullName ||
    backend.full_name ||
    `${backend.firstName || ''} ${backend.lastName || ''}`.trim();

  const nameParts = fullName
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ');

  const firstName = backend.firstName || nameParts[0] || 'Unknown';
  const lastName =
    backend.lastName || nameParts.slice(1).join(' ') || 'Client';

  // ---------- MONTHLY INCOME (SAFE) ----------
  const monthlyIncome =
    backend.monthly_income ??
    backend.monthlyIncome ??
    0;

  // ---------- OCCUPATION ----------
  const occupation =
    backend.occupation ||
    backend.business_name ||
    'Not provided';

  return {
    // ---------- CORE ----------
    id: backend.id,
    fullName,

    first_name: firstName,
    last_name: lastName,

    // ---------- CONTACT ----------
    phone: backend.phone,
    email: backend.email,

    // ---------- IDENTIFICATION ----------
    id_type: 'National ID',
    id_number:
      backend.ninNumber ||
      backend.nin ||
      backend.idNumber ||
      '',

    // ---------- PERSONAL ----------
    date_of_birth:
      backend.dateOfBirth || backend.date_of_birth,
    gender: backend.gender,
    marital_status:
      backend.maritalStatus || backend.marital_status,

    // ---------- FLAT FIELDS (LEGACY + KYC) ----------
    occupation,
    monthly_income: monthlyIncome,

    // ---------- ADDRESS (NESTED) ----------
    address: {
      street:
        backend.address ||
        backend.physical_address ||
        '',
      city: backend.city || '',
      state:
        backend.state ||
        backend.city ||
        'Central',
      postal_code:
        backend.postalCode || backend.postal_code || '',
      country: backend.country || 'Uganda'
    },

    // ---------- EMPLOYMENT (NESTED) ----------
    employment: {
      employer_name: occupation,
      employment_type:
        backend.employment_status || 'Not provided',
      monthly_income: monthlyIncome,
      years_employed: 0
    },

    // ---------- NEXT OF KIN ----------
    kin: {
      name:
        backend.next_of_kin_name ||
        backend.nextOfKinName ||
        '',
      relationship:
        backend.next_of_kin_relationship ||
        backend.nextOfKinRelationship ||
        '',
      phone:
        backend.next_of_kin_phone ||
        backend.nextOfKinPhone ||
        '',
      address:
        backend.address ||
        backend.physical_address ||
        'Not provided'
    },

    // ---------- BANK ----------
    bank_details: {
      bank_name:
        backend.bank_name || backend.bankName || '',
      account_number:
        backend.account_number ||
        backend.accountNumber ||
        '',
      branch:
        backend.bank_branch ||
        backend.bankBranch ||
        ''
    },

    // ---------- SYSTEM ----------
    status: backend.status || 'active',
    created_at:
      backend.createdAt || backend.created_at,
    updated_at:
      backend.updatedAt || backend.updated_at
  };
}
