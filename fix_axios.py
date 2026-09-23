import re

with open("src/api/axios.js", "r", encoding="utf-8") as f:
    code = f.read()

# Fix the baseURL
code = re.sub(
    r'baseURL:\s*`\$\{import\.meta\.env\.VITE_API_BASE_URL\}/api`,',
    'baseURL: (import.meta.env.VITE_API_BASE_URL || "") + "/api",',
    code
)

# Alternatively, import getApiRoot
if "getApiRoot" not in code:
    code = "import { getApiRoot } from '../utils/apiBase';\n" + code
    code = re.sub(
        r'baseURL:.*,',
        'baseURL: getApiRoot(),',
        code
    )

# Fix the token key
code = code.replace(
    'localStorage.getItem("token")',
    'localStorage.getItem("finsight_token")'
)

code = code.replace(
    'localStorage.removeItem(\n          "token"\n        );',
    'localStorage.removeItem(\n          "finsight_token"\n        );'
)

with open("src/api/axios.js", "w", encoding="utf-8") as f:
    f.write(code)
