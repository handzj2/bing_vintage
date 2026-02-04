// clientFormAdapter.ts
import { ClientFormModel } from '@/services/ClientFormModel';

// ✅ Transform FLAT database fields → NESTED form structure
export const toClientFormModel = (dbData: any): ClientFormModel => {
  if (!dbData) {
    console.warn('⚠️ Adapter: No data provided to toClientFormModel');
    return getEmptyClient();
  }

  console.log('🔧 Adapter transforming flat → nested:', {
    rawData: dbData,
    addressField: dbData.address,
    cityField: dbData.city,
    nextOfKinName: dbData.nextOfKinName,
    bankName: dbData.bankName
  });

  // Handle date formatting
  let formattedDateOfBirth = '';
  if (dbData.dateOfBirth) {
    const date = new Date(dbData.dateOfBirth);
    if (!isNaN(date.getTime())) {
      formattedDateOfBirth = date.toISOString().split('T')[0];
    }
  }

  // Generate full name from first and last
  const fullName = dbData.fullName || `${dbData.firstName || ''} ${dbData.lastName || ''}`.trim();

  return {
    id: dbData.id ? String(dbData.id) : '',
    full_name: fullName,
    first_name: dbData.firstName || '',
    last_name: dbData.lastName || '',
    phone: dbData.phone || '',
    email: dbData.email || '',
    nin: dbData.nin || dbData.idNumber || '',
    date_of_birth: formattedDateOfBirth,
    gender: mapGenderToForm(dbData.gender),
    marital_status: mapMaritalStatusToForm(dbData.maritalStatus),
    occupation: dbData.occupation || '',
    monthly_income: parseFloat(dbData.monthlyIncome) || 0,
    employment_status: mapEmploymentStatusToForm(dbData.employmentStatus),
    
    // ✅ CRITICAL: Map flat address fields to nested structure
    address: {
      street: dbData.address || '',
      city: dbData.city || '',
      state: dbData.state || '',
      postal_code: dbData.postalCode || dbData.postal_code || '',
      country: dbData.country || 'Uganda'
    },
    
    employment: {
      employer_name: dbData.businessName || dbData.employer_name || '',
      employer_phone: dbData.employer_phone || '',
      employment_type: mapEmploymentStatusToForm(dbData.employmentStatus),
      years_employed: parseFloat(dbData.years_employed) || 0,
      monthly_income: parseFloat(dbData.monthlyIncome) || 0
    },
    
    business: {
      name: dbData.businessName || '',
      type: dbData.businessType || '',
      address: dbData.businessAddress || ''
    },
    
    // ✅ CRITICAL: Map flat kin fields to nested structure
    kin: {
      name: dbData.nextOfKinName || dbData.kin_name || '',
      phone: dbData.nextOfKinPhone || dbData.kin_phone || '',
      relationship: dbData.nextOfKinRelationship || dbData.kin_relationship || '',
      address: dbData.kin_address || ''
    },
    
    // ✅ CRITICAL: Map flat bank fields to nested structure
    bank_details: {
      bank_name: dbData.bankName || dbData.bank_name || '',
      account_number: dbData.accountNumber || dbData.account_number || '',
      account_name: dbData.accountName || `${dbData.firstName || ''} ${dbData.lastName || ''}`.trim(),
      branch: dbData.bankBranch || dbData.branch || ''
    },
    
    justification: dbData.justification || '',
    alt_phone: dbData.alt_phone || '',
    reference1_name: dbData.reference1_name || '',
    reference1_phone: dbData.reference1_phone || '',
    reference2_name: dbData.reference2_name || '',
    reference2_phone: dbData.reference2_phone || ''
  };
};

// ✅ Transform NESTED form structure → FLAT database fields
export const fromClientFormModel = (formData: ClientFormModel): any => {
  if (!formData) {
    console.warn('⚠️ Adapter: No form data provided to fromClientFormModel');
    return {};
  }

  console.log('🔧 Adapter transforming nested → flat:', {
    formData,
    address: formData.address,
    kin: formData.kin,
    bank_details: formData.bank_details
  });

  return {
    // Basic fields
    id: formData.id ? parseInt(formData.id) : undefined,
    firstName: formData.first_name,
    lastName: formData.last_name,
    fullName: formData.full_name,
    email: formData.email,
    phone: formData.phone,
    
    // ✅ CRITICAL: Map nested address back to flat fields
    address: formData.address?.street || '',
    city: formData.address?.city || '',
    state: formData.address?.state || '',
    country: formData.address?.country || 'Uganda',
    postalCode: formData.address?.postal_code || '',
    
    // Identification
    nin: formData.nin,
    idNumber: formData.nin, // Map NIN to idNumber for API
    
    // Employment
    occupation: formData.occupation,
    employmentStatus: mapEmploymentStatusToApi(formData.employment_status),
    monthlyIncome: formData.monthly_income?.toString() || '0',
    
    // ✅ CRITICAL: Map nested business fields
    businessName: formData.business?.name || '',
    businessType: formData.business?.type || '',
    businessAddress: formData.business?.address || '',
    
    // ✅ CRITICAL: Map nested bank details back to flat fields
    bankName: formData.bank_details?.bank_name || '',
    accountNumber: formData.bank_details?.account_number || '',
    bankBranch: formData.bank_details?.branch || '',
    accountName: formData.bank_details?.account_name || '',
    
    // ✅ CRITICAL: Map nested kin back to flat fields
    nextOfKinName: formData.kin?.name || '',
    nextOfKinPhone: formData.kin?.phone || '',
    nextOfKinRelationship: formData.kin?.relationship || '',
    
    // Personal details
    dateOfBirth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : null,
    gender: mapGenderToApi(formData.gender),
    maritalStatus: mapMaritalStatusToApi(formData.marital_status),
    
    // Additional fields
    justification: formData.justification || '',
    alt_phone: formData.alt_phone || '',
    reference1_name: formData.reference1_name || '',
    reference1_phone: formData.reference1_phone || '',
    reference2_name: formData.reference2_name || '',
    reference2_phone: formData.reference2_phone || '',
    
    // Maintain existing fields if any
    nationality: 'Ugandan', // Default
    status: 'active',
    verified: true,
    verificationMethod: 'NIN'
  };
};

// Helper function for empty client
const getEmptyClient = (): ClientFormModel => ({
  id: '',
  full_name: '',
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  nin: '',
  date_of_birth: '',
  gender: 'male',
  marital_status: 'single',
  occupation: '',
  monthly_income: 0,
  employment_status: 'self_employed',
  address: { street: '', city: '', state: '', postal_code: '', country: 'Uganda' },
  employment: { employer_name: '', employer_phone: '', employment_type: 'self_employed', years_employed: 0, monthly_income: 0 },
  business: { name: '', type: '', address: '' },
  kin: { name: '', phone: '', relationship: '', address: '' },
  bank_details: { bank_name: '', account_number: '', account_name: '', branch: '' },
  justification: '',
  alt_phone: '',
  reference1_name: '',
  reference1_phone: '',
  reference2_name: '',
  reference2_phone: ''
});

// Helper mapping functions
const mapGenderToForm = (gender: string): 'male' | 'female' | 'other' => {
  if (!gender) return 'male';
  const lower = gender.toLowerCase();
  if (lower === 'male' || lower === 'female') return lower;
  return 'other';
};

const mapGenderToApi = (gender: string): string => {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const mapMaritalStatusToForm = (status: string): 'single' | 'married' | 'divorced' | 'widowed' => {
  if (!status) return 'single';
  const lower = status.toLowerCase();
  if (['single', 'married', 'divorced', 'widowed'].includes(lower)) {
    return lower as any;
  }
  return 'single';
};

const mapMaritalStatusToApi = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const mapEmploymentStatusToForm = (status: string): 'salaried' | 'self_employed' | 'part_time' | 'unemployed' => {
  if (!status) return 'self_employed';
  const lower = status.toLowerCase();
  
  if (lower.includes('self') || lower.includes('employed')) return 'self_employed';
  if (lower.includes('salary') || lower.includes('full')) return 'salaried';
  if (lower.includes('part') || lower.includes('time')) return 'part_time';
  if (lower.includes('unemployed')) return 'unemployed';
  
  return 'self_employed';
};

const mapEmploymentStatusToApi = (status: string): string => {
  switch (status) {
    case 'self_employed': return 'Self-employed';
    case 'salaried': return 'Salaried';
    case 'part_time': return 'Part Time';
    case 'unemployed': return 'Unemployed';
    default: return 'Self-employed';
  }
};

// For backward compatibility
export const clientToFormValues = toClientFormModel;
export const formValuesToClient = fromClientFormModel;