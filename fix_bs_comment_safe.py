with open("src/services/bsApi.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function buildBSParams(filters = {}) {" in line:
        if lines[i-1].startswith("/*"):
            lines[i-1] = "// buildBSParams\n"
        break

with open("src/services/bsApi.js", "w", encoding="utf-8") as f:
    f.writelines(lines)
