import re
with open("src/pages/BalanceSheet.jsx", "r", encoding="utf-8") as f:
    code = f.read()

pattern = re.compile(
    r"(const compareLbl\s*=\s*appliedFilters\.comparePeriod[^;]+;)\s*(const getPeriodLabel\s*=\s*\([^)]*\)\s*=>\s*\{[^}]+\};)",
    re.MULTILINE
)

code = pattern.sub(r"\2\n  \1", code)

with open("src/pages/BalanceSheet.jsx", "w", encoding="utf-8") as f:
    f.write(code)
