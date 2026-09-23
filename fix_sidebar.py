with open("src/components/Sidebar.jsx", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace(
    "// { to: '/balance-sheet',",
    "{ to: '/balance-sheet',"
)

with open("src/components/Sidebar.jsx", "w", encoding="utf-8") as f:
    f.write(code)
