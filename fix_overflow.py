with open("src/pages/BalanceSheet.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Specifically target the filter bar container
target = "className=\"card\" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap', overflowX: 'auto' }}"
replacement = "className=\"card\" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap', overflow: 'visible' }}"

code = code.replace(target, replacement)

with open("src/pages/BalanceSheet.jsx", "w", encoding="utf-8") as f:
    f.write(code)
