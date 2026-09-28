
import {
  LayoutDashboard, Users, Shield, Key, Lock, Building2, Building,
  Layers, Boxes, Briefcase, Hash, CalendarDays, Coins, FileBarChart,
  Clock, UploadCloud, Activity, CheckCircle2, GitCompare, LayoutGrid,
  Eye, Filter, Download, Calendar, DollarSign, Bell, ScrollText, UserCheck,
  UserX, UserRoundX, UserCog, Settings, Info, BarChart3
} from "lucide-react";

export const users = [
  { id: 1, code: "EMP001", name: "John Doe", email: "john.doe@fjgroup.com", department: "Finance", role: "CFO", status: "Active", lastLogin: "20 Jun 2026 08:15 AM", jobTitle: "Chief Financial Officer", phone: "+971 50 123 4567", location: "Dubai, UAE", dateOfJoining: "15 Jan 2022", emailVerified: true, mfaEnabled: true },
  { id: 2, code: "EMP002", name: "Jane Smith", email: "jane.smith@fjgroup.com", department: "Finance", role: "Finance Admin", status: "Active", lastLogin: "20 Jun 2026 07:40 AM", jobTitle: "Finance Administrator", phone: "+971 50 222 1122", location: "Dubai, UAE", dateOfJoining: "04 Mar 2022", emailVerified: true, mfaEnabled: true },
  { id: 3, code: "EMP003", name: "Michael Brown", email: "michael.brown@fjgroup.com", department: "IT", role: "System Admin", status: "Active", lastLogin: "20 Jun 2026 09:10 AM", jobTitle: "System Administrator", phone: "+971 50 333 3344", location: "Abu Dhabi, UAE", dateOfJoining: "12 Jul 2021", emailVerified: true, mfaEnabled: true },
  { id: 4, code: "EMP004", name: "Emily Davis", email: "emily.davis@fjgroup.com", department: "Finance", role: "Division GM", status: "Active", lastLogin: "19 Jun 2026 06:30 PM", jobTitle: "Division General Manager", phone: "+971 50 444 4455", location: "Dubai, UAE", dateOfJoining: "22 Sep 2020", emailVerified: true, mfaEnabled: false },
  { id: 5, code: "EMP005", name: "William Wilson", email: "william.wilson@fjgroup.com", department: "Operations", role: "BU Manager", status: "Active", lastLogin: "19 Jun 2026 05:20 PM", jobTitle: "Business Unit Manager", phone: "+971 50 555 5566", location: "Sharjah, UAE", dateOfJoining: "11 Nov 2021", emailVerified: true, mfaEnabled: true },
  { id: 6, code: "EMP006", name: "Sarah Johnson", email: "sarah.johnson@fjgroup.com", department: "Finance", role: "BU Accountant", status: "Active", lastLogin: "20 Jun 2026 10:05 AM", jobTitle: "Business Unit Accountant", phone: "+971 50 666 6677", location: "Dubai, UAE", dateOfJoining: "02 Feb 2023", emailVerified: true, mfaEnabled: true },
  { id: 7, code: "EMP007", name: "David Lee", email: "david.lee@fjgroup.com", department: "IT", role: "IT Admin", status: "Inactive", lastLogin: "—", jobTitle: "IT Administrator", phone: "+971 50 777 7788", location: "Dubai, UAE", dateOfJoining: "18 Apr 2022", emailVerified: false, mfaEnabled: false },
  { id: 8, code: "EMP008", name: "Lisa Ray", email: "lisa.ray@fjgroup.com", department: "Sales", role: "Sales Engineer", status: "Active", lastLogin: "19 Jun 2026 04:15 PM", jobTitle: "Senior Sales Engineer", phone: "+971 50 888 8899", location: "Dubai, UAE", dateOfJoining: "07 Aug 2022", emailVerified: true, mfaEnabled: true },
  { id: 9, code: "EMP009", name: "Robert Clark", email: "robert.clark@fjgroup.com", department: "Finance", role: "Auditor", status: "Locked", lastLogin: "18 Jun 2026 02:10 PM", jobTitle: "Internal Auditor", phone: "+971 50 999 9900", location: "Abu Dhabi, UAE", dateOfJoining: "15 May 2020", emailVerified: true, mfaEnabled: true },
  { id: 10, code: "EMP010", name: "Anita Paul", email: "anita.paul@fjgroup.com", department: "Operations", role: "Executive", status: "Active", lastLogin: "20 Jun 2026 09:35 AM", jobTitle: "Operations Executive", phone: "+971 50 100 2233", location: "Dubai, UAE", dateOfJoining: "29 Oct 2023", emailVerified: true, mfaEnabled: false },
  { id: 11, code: "EMP011", name: "Omar Hassan", email: "omar.hassan@fjgroup.com", department: "IT", role: "Developer", status: "Active", lastLogin: "20 Jun 2026 08:55 AM", jobTitle: "Senior Developer", phone: "+971 50 111 2244", location: "Dubai, UAE", dateOfJoining: "10 Jun 2022", emailVerified: true, mfaEnabled: true },
  { id: 12, code: "EMP012", name: "Priya Menon", email: "priya.menon@fjgroup.com", department: "HR", role: "HR Manager", status: "Active", lastLogin: "19 Jun 2026 03:22 PM", jobTitle: "HR Manager", phone: "+971 50 222 3355", location: "Dubai, UAE", dateOfJoining: "01 Feb 2021", emailVerified: true, mfaEnabled: true },
  { id: 13, code: "EMP013", name: "Karen White", email: "karen.white@fjgroup.com", department: "Sales", role: "Sales Manager", status: "Inactive", lastLogin: "12 Jun 2026 11:00 AM", jobTitle: "Regional Sales Manager", phone: "+971 50 333 4466", location: "Sharjah, UAE", dateOfJoining: "23 Mar 2019", emailVerified: true, mfaEnabled: false },
  { id: 14, code: "EMP014", name: "Ahmed Farouk", email: "ahmed.farouk@fjgroup.com", department: "Finance", role: "Accountant", status: "Active", lastLogin: "20 Jun 2026 07:12 AM", jobTitle: "Junior Accountant", phone: "+971 50 444 5577", location: "Dubai, UAE", dateOfJoining: "17 Sep 2024", emailVerified: true, mfaEnabled: true },
  { id: 15, code: "EMP015", name: "Sophia Turner", email: "sophia.turner@fjgroup.com", department: "Marketing", role: "Marketing Lead", status: "Locked", lastLogin: "16 Jun 2026 01:45 PM", jobTitle: "Marketing Lead", phone: "+971 50 555 6688", location: "Dubai, UAE", dateOfJoining: "05 Dec 2022", emailVerified: false, mfaEnabled: false },
];

export const departments = ["All", "Finance", "IT", "Operations", "Sales", "HR", "Marketing"];
export const roles = ["All", "CFO", "Finance Admin", "System Admin", "Division GM", "BU Manager", "BU Accountant", "IT Admin", "Sales Engineer", "Auditor", "Executive", "Developer", "HR Manager", "Sales Manager", "Accountant", "Marketing Lead"];
export const legalGroups = ["FJ Group", "FJ Holdings", "FJ International"];
export const statuses = ["All", "Active", "Inactive",];

export const stats = [
  {
    id: "total",
    title: "Total Users",
    value: 45,
    icon: Users,
    color: "blue",
    trend: "8% vs last month",
    trendDir: "up",
  },
  {
    id: "active",
    title: "Active Users",
    value: 32,
    icon: UserCheck,
    color: "green",
    trend: "12% vs last month",
    trendDir: "up",
  },
  {
    id: "inactive",
    title: "Inactive Users",
    value: 13,
    icon: UserX,
    color: "orange",
    trend: "7% vs last month",
    trendDir: "down",
  },
  {
    id: "locked",
    title: "Locked Users",
    value: 2,
    icon: UserRoundX, // or Lock if you prefer
    color: "purple",
    trend: "33% vs last month",
    trendDir: "down",
  },
  {
    id: "noRole",
    title: "Users Without Role",
    value: 3,
    icon: UserCog,
    color: "teal",
    trend: "No change",
    trendDir: "flat",
  },
];


export const sections = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },

  {
    title: "Security",
    icon: Shield,
    children: [
      {
        label: "Users",
        path: "/admin/users",
        icon: Users,
      },
      {
        label: "Roles",
        path: "/admin/roles",
        icon: Shield,
      },
      {
        label: "User Access",
        path: "/admin/useraccess",
        icon: Key,
      },
      {
        label: "Permissions",
        icon: Lock,
      },
    ],
  },

  {
    title: "Master Data",
    icon: Building2,
    children: [
      {
        label: "Master Data",
        path: "/admin/master-data",
        icon: Building2,
      },
      {
        label: "Legal Groups",
        icon: Building2,
      },
      {
        label: "Legal Entities",
        icon: Building,
      },
      {
        label: "Parent Divisions",
        icon: Layers,
      },
      {
        label: "Subdivisions",
        icon: Boxes,
      },
      {
        label: "Business Units",
        icon: Briefcase,
      },
      {
        label: "Analysis Codes",
        icon: Hash,
      },
      {
        label: "Accounting Periods",
        icon: CalendarDays,
      },
      {
        label: "Currency Master",
        icon: Coins,
      },
    ],
  },

  {
    title: "Data Integration",
    icon: UploadCloud,
    children: [
      {
        label: "Report Configuration",
        icon: FileBarChart,
      },
      {
        label: "Scheduler",
        icon: Clock,
      },
      {
        label: "Upload Centre",
        icon: UploadCloud,
      },
      {
        label: "ETL Monitor",
        icon: Activity,
      },
      {
        label: "Data Quality",
        icon: CheckCircle2,
      },
      {
        label: "Reconciliation",
        icon: GitCompare,
      },
    ],
  },

  {
    title: "Report Configuration",
    icon: LayoutGrid,
    children: [
      {
        label: "Dashboard Modules",
        icon: LayoutGrid,
      },
      {
        label: "Report Visibility",
        icon: Eye,
      },
      {
        label: "Default Filters",
        icon: Filter,
      },
      {
        label: "Export Configuration",
        icon: Download,
      },
    ],
  },

  {
    title: "System",
    icon: Settings,
    children: [
      {
        label: "Fiscal Calendar",
        icon: Calendar,
      },
      {
        label: "Currency Rates",
        icon: DollarSign,
      },
      {
        label: "Notification Settings",
        icon: Bell,
      },
      {
        label: "Audit Log",
        icon: ScrollText,
      },
      {
        label: "System Settings",
        icon: Settings,
      },
    ],
  },
];

export const organizationTree = [
  {
    id: "fj",
    label: "FJ Group",
    access: "full",
    children: [
      {
        id: "fj-fjllc",
        label: "Future Journey LLC",
        access: "full",
        children: [
          {
            id: "fj-hvac",
            label: "HVAC Division",
            access: "full",
            children: [
              {
                id: "fj-dx",
                label: "DX Subdivision",
                access: "full",
                children: [
                  { id: "fj-eng", label: "BU Engineering", access: "full" },
                  { id: "fj-proj", label: "BU Projects", access: "full" },
                  { id: "fj-svc", label: "BU Service", access: "partial" },
                ],
              },
              {
                id: "fj-chiller",
                label: "Chiller Subdivision",
                access: "partial",
                children: [
                  { id: "fj-mfg", label: "BU Manufacturing", access: "partial" },
                  { id: "fj-asm", label: "BU Assembly", access: "none" },
                  { id: "fj-as", label: "BU After Sales", access: "none" },
                ],
              },
            ],
          },
          { id: "fj-elec", label: "Electrical Division", access: "none" },
        ],
      },
    ],
  },
  { id: "rkme", label: "RKME Group", access: "partial" },
  { id: "zenith", label: "Zenith Group", access: "none" },
  { id: "abc", label: "ABC Holdings", access: "none" },
  { id: "xyz", label: "XYZ Group", access: "none" },
  { id: "other", label: "Other Groups", access: "none" },
];
