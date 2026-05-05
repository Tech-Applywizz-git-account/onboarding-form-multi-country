// src/pages/Onboarding/statesData.ts

export const STATES_DATA: Record<string, string[]> = {
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
    "Wisconsin", "Wyoming", "District of Columbia", "Puerto Rico"
  ],
  "Canada": [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", 
    "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", 
    "Northwest Territories", "Nunavut", "Yukon"
  ],
  "United Kingdom": [
    "England", "Scotland", "Wales", "Northern Ireland",
    // Could include counties, but usually just the constituent countries are used for high-level UK state/region
    "Greater London", "West Midlands", "Greater Manchester", "West Yorkshire", 
    "Merseyside", "South Yorkshire", "Tyne and Wear"
  ],
  "Ireland": [
    "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", 
    "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", 
    "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", 
    "Wexford", "Wicklow"
  ]
};

export const ALL_STATES: string[] = [
  ...new Set(Object.values(STATES_DATA).flat())
];

export function searchStatesLocally(query: string, country?: string): string[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();

  const pool: string[] = 
    country && STATES_DATA[country] 
      ? STATES_DATA[country] 
      : ALL_STATES;

  const startsWith: string[] = [];
  const contains: string[] = [];

  for (const s of pool) {
    const lower = s.toLowerCase();
    if (lower.startsWith(q)) startsWith.push(s);
    else if (lower.includes(q)) contains.push(s);
  }

  return [...startsWith, ...contains].slice(0, 15);
}
