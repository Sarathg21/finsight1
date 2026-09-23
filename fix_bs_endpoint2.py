with open("src/services/bsApi.js", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("GET  /api/bs/filters", "GET  /api/bs/filter-options")
code = code.replace("GET /api/bs/filters", "GET /api/bs/filter-options")

with open("src/services/bsApi.js", "w", encoding="utf-8") as f:
    f.write(code)
