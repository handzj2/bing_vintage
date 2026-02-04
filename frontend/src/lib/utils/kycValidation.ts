import { Client } from '@/lib/api/types';

/**
 * Calculate KYC completion percentage for a client
 */
export const getKYCProgress = (client: Client): number => {
  if (!client) return 0;
  
  let completedFields = 0;
  const totalFields = 24; // Total required fields for complete KYC
  
  // Basic Info (10 required fields)
  const basicFields = [
    client.first_name, client.last_name, client.email, client.phone,
    client.id_number, client.date_of_birth, client.gender, client.marital_status,
    client.occupation, client.monthly_income
  ];
  
  completedFields += basicFields.filter(field => 
    field !== undefined && field !== null && field !== '' && field !== 0
  ).length;
  
  // Address (3 required fields)
  if (client.address) {
    const addressFields = [
      client.address.street, client.address.city, client.address.state
    ];
    completedFields += addressFields.filter(field => 
      field !== undefined && field !== null && field !== ''
    ).length;
  } else {
    // Address object missing counts as 0
  }
  
  // Employment (3 required fields)
  if (client.employment) {
    const employmentFields = [
      client.employment.employer_name, 
      client.employment.employment_type,
      client.employment.years_employed
    ];
    completedFields += employmentFields.filter(field => 
      field !== undefined && field !== null && field !== '' && field !== 0
    ).length;
  }
  
  // Next of Kin (4 fields)
  if (client.kin) {
    const kinFields = [
      client.kin.name, client.kin.relationship,
      client.kin.phone, client.kin.address
    ];
    completedFields += kinFields.filter(field => 
      field !== undefined && field !== null && field !== ''
    ).length;
  }
  
  // Bank Details (4 optional fields - don't count in total but count if present)
  if (client.bank_details) {
    const bankFields = [
      client.bank_details.bank_name, client.bank_details.account_number,
      client.bank_details.account_name, client.bank_details.branch
    ];
    // Optional fields, don't add to total but do add to completed if present
    completedFields += bankFields.filter(field => 
      field !== undefined && field !== null && field !== ''
    ).length;
  }
  
  return Math.min(100, Math.round((completedFields / totalFields) * 100));
};

/**
 * Check if client KYC is complete enough for loan eligibility
 * Threshold: 90% completion
 */
export const isClientKYCComplete = (client: Client): boolean => {
  return getKYCProgress(client) >= 90;
};

/**
 * Get list of missing required KYC fields for loan eligibility
 */
export const getMissingKYCFields = (client: Client): string[] => {
  const missing: string[] = [];
  
  if (!client) return ['Client data not available'];
  
  // Required for loan approval
  if (!client.first_name) missing.push('First Name');
  if (!client.last_name) missing.push('Last Name');
  if (!client.email) missing.push('Email');
  if (!client.phone) missing.push('Phone Number');
  if (!client.id_number) missing.push('ID Number');
  if (!client.date_of_birth) missing.push('Date of Birth');
  if (!client.occupation) missing.push('Occupation');
  if (!client.monthly_income || client.monthly_income === 0) missing.push('Monthly Income');
  if (!client.address?.street) missing.push('Street Address');
  if (!client.address?.city) missing.push('City');
  if (!client.address?.state) missing.push('State/County');
  if (!client.employment?.employer_name) missing.push('Employer Name');
  if (!client.employment?.employment_type) missing.push('Employment Type');
  if (!client.kin?.name) missing.push('Next of Kin Name');
  if (!client.kin?.relationship) missing.push('Next of Kin Relationship');
  if (!client.kin?.phone) missing.push('Next of Kin Phone');
  if (!client.kin?.address) missing.push('Next of Kin Address');
  
  return missing;
};

/**
 * Get KYC status object with color and text
 */
export const getKYCStatus = (client: Client): { 
  text: string; 
  color: string; 
  iconType: 'complete' | 'partial' | 'incomplete' 
} => {
  const progress = getKYCProgress(client);
  
  if (progress >= 90) {
    return { 
      text: 'KYC Complete', 
      color: 'bg-green-100 text-green-800 border-green-200',
      iconType: 'complete'
    };
  } else if (progress >= 50) {
    return { 
      text: 'KYC Partial', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      iconType: 'partial'
    };
  } else {
    return { 
      text: 'KYC Incomplete', 
      color: 'bg-red-100 text-red-800 border-red-200',
      iconType: 'incomplete'
    };
  }
};

/**
 * Check if client is eligible for a loan based on KYC
 */
export const isEligibleForLoan = (client: Client): { 
  eligible: boolean; 
  message: string; 
  missingFields: string[] 
} => {
  const missingFields = getMissingKYCFields(client);
  const eligible = missingFields.length === 0;
  
  return {
    eligible,
    message: eligible 
      ? 'Client is eligible for loan processing'
      : `Client needs ${missingFields.length} more KYC fields`,
    missingFields
  };
};

/**
 * NEW: Check KYC eligibility for specific loan type with business rules
 */
export const checkKYCEligibility = (client: Client | null, loanType: string): { 
  eligible: boolean; 
  message: string; 
  missingFields: string[];
  progress: number;
} => {
  if (!client) {
    return {
      eligible: false,
      message: 'No client selected',
      missingFields: [],
      progress: 0
    };
  }

  const progress = getKYCProgress(client);
  const missingFields = getMissingKYCFields(client);
  
  // Business rules for different loan types
  let eligible = false;
  let message = '';

  if (loanType === 'cash' && progress >= 100) {
    eligible = true;
    message = '✓ KYC complete - Eligible for cash loan';
  } else if (loanType === 'bike' && progress >= 90) {
    eligible = true;
    message = '✓ KYC complete - Eligible for bike loan';
  } else if (loanType === 'emergency' && progress >= 80) {
    eligible = true;
    message = '✓ KYC complete - Eligible for emergency loan';
  } else if (loanType === 'asset' && progress >= 85) {
    eligible = true;
    message = '✓ KYC complete - Eligible for asset loan';
  } else {
    const minRequired = loanType === 'cash' ? 100 : 
                       loanType === 'bike' ? 90 : 
                       loanType === 'emergency' ? 80 : 85;
    message = `✗ KYC ${progress}% complete. Minimum required: ${minRequired}%`;
  }

  return {
    eligible,
    message,
    missingFields,
    progress
  };
};

/**
 * NEW: Format field names for display
 */
export const formatFieldName = (field: string): string => {
  return field
    .replace(/_/g, ' ')
    .replace('.', ' - ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * NEW: Get KYC status for loan display
 */
export const getKYCStatusForLoan = (client: Client | null, loanType: string = 'cash') => {
  if (!client) {
    return {
      progress: 0,
      eligible: false,
      message: 'No client selected',
      status: 'No KYC Data',
      color: 'bg-gray-100 text-gray-800',
      minRequired: loanType === 'cash' ? 100 : loanType === 'bike' ? 90 : 80
    };
  }
  
  const progress = getKYCProgress(client);
  const eligibility = checkKYCEligibility(client, loanType);
  
  let status = 'KYC Incomplete';
  let color = 'bg-red-100 text-red-800';
  
  if (progress >= 90) {
    status = 'KYC Complete';
    color = 'bg-green-100 text-green-800';
  } else if (progress >= 70) {
    status = 'KYC Partial';
    color = 'bg-yellow-100 text-yellow-800';
  }
  
  const minRequired = loanType === 'cash' ? 100 : 
                     loanType === 'bike' ? 90 : 
                     loanType === 'emergency' ? 80 : 85;
  
  return {
    progress,
    eligible: eligibility.eligible,
    message: eligibility.message,
    status,
    color,
    minRequired,
    missingFields: eligibility.missingFields
  };
};

/**
 * Calculate KYC statistics for multiple clients
 */
export const calculateKYCStats = (clients: Client[]) => {
  const complete = clients.filter(client => getKYCProgress(client) >= 90).length;
  const partial = clients.filter(client => {
    const progress = getKYCProgress(client);
    return progress >= 50 && progress < 90;
  }).length;
  const incomplete = clients.filter(client => getKYCProgress(client) < 50).length;
  const averageProgress = Math.round(
    clients.reduce((sum, client) => sum + getKYCProgress(client), 0) / clients.length
  ) || 0;
  
  return {
    complete,
    partial,
    incomplete,
    averageProgress,
    total: clients.length
  };
};

/**
 * Helper to get formatted KYC status for display
 */
export const getFormattedKYCStatus = (client: Client) => {
  const progress = getKYCProgress(client);
  const status = getKYCStatus(client);
  
  return {
    progress,
    status: status.text,
    color: status.color,
    iconType: status.iconType,
    eligibleForLoan: isEligibleForLoan(client).eligible
  };
};

/**
 * Validate specific KYC section completion
 */
export const validateKYCSection = (client: Client, section: 'basic' | 'address' | 'employment' | 'kin' | 'bank') => {
  switch (section) {
    case 'basic':
      return {
        complete: !!(client.first_name && client.last_name && client.email && 
                    client.phone && client.id_number && client.date_of_birth && 
                    client.occupation && client.monthly_income),
        missing: getMissingKYCFields(client).filter(field => 
          ['First Name', 'Last Name', 'Email', 'Phone Number', 'ID Number', 
           'Date of Birth', 'Occupation', 'Monthly Income'].includes(field)
        )
      };
      
    case 'address':
      return {
        complete: !!(client.address?.street && client.address?.city && client.address?.state),
        missing: getMissingKYCFields(client).filter(field => 
          ['Street Address', 'City', 'State/County'].includes(field)
        )
      };
      
    case 'employment':
      return {
        complete: !!(client.employment?.employer_name && client.employment?.employment_type),
        missing: getMissingKYCFields(client).filter(field => 
          ['Employer Name', 'Employment Type'].includes(field)
        )
      };
      
    case 'kin':
      return {
        complete: !!(client.kin?.name && client.kin?.relationship && 
                    client.kin?.phone && client.kin?.address),
        missing: getMissingKYCFields(client).filter(field => 
          ['Next of Kin Name', 'Next of Kin Relationship', 
           'Next of Kin Phone', 'Next of Kin Address'].includes(field)
        )
      };
      
    case 'bank':
      return {
        complete: !!(client.bank_details?.bank_name && client.bank_details?.account_number &&
                    client.bank_details?.account_name && client.bank_details?.branch),
        missing: [], // Bank details are optional
        optional: true
      };
      
    default:
      return { complete: false, missing: [] };
  }
};