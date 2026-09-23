with open("src/pages/SalesRevenueReport.jsx", "r", encoding="utf-8") as f:
    code = f.read()

import_statement = "import { useAuth } from '../context/AuthContext';\n"
if "useAuth" not in code[:1000]:
    code = code.replace("import { useState", import_statement + "import { useState", 1)

with open("src/pages/SalesRevenueReport.jsx", "w", encoding="utf-8") as f:
    f.write(code)
