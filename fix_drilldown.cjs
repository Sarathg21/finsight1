const fs = require('fs');
let code = fs.readFileSync('src/pages/BalanceSheet.jsx', 'utf8');

code = code.replace(
  "function DrilldownModal({ isOpen, onClose, data, currency }) {\n  if (!isOpen) return null;\n  const rows = data?.data || [];",
  "function DrilldownModal({ isOpen, onClose, data, currency }) {\n  if (!isOpen) return null;\n  const rows = Array.isArray(data) ? data : (data?.data || []);"
);
fs.writeFileSync('src/pages/BalanceSheet.jsx', code);
