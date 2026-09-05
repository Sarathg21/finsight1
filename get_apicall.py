with open("src/services/salesRevenueApi.js", "r", encoding="utf-8") as f:
    code = f.read()

import re
match = re.search(r"const apiCache = new Map\(\);.*?async function apiCall\(path, params = \{\}\) \{.*?\n\}", code, re.DOTALL)
if match:
    print(match.group(0))
else:
    print("Not found")
