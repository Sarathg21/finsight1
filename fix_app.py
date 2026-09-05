with open("src/App.jsx", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace(
    'pageKey="balance_sheet"',
    'pageKey="balance-sheet"'
)

with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(code)
