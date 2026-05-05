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

// Country name → ISO 2-letter code mapping for OpenAlex API filter
const COUNTRY_TO_ISO: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  "Canada": "CA",
  "Ireland": "IE",
};

export const fetchUniversities = async (query: string, country?: string): Promise<string[]> => {
  if (!query || query.length < 1) return [];

  // Step 1: Always search local dataset first (instant, works offline)
  const { searchUniversitiesLocally } = await import("./universityData");
  let localResults = searchUniversitiesLocally(query, country);

  // If local results are empty for the specific country, fall back to global local search
  if (localResults.length === 0 && country) {
    localResults = searchUniversitiesLocally(query, undefined);
  }

  // Step 2: Also call OpenAlex API to supplement with broader results
  try {
    const isoCode = country ? COUNTRY_TO_ISO[country] : undefined;
    const countryFilter = isoCode && localResults.length > 0 ? `,country_code:${isoCode}` : "";
    const url = `https://api.openalex.org/institutions?filter=type:education,display_name.search:${encodeURIComponent(query)}${countryFilter}&per-page=10&select=display_name`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      let apiResults: string[] = data.results?.map((u: any) => u.display_name).filter(Boolean) ?? [];
      
      // If no API results with country filter, and we haven't already dropped the filter
      if (apiResults.length === 0 && isoCode && countryFilter) {
        const globalUrl = `https://api.openalex.org/institutions?filter=type:education,display_name.search:${encodeURIComponent(query)}&per-page=10&select=display_name`;
        const globalRes = await fetch(globalUrl);
        if (globalRes.ok) {
          const globalData = await globalRes.json();
          apiResults = globalData.results?.map((u: any) => u.display_name).filter(Boolean) ?? [];
        }
      }

      // Merge: local first (ranked higher), then any API-only results
      const merged = [...new Set([...localResults, ...apiResults])];
      return merged.slice(0, 15);
    }
  } catch {
    // API failed or timed out — local results are sufficient
  }

  return localResults;
};

export const fetchCities = async (query: string, country?: string) => {
  if (!query || query.length < 1) return [];
  try {
    const { searchStatesLocally } = await import("./statesData");
    return searchStatesLocally(query, country);
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
};

export const fetchCompanies = async (query: string) => {
  if (!query || query.length < 1) return [];
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
