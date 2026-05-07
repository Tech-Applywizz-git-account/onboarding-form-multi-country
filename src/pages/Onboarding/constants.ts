// src/pages/Onboarding/constants.ts

export const COUNTRY_OPTIONS = [
  { label: "USA", value: "United States", code: "US", phoneCode: "+1" },
  { label: "UK", value: "United Kingdom", code: "GB", phoneCode: "+44" },
  { label: "Ireland", value: "Ireland", code: "IE", phoneCode: "+353" },
  { label: "Canada", value: "Canada", code: "CA", phoneCode: "+1" },
  { label: "India", value: "India", code: "IN", phoneCode: "+91" },
  { label: "Other", value: "Other", code: "OTHER", phoneCode: "" },
];

export const PHONE_CODES = [
  { label: "+1 (USA/CA)", value: "+1" },
  { label: "+44 (UK)", value: "+44" },
  { label: "+353 (IE)", value: "+353" },
  { label: "+91 (India)", value: "+91" },
];

export const CURRENCY_OPTIONS = [
  { label: "USD ($)", value: "USD", symbol: "$" },
  { label: "GBP (£)", value: "GBP", symbol: "£" },
  { label: "EUR (€)", value: "EUR", symbol: "€" },
  { label: "INR (₹)", value: "INR", symbol: "₹" },
  { label: "CAD (CA$)", value: "CAD", symbol: "CA$" },
  { label: "AUD (A$)", value: "AUD", symbol: "A$" },
  { label: "MKD (den)", value: "MKD", symbol: "den" },
  { label: "AED (د.إ)", value: "AED", symbol: "د.إ" },
  { label: "SAR (SR)", value: "SAR", symbol: "SR" },
  { label: "QAR (QR)", value: "QAR", symbol: "QR" },
  { label: "PKR (Rs)", value: "PKR", symbol: "Rs" },
  { label: "SGD (S$)", value: "SGD", symbol: "S$" },
];

export const COUNTRY_DATA: Record<string, { 
  visa_types: string[]; 
  salary_types: string[]; 
  currency: string; 
  currency_symbol: string;
  date_format: string;
}> = {
  "United States": {
    visa_types: ["F1-CPT", "F1-OPT", "F1-STEM OPT", "H1B", "H4 EAD", "Green Card", "Citizen", "J1", "L1", "Day-1 CPT"],
    salary_types: ["Yearly", "Hourly"],
    currency: "USD",
    currency_symbol: "$",
    date_format: "MM/DD/YYYY",
  },
  "United Kingdom": {
    visa_types: ["Skilled Worker Visa", "Graduate Visa", "Global Talent Visa", "Health and Care Worker Visa", "Student Visa", "Start-up Visa", "Innovator Visa", "Dependent Visa", "Indefinite Leave to Remain (ILR)", "British Citizen"],
    salary_types: ["Yearly", "Monthly"],
    currency: "GBP",
    currency_symbol: "£",
    date_format: "DD/MM/YYYY",
  },
  "Ireland": {
    visa_types: ["Stamp 1", "Stamp 1G", "Stamp 2", "Stamp 3", "Stamp 4", "Critical Skills Employment Permit", "General Employment Permit", "Dependent Visa", "Irish Citizen"],
    salary_types: ["Yearly", "Monthly"],
    currency: "EUR",
    currency_symbol: "€",
    date_format: "DD/MM/YYYY",
  },
  "Canada": {
    visa_types: ["Work Permit", "Study Permit", "Post-Graduation Work Permit (PGWP)", "Express Entry PR", "Provincial Nominee Program (PNP)", "Open Work Permit", "Dependent Visa", "Canadian Citizen"],
    salary_types: ["Yearly", "Hourly"],
    currency: "CAD",
    currency_symbol: "$",
    date_format: "DD/MM/YYYY",
  },
  "India": {
    visa_types: ["Citizen", "OCI Card Holder", "Work Permit", "Other"],
    salary_types: ["Yearly", "Monthly"],
    currency: "INR",
    currency_symbol: "₹",
    date_format: "DD/MM/YYYY",
  },
};

export const SALARY_RANGES: Record<string, Record<string, { label: string; value: string }[]>> = {
  "United States": {
    Yearly: [
      { label: "$40k - $60k", value: "40k-60k" },
      { label: "$60k - $80k", value: "60k-80k" },
      { label: "$80k - $100k", value: "80k-100k" },
      { label: "$100k - $130k", value: "100k-130k" },
      { label: "$130k - $160k", value: "130k-160k" },
      { label: "$160k+", value: "160k+" },
    ],
    Hourly: [
      { label: "$10 - $20", value: "10-20" },
      { label: "$20 - $40", value: "20-40" },
      { label: "$40 - $60", value: "40-60" },
      { label: "$60 - $80", value: "60-80" },
      { label: "$80 - $100", value: "80-100" },
      { label: "$100 - $150", value: "100-150" },
      { label: "$150 - $200", value: "150-200" },
      { label: "$200 - $300", value: "200-300" },
    ]
  },
  "United Kingdom": {
    Yearly: [
      { label: "£25k - £35k", value: "25k-35k" },
      { label: "£35k - £50k", value: "35k-50k" },
      { label: "£50k - £70k", value: "50k-70k" },
      { label: "£70k+", value: "70k+" },
    ],
    Monthly: [
      { label: "£2,000 - £3,000", value: "2000-3000" },
      { label: "£3,000 - £4,500", value: "3000-4500" },
      { label: "£4,500+", value: "4500+" },
    ]
  },
  "Ireland": {
    Yearly: [
      { label: "€30k - €45k", value: "30k-45k" },
      { label: "€45k - €60k", value: "45k-60k" },
      { label: "€60k - €80k", value: "60k-80k" },
      { label: "€80k+", value: "80k+" },
    ],
    Monthly: [
      { label: "€2,500 - €3,500", value: "2500-3500" },
      { label: "€3,500 - €5,000", value: "3500-5000" },
      { label: "€5,000+", value: "5000+" },
    ]
  },
  "Canada": {
    Yearly: [
      { label: "CA$50k - CA$70k", value: "50k-70k" },
      { label: "CA$70k - CA$90k", value: "70k-90k" },
      { label: "CA$90k - CA$120k", value: "90k-120k" },
      { label: "CA$120k+", value: "120k+" },
    ],
    Hourly: [
      { label: "CA$10 - CA$20", value: "10-20" },
      { label: "CA$20 - CA$40", value: "20-40" },
      { label: "CA$40 - CA$60", value: "40-60" },
      { label: "CA$60 - CA$80", value: "60-80" },
      { label: "CA$80 - CA$100", value: "80-100" },
      { label: "CA$100 - CA$150", value: "100-150" },
      { label: "CA$150 - CA$200", value: "150-200" },
      { label: "CA$200 - CA$300", value: "200-300" },
    ]
  },
};

export const jobRoleOptions = [
  { value: '.Net', label: '.Net' },
  { value: 'Actimize Developer', label: 'Actimize Developer' },
  { value: 'Active Directory', label: 'Active Directory' },
  { value: 'Agronomy Operations', label: 'Agronomy Operations' },
  { value: 'Anti Money Laundering (AML)', label: 'Anti Money Laundering (AML)' },
  { value: 'Big Data Engineer', label: 'Big Data Engineer' },
  { value: 'Biotechnology', label: 'Biotechnology' },
  { value: 'Biotechnology Internship', label: 'Biotechnology Internship' },
  { value: 'Business Analyst', label: 'Business Analyst' },
  { value: 'Business Intelligence Engineer', label: 'Business Intelligence Engineer' },
  { value: 'CLINICAL DATA ANALYST', label: 'CLINICAL DATA ANALYST' },
  { value: 'Cloud Engineer', label: 'Cloud Engineer' },
  { value: 'Clinical Research Coordinator', label: 'Clinical Research Coordinator' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Computer Science Internship', label: 'Computer Science Internship' },
  { value: 'Construction Management', label: 'Construction Management' },
  { value: 'CRM Sales', label: 'CRM Sales' },
  { value: 'CRM Specialist', label: 'CRM Specialist' },
  { value: 'Cyber security', label: 'Cyber security' },
  { value: 'Data Analyst', label: 'Data Analyst' },
  { value: 'Data Analyst Internships', label: 'Data Analyst Internships' },
  { value: 'Data Center Technician', label: 'Data Center Technician' },
  { value: 'Data Engineer', label: 'Data Engineer' },
  { value: 'Data Engineer (citizen/h4ead)', label: 'Data Engineer (citizen/h4ead)' },
  { value: 'Data science early grad', label: 'Data science early grad' },
  { value: 'Data Scientist', label: 'Data Scientist' },
  { value: 'Database Administration', label: 'Database Administration' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'DevOps Internships', label: 'DevOps Internships' },
  { value: 'Electrical Engineer', label: 'Electrical Engineer' },
  { value: 'Electrical Project', label: 'Electrical Project' },
  { value: 'Electronic Health Records (EHR)', label: 'Electronic Health Records (EHR)' },
  { value: 'Embedded software', label: 'Embedded software' },
  { value: 'Embedded Software Engineer', label: 'Embedded Software Engineer' },
  { value: 'Environmental Health and Safety (EHS)', label: 'Environmental Health and Safety (EHS)' },
].filter(role => !role.value.includes(',') && !role.value.toLowerCase().includes('for'));
export const RELIGIONS = [
  "Christianity",
  "Islam",
  "Hinduism",
  "Buddhism",
  "Sikhism",
  "Judaism",
  "Bahá'í",
  "Jainism",
  "Shinto",
  "No Religion (Atheist/Agnostic)",
  "Other",
];

export const CANADIAN_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Northwest Territories",
  "Nunavut",
  "Yukon",
];

export const UK_COUNTIES = [
  "Bedfordshire", "Berkshire", "Buckinghamshire", "Cambridgeshire", "Cheshire", 
  "Cornwall", "Cumbria", "Derbyshire", "Devon", "Dorset", "Durham", "Essex", 
  "Gloucestershire", "Greater London", "Greater Manchester", "Hampshire", 
  "Herefordshire", "Hertfordshire", "Isle of Wight", "Kent", "Lancashire", 
  "Leicestershire", "Lincolnshire", "Merseyside", "Norfolk", "Northamptonshire", 
  "Northumberland", "Nottinghamshire", "Oxfordshire", "Rutland", "Shropshire", 
  "Somerset", "Staffordshire", "Suffolk", "Surrey", "Sussex", "Tyne and Wear", 
  "Warwickshire", "West Midlands", "Wiltshire", "Worcestershire", "Yorkshire"
];

export const IRELAND_COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", 
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", 
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", 
  "Waterford", "Westmeath", "Wexford", "Wicklow"
];

export const USA_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", 
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", 
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", 
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", 
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", 
  "New Hampshire", "New Jersey", "New Mexico", "New York", 
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", 
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", 
  "West Virginia", "Wisconsin", "Wyoming"
];

export const GENDER_OPTIONS = [
  "Man",
  "Woman",
  "Boy",
  "Girl",
  "Transgender",
  "Non-Binary",
  // Alphabetical rest
  "Agender",
  "Androgyne",
  "Bigender",
  "Binary",
  "Cisgender",
  "Demiboy",
  "Demigender",
  "Demigirl",
  "Enby",
  "Gender Non-Binary",
  "Gender Non-Conforming",
  "Genderfluid",
  "Genderflux",
  "Genderless",
  "Genderqueer",
  "Intergender",
  "Intersex",
  "Neutral",
  "Neutrois",
  "Non-Gender",
  "None",
  "Pangender",
  "Polygender",
  "Queer",
  "Questioning or Unknown",
  "Third Gender",
  "Trans",
  "Transfeminine",
  "Transmasculine",
  "Tri-Gender",
  "Two-Spirit",
  "Prefer not to say",
];
