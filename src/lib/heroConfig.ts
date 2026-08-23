// Hero section configuration — scheduling integration and trust statistics.
// Kept data-driven so marketing/ops can update these without touching component code.

export type BookingProvider = "calendly" | "savvycal" | "hubspot" | "custom";

export interface BookingConfig {
  provider: BookingProvider;
  url: string;
}

// TODO: Replace `url` with the real scheduling link once InterQ confirms the provider.
// Until this is set, the "Book a Demo" button will not navigate anywhere.
export const bookingConfig: BookingConfig = {
  provider: "calendly",
  url: "",
};

export interface HeroStat {
  value: string;
  label: string;
}

// Add only client-approved, verified statistics here (e.g. { value: "40%", label: "faster hiring" }).
// Leave empty until confirmed — the Hero layout is designed to look complete with or without this row.
export const heroStats: HeroStat[] = [];
