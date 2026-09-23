
# Fix the triple/double-encoded em dash in ExpenseCategoryDrillDown.jsx
with open(r'c:\Users\SARATH\project dubai\Finsight Project\src\components\Tables\ExpenseCategoryDrillDown.jsx', 'rb') as f:
    raw = f.read()

print(f'File size: {len(raw)} bytes')

# The garbled sequence c3a2 e282ac e2809d is the double-encoded UTF-8 em dash
# Original: — (U+2014) -> UTF-8: E2 80 94
# Double encoded (UTF-8 bytes read as Latin-1, then re-encoded as UTF-8):
#   E2 -> C3 A2
#   80 -> C2 80 -> but actually stored as E2 82 AC (€) depending on encoding chain
# The exact bytes found: C3 A2 E2 82 AC E2 80 9D
garbled = bytes([0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0xE2, 0x80, 0x9D])
correct = '—'.encode('utf-8')  # E2 80 94

print(f'Garbled bytes: {garbled.hex()}')
print(f'Correct em dash bytes: {correct.hex()}')
print(f'Count of garbled sequences: {raw.count(garbled)}')

fixed_raw = raw.replace(garbled, correct)
print(f'After fix - count: {fixed_raw.count(garbled)}')

with open(r'c:\Users\SARATH\project dubai\Finsight Project\src\components\Tables\ExpenseCategoryDrillDown.jsx', 'wb') as f:
    f.write(fixed_raw)

print('File saved successfully')

# Verify
with open(r'c:\Users\SARATH\project dubai\Finsight Project\src\components\Tables\ExpenseCategoryDrillDown.jsx', 'rb') as f:
    verify = f.read()
text = verify.decode('utf-8-sig')
print(f'Em dash count after fix: {text.count(chr(0x2014))}')
print('DONE')
