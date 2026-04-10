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

export const fetchAddressSuggestions = async (query: string): Promise<AddressSuggestion[]> => {
  if (!query || query.length < 3) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=5&countrycodes=us,ca,gb,ie`;

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
