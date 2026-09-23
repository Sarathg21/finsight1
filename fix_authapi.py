with open("src/services/authApi.js", "r", encoding="utf-8") as f:
    code = f.read()

# Replace export const API_BASE = ... with the robust utility
import_stmt = "import { getApiBaseUrl } from '../utils/apiBase';\n"
if "import { getApiBaseUrl }" not in code:
    code = import_stmt + code

code = code.replace(
    "export const API_BASE =\n  import.meta.env.VITE_API_BASE_URL ?? '';",
    "export const API_BASE = getApiBaseUrl();"
)
code = code.replace(
    "export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';",
    "export const API_BASE = getApiBaseUrl();"
)

with open("src/services/authApi.js", "w", encoding="utf-8") as f:
    f.write(code)
