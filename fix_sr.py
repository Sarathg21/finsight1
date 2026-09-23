import re

with open("src/pages/SalesRevenueReport.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Add const { hasExportRight } = useAuth(); inside export default function SalesRevenueReport()
# We look for:
# export default function SalesRevenueReport() {
#   const navigate = useNavigate();

new_code = code.replace(
    "export default function SalesRevenueReport() {\n  const navigate = useNavigate();",
    "export default function SalesRevenueReport() {\n  const navigate = useNavigate();\n  const { hasExportRight } = useAuth();"
)

with open("src/pages/SalesRevenueReport.jsx", "w", encoding="utf-8") as f:
    f.write(new_code)
