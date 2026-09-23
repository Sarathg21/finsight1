import re

with open("src/context/AuthContext.jsx", "r", encoding="utf-8") as f:
    code = f.read()

new_func = """  function hasExportRight(type) {
    const typeMap = { all: 3, excel: 2, pdf: 2, csv: 1 };
    if (typeMap[type] !== undefined) {
      const map = { full: 3, controlled: 2, operational: 2, limited: 1 };
      return (map[user?.exportRights] || 0) >= typeMap[type];
    }
    
    if (user?.module_permissions && Array.isArray(user.module_permissions)) {
      const mod = user.module_permissions.find(p => p.module_code === type);
      if (mod) return !!mod.can_export;
    }
    
    if (user?.role && ['board', 'cfo', 'admin'].includes(String(user.role).toLowerCase())) {
      return true;
    }
    
    return false;
  }"""

code = re.sub(
    r"function hasExportRight\(type\) \{[\s\S]*?return \(map\[user\?\.exportRights\] \|\| 0\) >= \(typeMap\[type\] \|\| 0\);\n\s*\}",
    new_func,
    code
)

with open("src/context/AuthContext.jsx", "w", encoding="utf-8") as f:
    f.write(code)
