import subprocess, re

# Read the current file
with open(r'c:\Users\SARATH\project dubai\Finsight Project\src\components\Tables\ExpenseCategoryDrillDown.jsx', 'rb') as f:
    raw = f.read()

print(f'File size: {len(raw)} bytes')
print(f'First 3 bytes (BOM check): {raw[:3].hex()}')

# Try UTF-8 first
try:
    text = raw.decode('utf-8')
    print('File is valid UTF-8')
except Exception as e:
    print(f'NOT UTF-8: {e}')
    text = raw.decode('cp1252', errors='replace')

em_count = text.count('\u2014')
print(f'Em dash U+2014 count: {em_count}')

# Also check for the Windows-1252 representation of em dash (0x97)
win_em = raw.count(b'\x97')
win_en = raw.count(b'\x96')
print(f'0x97 (Win-1252 em dash) count: {win_em}')
print(f'0x96 (Win-1252 en dash) count: {win_en}')

# Replace all em-dash and en-dash with safe ASCII placeholder
if em_count > 0:
    fixed = text.replace('\u2014', '&#x2014;')
    with open(r'c:\Users\SARATH\project dubai\Finsight Project\src\components\Tables\ExpenseCategoryDrillDown.jsx', 'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f'Fixed {em_count} em dashes - saved UTF-8')
elif win_em > 0:
    # File is cp1252, decode and fix
    text_cp = raw.decode('cp1252', errors='replace')
    fixed = text_cp.replace('\u2014', '&#x2014;').replace('\u2013', '&#x2013;')
    with open(r'c:\Users\SARATH\project dubai\Finsight Project\src\components\Tables\ExpenseCategoryDrillDown.jsx', 'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f'Fixed {win_em} Win-1252 em dashes - saved as UTF-8')
else:
    print('No em dashes found to fix')

# Verify
with open(r'c:\Users\SARATH\project dubai\Finsight Project\src\components\Tables\ExpenseCategoryDrillDown.jsx', 'rb') as f:
    verify = f.read()
print(f'Verified: first 3 bytes = {verify[:3].hex()}, size = {len(verify)}')
print(f'Contains em dash: {chr(0x2014) in verify.decode("utf-8")}')
