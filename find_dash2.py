
# Read the file and find the exact bytes used as the dash placeholder
with open(r'c:\Users\SARATH\project dubai\Finsight Project\src\components\Tables\ExpenseCategoryDrillDown.jsx', 'rb') as f:
    raw = f.read()

# Decode with UTF-8-sig (handles BOM)
text = raw.decode('utf-8-sig')

# Find the line with "return" and a short string
import re
for i, line in enumerate(text.splitlines()):
    if 'return' in line and not line.strip().startswith('//'):
        m = re.search(r'return\s+["\'](.{0,6})["\']', line)
        if m:
            val = m.group(1)
            if len(val) <= 3:  # Short placeholder strings
                hex_bytes = val.encode('utf-8').hex()
                print(f'Line {i+1}: return "{val}" -> hex: {hex_bytes} -> chars: {[hex(ord(c)) for c in val]}')

print('\nDone')
