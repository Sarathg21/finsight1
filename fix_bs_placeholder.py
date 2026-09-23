import re
with open("src/pages/BalanceSheet.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace <MultiSelectDropdown ... /> with <MultiSelectDropdown placeholder="All" ... />
code = re.sub(
    r'<MultiSelectDropdown\s+options=',
    r'<MultiSelectDropdown placeholder="All" options=',
    code
)

with open("src/pages/BalanceSheet.jsx", "w", encoding="utf-8") as f:
    f.write(code)
