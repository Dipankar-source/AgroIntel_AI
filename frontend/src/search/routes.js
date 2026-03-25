export const ROUTE_INDEX = [
  { label: "Dashboard", href: "/", keywords: ["home", "dashboard"] },
  { label: "Soil Analysis", href: "/soil", keywords: ["soil", "analysis"] },
  { label: "Crop Planner", href: "/planner", keywords: ["crop", "planner", "plan"] },
  { label: "Market", href: "/market", keywords: ["market", "prices", "price"] },
  { label: "AI Insights", href: "/ai-insights", keywords: ["ai", "insights"] },
  { label: "Profile", href: "/profile", keywords: ["profile", "account"] },
  { label: "Subscription", href: "/subscription", keywords: ["subscription", "plan", "pricing"] },
  { label: "Billing", href: "/billing", keywords: ["billing", "payments", "payment"] },
  { label: "Watch Demo", href: "/demo", keywords: ["demo", "watch"] },
  { label: "How To Use", href: "/how-to-use", keywords: ["help", "how", "guide", "tutorial"] },
  { label: "Login", href: "/login", keywords: ["login", "sign in"] },
  { label: "Sign Up", href: "/signup", keywords: ["signup", "register", "create account"] },
];

export function searchRoutes(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];

  return ROUTE_INDEX.filter((r) => {
    const haystack = [r.label, r.href, ...(r.keywords || [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

