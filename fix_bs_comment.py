import re
with open("src/services/bsApi.js", "r", encoding="utf-8") as f:
    code = f.read()

# The broken comment starts with /* and some garbled characters.
# We will use regex to find the broken comment and replace it.
pattern = re.compile(r"/\*.*?\nfunction buildBSParams", re.DOTALL)
code = pattern.sub("// buildBSParams\nfunction buildBSParams", code)

# Also fix any other potentially broken block comments if needed, but the first one is the main issue.
with open("src/services/bsApi.js", "w", encoding="utf-8") as f:
    f.write(code)
