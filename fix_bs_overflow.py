import re
with open("src/pages/BalanceSheet.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Remove overflowX: 'auto' to prevent dropdown clipping
code = code.replace(
    "overflowX: 'auto'",
    "/* overflow removed to fix dropdown clipping */"
)

with open("src/pages/BalanceSheet.jsx", "w", encoding="utf-8") as f:
    f.write(code)
