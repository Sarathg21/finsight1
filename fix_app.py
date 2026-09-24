import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import if not exists
if 'import InventoryAgingPage' not in content:
    content = content.replace(
        'import PayablesAgingPage from "./pages/PayablesAgingPage";',
        'import PayablesAgingPage from "./pages/PayablesAgingPage";\nimport InventoryAgingPage from "./pages/InventoryAgingPage";'
    )

# Uncomment route
content = content.replace(
    '{/* <Route path="/inventory"          element={<ProtectedRoute pageKey="inventory"          element={<PlaceholderPage title="Inventory Aging" />} />} /> */}',
    '<Route path="/inventory"          element={<ProtectedRoute pageKey="inventory"          element={<InventoryAgingPage />} />} />'
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
