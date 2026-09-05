import re
with open("src/services/bsApi.js", "r", encoding="utf-8") as f:
    code = f.read()

# Replace any block comment that starts with /* and a bunch of garbage/question marks
# and ends with */ (or no */ if it was already fixed)
code = re.sub(r"/\*[^\n]*[^\n]*\n\s*([A-Z\s]+)\n[^\n]*\*/", r"// \1", code)
code = re.sub(r"/\*[^\n]*[^\n]*\n", r"// \n", code)

with open("src/services/bsApi.js", "w", encoding="utf-8") as f:
    f.write(code)
