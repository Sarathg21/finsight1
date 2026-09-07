

import {
  ShieldCheck,
  Shield,
  UserCog,
  Users,
  UserCheck,
} from "lucide-react";

/* ===========================
   ROLE STATS
=========================== */

export const roleStats = [
  {
    id: 1,
    title: "Total Roles",
    value: 12,
    description: "All roles",
    color: "blue",
   
  },
  {
    id: 2,
    title: "Active Roles",
    value: 11,
    description: "Currently active",
    color: "green",
    
  },
  {
    id: 3,
    title: "System Roles",
    value: 3,
    description: "Built-in roles",
    color: "orange",
    
  },
  {
    id: 4,
    title: "Custom Roles",
    value: 9,
    description: "Organization roles",
    color: "purple",
    
  },
  {
    id: 5,
    title: "Users Assigned",
    value: 45,
    description: "Across all roles",
    color: "teal",
   
  },
];

/* ===========================
   ROLES
=========================== */

export const roles = [
  {
    id: 1,
    name: "Super Admin",
    description: "Complete system administration",
    users: 2,
    type: "System",
    status: "Active",
  },
  {
    id: 2,
    name: "Chief Financial Officer",
    description: "Financial approvals and reporting",
    users: 3,
    type: "System",
    status: "Active",
  },
  {
    id: 3,
    name: "Finance Administrator",
    description: "Finance operations",
    users: 6,
    type: "Custom",
    status: "Active",
  },
  {
    id: 4,
    name: "Executive",
    description: "Executive dashboards",
    users: 12,
    type: "Custom",
    status: "Active",
  },
  {
    id: 5,
    name: "Division GM",
    description: "Division management",
    users: 8,
    type: "Custom",
    status: "Active",
  },
  {
    id: 6,
    name: "Business Unit Manager",
    description: "BU level access",
    users: 15,
    type: "Custom",
    status: "Active",
  },
  {
    id: 7,
    name: "Business Unit Accountant",
    description: "Accounting operations",
    users: 22,
    type: "Custom",
    status: "Active",
  },
  {
    id: 8,
    name: "Sales Engineer",
    description: "Sales analytics",
    users: 10,
    type: "Custom",
    status: "Active",
  },
  {
    id: 9,
    name: "Auditor",
    description: "Audit access",
    users: 2,
    type: "Custom",
    status: "Inactive",
  },
  {
    id: 10,
    name: "IT Administrator",
    description: "IT administration",
    users: 2,
    type: "Custom",
    status: "Active",
  },
  {
    id: 11,
    name: "Read Only User",
    description: "View-only permissions",
    users: 5,
    type: "Custom",
    status: "Active",
  },
  {
    id: 12,
    name: "Guest User",
    description: "Restricted guest access",
    users: 1,
    type: "Custom",
    status: "Inactive",
  },
];

/* ===========================
   ROLE TYPES
=========================== */

export const roleTypes = [
  "System",
  "Custom",
];

/* ===========================
   ROLE STATUS
=========================== */

export const roleStatuses = [
  "Active",
  "Inactive",
];

/* ===========================
   PERMISSION TABS
=========================== */

export const permissionTabs = [
  {
    id: "permissions",
    label: "Module Permissions",
  },
  {
    id: "scope",
    label: "Data Access Scope",
  },
  {
    id: "users",
    label: "User Assignment",
  },
  {
    id: "audit",
    label: "Audit Log",
  },
];

/* ===========================
   PERMISSION COLUMNS
=========================== */

export const permissionColumns = [
  {
    key: "view",
    label: "View",
    color: "blue",
  },
  {
    key: "export",
    label: "Export",
    color: "green",
  },
  {
    key: "upload",
    label: "Upload",
    color: "orange",
  },
  {
    key: "admin",
    label: "Admin",
    color: "purple",
  },
];

/* ===========================
   PERMISSION MODULES
=========================== */

export const permissionModules = [
  {
    id: 1,
    module: "Dashboard",
    view: true,
    export: true,
    upload: false,
    admin: false,
  },
  {
    id: 2,
    module: "Sales Revenue",
    view: true,
    export: true,
    upload: false,
    admin: false,
  },
  {
    id: 3,
    module: "Receivables",
    view: true,
    export: true,
    upload: false,
    admin: false,
  },
  {
    id: 4,
    module: "Payables",
    view: true,
    export: true,
    upload: false,
    admin: false,
  },
  {
    id: 5,
    module: "Inventory",
    view: true,
    export: true,
    upload: false,
    admin: false,
  },
  {
    id: 6,
    module: "Working Capital",
    view: true,
    export: true,
    upload: false,
    admin: false,
  },
  {
    id: 7,
    module: "Profit & Loss",
    view: true,
    export: true,
    upload: false,
    admin: false,
  },
  {
    id: 8,
    module: "Balance Sheet",
    view: true,
    export: true,
    upload: false,
    admin: false,
  },
  {
    id: 9,
    module: "Cash Flow",
    view: true,
    export: true,
    upload: false,
    admin: false,
  },
  {
    id: 10,
    module: "Fixed Assets",
    view: true,
    export: false,
    upload: false,
    admin: false,
  },
  {
    id: 11,
    module: "Bank Facilities",
    view: true,
    export: false,
    upload: false,
    admin: false,
  },
  {
    id: 12,
    module: "Report Configuration",
    view: true,
    export: false,
    upload: false,
    admin: true,
  },
  {
    id: 13,
    module: "User Management",
    view: true,
    export: false,
    upload: false,
    admin: true,
  },
];


export const roleAccessData = {

    BU_ACCOUNTANT: {

        legalGroups:[
            "FJ Group",
            "ABC Group"
        ],

        legalEntities:[
            "FJTCO"
        ],

        parentDivisions:[
            "Corporate"
        ],

        subDivisions:[
            "Finance"
        ],

        businessUnits:[
            "Accounts"
        ],

        analysisCodes:[
            "1001"
        ]

    },


    FM: {

        legalGroups:[
            "Finance Group"
        ],

        legalEntities:[
            "Finance Entity"
        ],

        parentDivisions:[
            "Finance Division"
        ],

        subDivisions:[],

        businessUnits:[
            "Accounts"
        ],

        analysisCodes:[
             "2001",
            "2002"
        ]

    },

    CFO: {

        legalGroups:[
            "All Groups"
        ],

        legalEntities:[
            "All Entities"
        ],

        parentDivisions:[
            "All Divisions"
        ],

        subDivisions:[
            "All Sub Divisions"
        ],

        businessUnits:[
            "All Business Units"
        ],

        analysisCodes:[
            "All"
        ]

    }

};
export const protectedRoles = [
    "SUPER_ADMIN",
    "CFO"
];

