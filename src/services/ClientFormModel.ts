const EMPTY_CLIENT_FORM: ClientFormModel = {
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

  address: {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Uganda'
  },

  employment: {
    employer_name: '',
    employer_phone: '',
    employment_type: 'self_employed',
    years_employed: 0,
    monthly_income: 0
  },

  business: {
    name: '',
    type: '',
    address: ''
  },

  kin: {
    name: '',
    phone: '',
    relationship: '',
    address: ''
  },

  bank_details: {
    bank_name: '',
    account_number: '',
    account_name: '',
    branch: ''
  },

  justification: '',
  alt_phone: '',
  reference1_name: '',
  reference1_phone: '',
  reference2_name: '',
  reference2_phone: ''
};
