import re

with open("src/pages/SalesRevenueReport.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Add useAuth import if not present
if "useAuth" not in code:
    code = "import { useAuth } from '../context/AuthContext';\n" + code

# Replace manual permissions fetch and canExport
code = re.sub(
    r"const \[permissions,\s*setPermissions\]\s*=\s*useState\(\[\]\);.*?setPermissions\(\[\]\)\);\n\s*\}\s*\}, \[\]\);",
    "",
    code,
    flags=re.DOTALL
)

# Replace the canExport assignment with useAuth
code = re.sub(
    r"const canExport\s*=\s*permissions\.find[^\n]*\n",
    "const { hasExportRight } = useAuth();\n  const canExport = hasExportRight('SALES_REVENUE');\n",
    code
)

with open("src/pages/SalesRevenueReport.jsx", "w", encoding="utf-8") as f:
    f.write(code)
