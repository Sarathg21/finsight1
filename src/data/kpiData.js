import { LuBuilding2 } from "react-icons/lu";
import {
  IoWalletOutline,
  IoHourglassOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";

import {
  FiPercent,
  FiRefreshCw,
} from "react-icons/fi";

export const kpiData = [
  {
    id: 1,

    title: "Total Payables",

    value: "₹58.75 Cr",

    icon: LuBuilding2,

    titleColor: "#2563EB",

    iconColor: "#2563EB",

    iconBackground: "#EAF2FF",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "up",

    trendValue: "9.42%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#16A34A",

    sparklineColor: "#2563EB",

    sparklineData: [
      6, 8, 7, 11, 6,
      9, 13, 7, 9, 15,
      8, 14, 10, 16, 7,
      11, 15, 9, 12, 10,
      14, 11
    ]
  },

  {
    id: 2,

    title: "Current Payables",

    value: "₹17.85 Cr",

    icon: IoWalletOutline,

    titleColor: "#16A34A",

    iconColor: "#16A34A",

    iconBackground: "#ECFDF5",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "up",

    trendValue: "7.31%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#16A34A",

    sparklineColor: "#16A34A",

    sparklineData: [
      7, 8, 7, 9, 8,
      10, 9, 11, 8, 10,
      12, 9, 11, 10, 12,
      9, 11, 8, 10, 9,
      11, 8
    ]
  },

  {
    id: 3,

    title: "Overdue Payables",

    value: "₹9.60 Cr",

    icon: IoHourglassOutline,

    titleColor: "#F59E0B",

    iconColor: "#F59E0B",

    iconBackground: "#FFF7ED",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "down",

    trendValue: "14.85%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#DC2626",

    sparklineColor: "#F59E0B",

    sparklineData: [
      9, 10, 8, 11, 9,
      8, 12, 9, 10, 8,
      11, 9, 8, 10, 9,
      8, 11, 9, 10, 8,
      9, 8
    ]
  },

  {
    id: 4,

    title: "Overdue > 90 Days",

    value: "₹3.25 Cr",

    icon: IoAlertCircleOutline,

    titleColor: "#EC4899",

    iconColor: "#EC4899",

    iconBackground: "#FDF2F8",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "down",

    trendValue: "21.10%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#DC2626",

    sparklineColor: "#EC4899",

    sparklineData: [
      7, 8, 7, 9, 8,
      7, 10, 8, 9, 7,
      8, 10, 7, 9, 8,
      7, 10, 8, 9, 8,
      10, 9
    ]
  },

  {
    id: 5,

    title: "DSO (Days Payable Outstanding)",

    value: "46 Days",

    icon: FiPercent,

    titleColor: "#06B6D4",

    iconColor: "#06B6D4",

    iconBackground: "#ECFEFF",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "up",

    trendValue: "3 Days",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#16A34A",

    sparklineColor: "#06B6D4",

    sparklineData: [
      8, 9, 8, 10, 9,
      8, 11, 9, 10, 8,
      10, 9, 11, 8, 10,
      9, 11, 9, 10, 9,
      10, 9
    ]
  },

  {
    id: 6,

    title: "Invoice Settlement Efficiency",

    value: "92.35%",

    icon: FiRefreshCw,

    titleColor: "#8B5CF6",

    iconColor: "#8B5CF6",

    iconBackground: "#F5F3FF",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "up",

    trendValue: "4.12%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#16A34A",

    sparklineColor: "#8B5CF6",

    sparklineData: [
      8, 10, 8, 11, 9,
      8, 12, 9, 11, 8,
      10, 12, 9, 11, 8,
      10, 12, 9, 11, 10,
      12, 10
    ]
  },
];

export const kpiDataReceivable = [
  {
    id: 1,

    title: "Total Receivables",

    value: "₹58.75 Cr",

    icon: LuBuilding2,

    titleColor: "#2563EB",

    iconColor: "#2563EB",

    iconBackground: "#EAF2FF",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "up",

    trendValue: "9.42%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#16A34A",

    sparklineColor: "#2563EB",

    sparklineData: [
      6, 8, 7, 11, 6,
      9, 13, 7, 9, 15,
      8, 14, 10, 16, 7,
      11, 15, 9, 12, 10,
      14, 11
    ]
  },

  {
    id: 2,

    title: "Current Receivables",

    value: "₹17.85 Cr",

    icon: IoWalletOutline,

    titleColor: "#16A34A",

    iconColor: "#16A34A",

    iconBackground: "#ECFDF5",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "up",

    trendValue: "7.31%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#16A34A",

    sparklineColor: "#16A34A",

    sparklineData: [
      7, 8, 7, 9, 8,
      10, 9, 11, 8, 10,
      12, 9, 11, 10, 12,
      9, 11, 8, 10, 9,
      11, 8
    ]
  },

  {
    id: 3,

    title: "Overdue Receivables",

    value: "₹9.60 Cr",

    icon: IoHourglassOutline,

    titleColor: "#F59E0B",

    iconColor: "#F59E0B",

    iconBackground: "#FFF7ED",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "down",

    trendValue: "14.85%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#DC2626",

    sparklineColor: "#F59E0B",

    sparklineData: [
      9, 10, 8, 11, 9,
      8, 12, 9, 10, 8,
      11, 9, 8, 10, 9,
      8, 11, 9, 10, 8,
      9, 8
    ]
  },

  {
    id: 4,

    title: "Overdue > 90 Days",

    value: "₹3.25 Cr",

    icon: IoAlertCircleOutline,

    titleColor: "#EC4899",

    iconColor: "#EC4899",

    iconBackground: "#FDF2F8",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "down",

    trendValue: "21.10%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#DC2626",

    sparklineColor: "#EC4899",

    sparklineData: [
      7, 8, 7, 9, 8,
      7, 10, 8, 9, 7,
      8, 10, 7, 9, 8,
      7, 10, 8, 9, 8,
      10, 9
    ]
  },

  {
    id: 5,

    title: "Days Receivable Outstanding",
    value: "46 Days",

    icon: FiPercent,

    titleColor: "#06B6D4",

    iconColor: "#06B6D4",

    iconBackground: "#ECFEFF",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "up",

    trendValue: "3 Days",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#16A34A",

    sparklineColor: "#06B6D4",

    sparklineData: [
      8, 9, 8, 10, 9,
      8, 11, 9, 10, 8,
      10, 9, 11, 8, 10,
      9, 11, 9, 10, 9,
      10, 9
    ]
  },

  {
    id: 6,

    title: "Invoice Settlement Efficiency",

    value: "92.35%",

    icon: FiRefreshCw,

    titleColor: "#8B5CF6",

    iconColor: "#8B5CF6",

    iconBackground: "#F5F3FF",

    cardBackground: "#FFFFFF",

    borderColor: "#E8EDF5",

    trend: "up",

    trendValue: "4.12%",

    comparisonText: "vs 31 Mar 2024",

    trendColor: "#16A34A",

    sparklineColor: "#8B5CF6",

    sparklineData: [
      8, 10, 8, 11, 9,
      8, 12, 9, 11, 8,
      10, 12, 9, 11, 8,
      10, 12, 9, 11, 10,
      12, 10
    ]
  },
];