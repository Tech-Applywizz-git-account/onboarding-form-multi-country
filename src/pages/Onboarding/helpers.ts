// src/pages/Onboarding/helpers.ts

export const ensureAllowedDoc = (file: File | null) => {
  if (!file) throw new Error("Resume required");
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf",
  ];
  if (!allowed.includes(file.type)) throw new Error("Invalid file type");
};

export const fileExt = (n: string) =>
  n.split(".").length > 1 ? n.split(".").pop()!.toLowerCase() : "pdf";

export const slugify = (s: string) =>
  s.trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "").slice(0, 64);

export const ynToBool = (v?: string | null) =>
  v === "yes" ? true : v === "no" ? false : null;

export interface AddressSuggestion {
  display_name: string;
  country_code: string;
}

export const fetchAddressSuggestions = async (query: string, countryCode?: string): Promise<AddressSuggestion[]> => {
  if (!query || query.length < 3) return [];

  try {
    const codes = countryCode ? countryCode.toLowerCase() : "us,ca,gb,ie";
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=5&countrycodes=${codes}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "ApplyWizz-Onboarding-Form/1.0",
      },
    });

    if (!response.ok) throw new Error("Search failed");

    const data = await response.json();
    return data.map((item: any) => ({
      display_name: item.display_name,
      country_code: item.address?.country_code || "",
    }));
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
};

export const fetchUniversities = async (query: string, country?: string) => {
  if (!query || query.length < 2) return [];
  try {
    const url = `https://universities.hipolabs.com/search?name=${encodeURIComponent(query)}${country ? `&country=${encodeURIComponent(country)}` : ""}`;
    const response = await fetch(url);
    const data = await response.json();
    return [...new Set(data.map((u: any) => u.name))] as string[];
  } catch (error) {
    console.error("Error fetching universities:", error);
    return [];
  }
};

export const fetchCities = async (query: string, country?: string) => {
  if (!query || query.length < 2) return [];
  try {
    const codes = country ? country.toLowerCase() : "";
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&featuretype=city&limit=10${codes ? `&countrycodes=${codes}` : ""}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.map((item: any) => item.display_name);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

export const fetchCompanies = async (query: string) => {
  if (!query || query.length < 2) return [];
  try {
    const url = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((c: any) => c.name);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};
