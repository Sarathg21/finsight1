import {
  Users, UserCheck, ShieldCheck, Users2, Building2,
  Network, Layers, Box, Code2, CalendarCheck,
  FileText, UserPlus, ShieldPlus, Key, Upload,
  RefreshCw, ClipboardList, FileCog, Calendar, Database,
  AlertTriangle, AlertCircle, Info, CheckCircle2,Settings,FolderSync,
} from "lucide-react";

export const kpiCards = [
  {
    title: "Total Users",
    value: "45",
    trend: "8% vs last month",
    trendType: "up",
    icon: Users,
    color: "blue",
  },
  {
    title: "Active Users",
    value: "32",
    trend: "12% vs last month",
    trendType: "up",
    icon: UserCheck,
    color: "green",
  },
  {
    title: "Roles",
    value: "12",
    trend: "No change",
    trendType: "flat",
    icon: ShieldCheck,
    color: "purple",
  },
  {
    title: "Legal Groups",
    value: "8",
    trend: "No change",
    trendType: "flat",
    icon: Users2,
    color: "orange",
  },
  {
    title: "Legal Entities",
    value: "24",
    trend: "7% vs last month",
    trendType: "up",
    icon: Building2,
    color: "cyan",
  },
  {
    title: "Parent Divisions",
    value: "37",
    trend: "5% vs last month",
    trendType: "up",
    icon: Network,
    color: "yellow",
  },
  {
    title: "Subdivisions",
    value: "85",
    trend: "9% vs last month",
    trendType: "up",
    icon: Layers,
    color: "pink",
  },
  {
    title: "Business Units",
    value: "126",
    trend: "11% vs last month",
    trendType: "up",
    icon: Box,
    color: "blue",
  },
  {
    title: "Analysis Codes",
    value: "312",
    trend: "6% vs last month",
    trendType: "up",
    icon: Code2,
    color: "orange",
  },
  {
    title: "Active Schedules",
    value: "18",
    trend: "No change",
    trendType: "flat",
    icon: CalendarCheck,
    color: "green",
  },
];
export const etlStatus = [
  { module: "Sales Revenue", success: 12, running: 1, warning: 0, failed: 0, lastRun: "20 Jun 2026 06:15 AM", status: "ok" },
  { module: "Receivables Aging", success: 12, running: 0, warning: 0, failed: 0, lastRun: "20 Jun 2026 06:10 AM", status: "ok" },
  { module: "Payables Aging", success: 12, running: 0, warning: 0, failed: 0, lastRun: "20 Jun 2026 06:05 AM", status: "ok" },
  { module: "Inventory Aging", success: 12, running: 0, warning: 1, failed: 0, lastRun: "20 Jun 2026 06:00 AM", status: "warning" },
  { module: "Profit & Loss", success: 12, running: 0, warning: 0, failed: 0, lastRun: "20 Jun 2026 05:55 AM", status: "ok" },
  { module: "Balance Sheet", success: 12, running: 0, warning: 0, failed: 0, lastRun: "20 Jun 2026 05:50 AM", status: "ok" },
  { module: "Working Capital", success: 11, running: 0, warning: 0, failed: 1, lastRun: "20 Jun 2026 06:45 AM", status: "failed" },
];

export const recentActivity = [
  { icon: FileText, title: "P&L report uploaded", subtitle: "By System", time: "20 Jun 2026 06:15 AM",color: "blue" },
  { icon: UserPlus, title: "New user created - John Doe", subtitle: "By Super Admin", time: "20 Jun 2026 05:45 AM", color: "green" },
  { icon: Calendar, title: "Scheduler executed - Balance Sheet", subtitle: "By System", time: "20 Jun 2026 05:40 AM",color: "purple"},
  { icon: ShieldPlus, title: "Role updated - CFO", subtitle: "By Super Admin", time: "20 Jun 2026 05:20 AM", color: "orange" },
  { icon: Key, title: "Access scope updated - Jane Smith", subtitle: "By Super Admin", time: "20 Jun 2026 04:55 AM" ,color: "cyan",},
];

export const quickActions = [
  { icon: UserPlus, label: "Add User", color: "blue" },
  { icon: ShieldPlus, label: "Create Role", color: "purple" },
  { icon: Key, label: "Assign Access", color: "green" },
  { icon: Upload, label: "Upload Report", color: "orange" },
  { icon: RefreshCw, label: "Retry ETL", color: "teal" },
  { icon: ClipboardList, label: "View Logs", color: "pink" },
  { icon: FileCog, label: "Report Configuration", color: "blue" },
  { icon: Calendar, label: "Scheduler", color: "green" },
  { icon: Database, label: "Data Quality", color: "red" },
];
export const trendData = [
  { day: "14 Jun", success: 42, failed: 3, warning: 2 },
  { day: "15 Jun", success: 45, failed: 2, warning: 3 },
  { day: "16 Jun", success: 38, failed: 5, warning: 2 },
  { day: "17 Jun", success: 44, failed: 3, warning: 1 },
  { day: "18 Jun", success: 41, failed: 4, warning: 2 },
  { day: "19 Jun", success: 46, failed: 2, warning: 3 },
  { day: "20 Jun", success: 43, failed: 3, warning: 2 },
];
export const qualityData = [
  { name: "Missing Accounts", value: 6, percent: 26, color: "#ef4444" },
  { name: "Duplicate Records", value: 5, percent: 22, color: "#f97316" },
  { name: "Invalid Currency", value: 4, percent: 17, color: "#eab308" },
  { name: "Unknown Analysis Codes", value: 3, percent: 13, color: "#22c55e" },
  { name: "Missing Subdivision", value: 3, percent: 13, color: "#06b6d4" },
  { name: "Orphan Records", value: 2, percent: 9, color: "#3b82f6" },
];
export const alerts = [
  { icon: AlertTriangle, title: "ETL Failure", desc: "Working Capital ETL failed", time: "05:45 AM", color: "danger" },
  { icon: AlertCircle, title: "Upload Delay", desc: "Payables Aging report delayed", time: "05:30 AM", color: "warning" },
  { icon: Info, title: "Scheduler", desc: "10 schedules completed successfully", time: "05:20 AM", color: "info" },
  { icon: CheckCircle2, title: "Upload Success", desc: "Sales Revenue report uploaded", time: "04:50 AM", color: "success" },
];