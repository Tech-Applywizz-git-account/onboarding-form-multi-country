// src/pages/Onboarding/helpers.ts
import { WORLD_COUNTRIES } from "./worldCountries";
import { COUNTRY_OPTIONS } from "./constants";

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
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  place_id?: string;
}

let googleMapsLoaded = false;
let googleMapsLoadingPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  if (googleMapsLoaded) return Promise.resolve();
  if (googleMapsLoadingPromise) return googleMapsLoadingPromise;

  googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const w = window as any;
    if (w.google?.maps?.places) {
      googleMapsLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      resolve();
    };
    script.onerror = (err) => {
      googleMapsLoadingPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return googleMapsLoadingPromise;
};

export const fetchPlaceDetails = async (placeId: string): Promise<Partial<AddressSuggestion> | null> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    await loadGoogleMapsScript(apiKey);
    const w = window as any;
    if (!w.google?.maps?.places) return null;

    return new Promise((resolve) => {
      const dummy = document.createElement("div");
      const service = new w.google.maps.places.PlacesService(dummy);

      service.getDetails(
        {
          placeId: placeId,
          fields: ["address_components", "formatted_address"],
        },
        (place: any, status: any) => {
          if (status !== w.google.maps.places.PlacesServiceStatus.OK || !place) {
            resolve(null);
            return;
          }

          const comps = place.address_components || [];
          
          let streetNumber = "";
          let route = "";
          let city = "";
          let state = "";
          let zip = "";
          let country = "";
          let neighborhood = "";

          comps.forEach((c: any) => {
            const types = c.types || [];
            if (types.includes("street_number")) {
              streetNumber = c.long_name;
            } else if (types.includes("route")) {
              route = c.long_name;
            } else if (types.includes("locality")) {
              city = c.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              state = c.long_name;
            } else if (types.includes("postal_code")) {
              zip = c.long_name;
            } else if (types.includes("country")) {
              country = c.long_name;
            } else if (types.includes("neighborhood") || types.includes("sublocality")) {
              neighborhood = c.long_name;
            }
          });

          // Fallback for city if locality is missing
          if (!city) {
            const sublocality = comps.find((c: any) => c.types.includes("sublocality_level_1") || c.types.includes("sublocality"));
            if (sublocality) city = sublocality.long_name;
          }

          const address_line1 = [streetNumber, route].filter(Boolean).join(" ");

          resolve({
            address_line1: address_line1 || place.formatted_address?.split(",")[0] || "",
            address_line2: neighborhood,
            city,
            state,
            zip,
            country,
          });
        }
      );
    });
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
};

export const fetchAddressSuggestionsNominatim = async (query: string, countryCode?: string): Promise<AddressSuggestion[]> => {
  try {
    const codes = countryCode ? countryCode.toLowerCase() : "";
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=5${codes ? `&countrycodes=${codes}` : ""}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "ApplyWizz-Onboarding-Form/1.0",
      },
    });

    if (!response.ok) throw new Error("Search failed");

    const data = await response.json();
    return data.map((item: any) => {
      const addr = item.address || {};
      
      const streetNumber = addr.house_number || "";
      const streetName = addr.road || addr.street || addr.footway || addr.path || "";
      const address_line1 = [streetNumber, streetName].filter(Boolean).join(" ");
      
      const address_line2 = addr.suburb || addr.neighbourhood || addr.city_district || addr.residential || "";

      const city = addr.city || addr.town || addr.village || addr.municipality || addr.city_district || "";
      
      const state = addr.state || addr.region || addr.county || addr.state_province || addr.state_district || "";
      
      const zip = addr.postcode || "";
      
      const country = addr.country || "";
      
      return {
        display_name: item.display_name,
        country_code: addr.country_code || "",
        address_line1: address_line1 || item.display_name.split(",")[0] || "",
        address_line2: address_line2 || "",
        city,
        state,
        zip,
        country,
      };
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
};

export const fetchAddressSuggestions = async (query: string, countryCode?: string): Promise<AddressSuggestion[]> => {
  if (!query || query.length < 3) return [];

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return fetchAddressSuggestionsNominatim(query, countryCode);
  }

  try {
    await loadGoogleMapsScript(apiKey);
    const w = window as any;
    if (!w.google?.maps?.places) {
      return fetchAddressSuggestionsNominatim(query, countryCode);
    }
    
    return new Promise((resolve) => {
      const autocompleteService = new w.google.maps.places.AutocompleteService();
      const options: any = {
        input: query,
      };
      if (countryCode) {
        options.componentRestrictions = { country: countryCode.toLowerCase() };
      }

      autocompleteService.getPlacePredictions(options, (predictions: any[], status: any) => {
        if (status !== w.google.maps.places.PlacesServiceStatus.OK || !predictions) {
          fetchAddressSuggestionsNominatim(query, countryCode).then(resolve);
          return;
        }

        const suggestions: AddressSuggestion[] = predictions.map((pred) => {
          return {
            display_name: pred.description,
            country_code: countryCode || "",
            address_line1: pred.structured_formatting?.main_text || pred.description.split(",")[0],
            address_line2: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            place_id: pred.place_id,
          };
        });
        resolve(suggestions);
      });
    });
  } catch (error) {
    console.error("Google Places autocomplete error, falling back to Nominatim:", error);
    return fetchAddressSuggestionsNominatim(query, countryCode);
  }
};

// Dynamic Country name → ISO 2-letter code mapping
const COUNTRY_TO_ISO: Record<string, string> = {
  ...WORLD_COUNTRIES.reduce((acc, c) => ({ ...acc, [c.name]: c.code }), {}),
  // Add common aliases or labels from COUNTRY_OPTIONS if they differ
  ...COUNTRY_OPTIONS.reduce((acc, c) => ({ ...acc, [c.value]: c.code }), {}),
};

// Simple in-memory cache: key → results, max 100 entries (LRU-style via Map insertion order)
const _uniCache = new Map<string, string[]>();
const UNI_CACHE_MAX = 100;

export const fetchUniversities = async (query: string, country?: string): Promise<string[]> => {
  if (!query || query.length < 1) return [];

  const cacheKey = `${query.toLowerCase().trim()}__${country || ""}`;

  // Return cached results immediately — no network call needed
  if (_uniCache.has(cacheKey)) {
    return _uniCache.get(cacheKey)!;
  }

  // Step 1: Search local dataset (instant, works offline)
  const { searchUniversitiesLocally } = await import("./universityData");
  let localResults = searchUniversitiesLocally(query, country);
  if (localResults.length === 0 && country) {
    localResults = searchUniversitiesLocally(query, undefined);
  }

  const isoCode = country ? COUNTRY_TO_ISO[country] : undefined;
  const q = query.toLowerCase().trim();

  const mergeAndSort = (sets: string[][]): string[] => {
    const merged = [...new Set(sets.flat())];
    merged.sort((a, b) => {
      const aS = a.toLowerCase().startsWith(q) ? 0 : 1;
      const bS = b.toLowerCase().startsWith(q) ? 0 : 1;
      return aS - bS;
    });
    return merged.slice(0, 100);
  };

  // Step 2: Hipolabs — best for branch-level names, usually responds in <1s
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const hipolabsCountry = country && country !== "Other" ? `&country=${encodeURIComponent(country)}` : "";
    const hipolabsUrl = `https://universities.hipolabs.com/search?name=${encodeURIComponent(query)}${hipolabsCountry}`;

    const hipolabsRes = await fetch(hipolabsUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (hipolabsRes.ok) {
      const data = await hipolabsRes.json();
      const hipolabsResults: string[] = (data as any[])
        .map((u: any) => u.name as string)
        .filter(Boolean)
        .slice(0, 100);

      // If Hipolabs gave good results, return immediately — skip slower APIs
      if (hipolabsResults.length >= 5) {
        const final = mergeAndSort([localResults, hipolabsResults]);
        _uniCache.set(cacheKey, final);
        if (_uniCache.size > UNI_CACHE_MAX) {
          _uniCache.delete(_uniCache.keys().next().value!);
        }
        return final;
      }

      // Hipolabs returned few results — supplement with OpenAlex in parallel
      const countryFilter = isoCode ? `,country_code:${isoCode}` : "";
      const openAlexUrl = `https://api.openalex.org/institutions?filter=type:education,display_name.search:${encodeURIComponent(query)}${countryFilter}&per-page=50&select=display_name`;

      try {
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 3000);
        const openAlexRes = await fetch(openAlexUrl, { signal: controller2.signal });
        clearTimeout(timeout2);

        let openAlexResults: string[] = [];
        if (openAlexRes.ok) {
          const oaData = await openAlexRes.json();
          openAlexResults = oaData.results?.map((u: any) => u.display_name as string).filter(Boolean) ?? [];
        }
        const final = mergeAndSort([localResults, hipolabsResults, openAlexResults]);
        _uniCache.set(cacheKey, final);
        if (_uniCache.size > UNI_CACHE_MAX) {
          _uniCache.delete(_uniCache.keys().next().value!);
        }
        return final;
      } catch {
        // OpenAlex timed out — use what we have
        const final = mergeAndSort([localResults, hipolabsResults]);
        _uniCache.set(cacheKey, final);
        return final;
      }
    }
  } catch {
    // Hipolabs failed or timed out — fall through to local results
  }

  // Fallback: local results only
  const final = mergeAndSort([localResults]);
  _uniCache.set(cacheKey, final);
  return final;
};

export const fetchCities = async (query: string, country?: string): Promise<string[]> => {
  if (!query || query.length < 1) return [];

  const getFallbackResults = async (): Promise<string[]> => {
    try {
      const { searchStatesLocally } = await import("./statesData");
      const local = searchStatesLocally(query, country);
      
      if (country) {
        const isoCode = COUNTRY_TO_ISO[country]?.toLowerCase();
        // Since we are searching cities, a general query q= is much more flexible and robust for autocomplete than city=
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10${isoCode ? `&countrycodes=${isoCode}` : ""}`;
        
        const response = await fetch(url, {
          headers: { "User-Agent": "ApplyWizz-Onboarding-Form/1.0" }
        });
        
        if (response.ok) {
          const data = await response.json();
          const apiResults: string[] = data
            .map((item: any) => item.name || item.display_name.split(",")[0])
            .filter(Boolean) as string[];
          const merged = [...new Set([...local, ...apiResults])];
          return merged.slice(0, 15);
        }
      }
      return local;
    } catch (error) {
      console.error("Error fetching cities fallback:", error);
      return [];
    }
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (apiKey && apiKey.trim() !== "") {
    try {
      await loadGoogleMapsScript(apiKey);
      const w = window as any;
      if (w.google?.maps?.places) {
        return new Promise((resolve) => {
          const autocompleteService = new w.google.maps.places.AutocompleteService();
          const options: any = {
            input: query,
            types: ["(cities)"],
          };
          if (country) {
            const isoCode = COUNTRY_TO_ISO[country]?.toLowerCase();
            if (isoCode) {
              options.componentRestrictions = { country: isoCode };
            }
          }

          autocompleteService.getPlacePredictions(options, (predictions: any[], status: any) => {
            if (status !== w.google.maps.places.PlacesServiceStatus.OK || !predictions) {
              getFallbackResults().then(resolve);
              return;
            }

            const results = predictions.map((pred) => pred.description);
            resolve(results);
          });
        });
      }
    } catch (error) {
      console.error("Google Places city search error, falling back to local/Nominatim:", error);
    }
  }

  return getFallbackResults();
};

export const fetchCompanies = async (query: string): Promise<string[]> => {
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

export const parseDobToDate = (dobStr: string): Date | null => {
  if (!dobStr) return null;
  const parts = dobStr.split("/");
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  
  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
  
  const currentYear = new Date().getFullYear();
  const currentCentury = Math.floor(currentYear / 100) * 100;
  const twoDigitCutoff = currentYear % 100;
  
  if (year < 100) {
    if (year <= twoDigitCutoff) {
      year += currentCentury;
    } else {
      year += (currentCentury - 100);
    }
  }
  
  return new Date(Date.UTC(year, month - 1, day));
};

