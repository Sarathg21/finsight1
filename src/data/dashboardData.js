

export const agingData = [
  { name: "0 - 30 Days", value: 17.85, percentage: "30.40%", color: "#2563EB" },
  { name: "31 - 60 Days", value: 12.60, percentage: "21.44%", color: "#10B981" },
  { name: "61 - 90 Days", value: 8.45, percentage: "14.39%", color: "#F59E0B" },
  { name: "91 - 120 Days", value: 6.60, percentage: "11.24%", color: "#8B5CF6" },
  { name: "> 120 Days", value: 13.25, percentage: "22.53%", color: "#EF4444" }
];

export const overdueData = [
  { name: "1 - 30 Days", value: 3.10, percentage: "32.29%", color: "#2563EB" },
  { name: "31 - 60 Days", value: 2.45, percentage: "25.52%", color: "#10B981" },
  { name: "61 - 90 Days", value: 1.80, percentage: "18.75%", color: "#F59E0B" },
  { name: "91 - 120 Days", value: 1.25, percentage: "13.02%", color: "#8B5CF6" },
  { name: "> 120 Days", value: 1.00, percentage: "10.42%", color: "#EF4444" }
];

export const trendData = [
  { month: "Nov 2023", payables: 52.10, dpo: 49 },
  { month: "Dec 2023", payables: 54.30, dpo: 48 },
  { month: "Jan 2024", payables: 55.60, dpo: 46 },
  { month: "Feb 2024", payables: 56.40, dpo: 47 },
  { month: "Mar 2024", payables: 53.70, dpo: 49 },
  { month: "Apr 2024", payables: 58.75, dpo: 46 }
];

export const divisionData = [
  { name: "Alpine", value: 22.40, percentage: "38.13%" },
  { name: "DC Serve", value: 14.20, percentage: "24.17%" },
  { name: "Filter Fan", value: 8.90, percentage: "15.16%" },
  { name: "Alpine Gears", value: 6.10, percentage: "10.38%" },
  { name: "Others", value: 7.15, percentage: "12.16%" }
].sort((a, b) => b.value - a.value);

export const topVendors = [
  { id: 1, name: "Vendor A", amount: 4.25, pct: "7.24%" },
  { id: 2, name: "Vendor B", amount: 3.60, pct: "6.13%" },
  { id: 3, name: "Vendor C", amount: 3.25, pct: "5.53%" },
  { id: 4, name: "Vendor D", amount: 2.95, pct: "5.02%" },
  { id: 5, name: "Vendor E", amount: 2.70, pct: "4.60%" },
  { id: 6, name: "Vendor F", amount: 2.45, pct: "4.17%" },
  { id: 7, name: "Vendor G", amount: 2.20, pct: "3.75%" },
  { id: 8, name: "Vendor H", amount: 1.95, pct: "3.32%" },
  { id: 9, name: "Vendor I", amount: 1.75, pct: "2.98%" },
  { id: 10, name: "Vendor J", amount: 1.60, pct: "2.72%" }
];

export const businessUnitData = [
  { unit: "Coils BU", amount: 16.25, pct: "27.65%" },
  { unit: "Service BU", amount: 12.60, pct: "21.45%" },
  { unit: "Fans BU", amount: 8.40, pct: "14.30%" },
  { unit: "Gears BU", amount: 7.15, pct: "12.16%" },
  { unit: "Valves BU", amount: 6.20, pct: "10.56%" },
  { unit: "Others", amount: 8.15, pct: "13.88%" }
];

export const detailedViewData = [
  { entity: "Alpine Coils", parent: "Alpine", sub: "Alpine Coils", bu: "Coils BU", current: 5.20, m1: 4.30, m2: 3.20, m3: 2.10, m4: 1.20, m5: 2.40, total: 18.40, dpo: 45 },
  { entity: "DC Serve Equip.", parent: "DC Serve", sub: "DC Serve Equip.", bu: "Service BU", current: 4.50, m1: 3.10, m2: 2.40, m3: 1.60, m4: 1.10, m5: 2.30, total: 15.00, dpo: 48 },
  { entity: "Filter Fan - UAE", parent: "Alpine", sub: "Filter Fan - UAE", bu: "Fans BU", current: 3.10, m1: 2.25, m2: 1.55, m3: 1.00, m4: 0.70, m5: 1.80, total: 10.40, dpo: 46 },
  { entity: "Alpine Gears", parent: "Alpine Gears", sub: "Alpine Gears", bu: "Gears BU", current: 2.22, m1: 1.55, m2: 1.10, m3: 0.80, m4: 0.55, m5: 1.30, total: 7.55, dpo: 44 },
  { entity: "Others", parent: "Others", sub: "Others", bu: "Others", current: 2.80, m1: 2.60, m2: 2.35, m3: 1.95, m4: 1.05, m5: 3.45, total: 14.20, dpo: 47 }
];