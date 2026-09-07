
import subprocess, re

PROJECT = r'c:\Users\SARATH\project dubai\Finsight Project'
BRANCH = 'zenith-finsight/feature/payables-dashboard'

# Get original from Arshiya's branch
result = subprocess.run(
    ['git', 'show', f'{BRANCH}:src/components/Tables/MonthOnMonthOpexReport.jsx'],
    capture_output=True, cwd=PROJECT
)
content = result.stdout.decode('utf-8', errors='replace')

# Count wrong token key occurrences (handles any whitespace)
wrong_count = len(re.findall(r'localStorage\.getItem\s*\(\s*"token"\s*\)', content))
print(f'Wrong token key ("token") occurrences: {wrong_count}')

# Fix ALL instances - replace "token" with "finsight_token" in getItem calls
fixed = re.sub(
    r'(localStorage\.getItem\s*\(\s*)"token"(\s*\))',
    r'\1"finsight_token"\2',
    content
)

right_count = len(re.findall(r'localStorage\.getItem\s*\(\s*"finsight_token"\s*\)', fixed))
print(f'finsight_token occurrences after fix: {right_count}')

dest = PROJECT + r'\src\components\Tables\MonthOnMonthOpexReport.jsx'
with open(dest, 'w', encoding='utf-8') as f:
    f.write(fixed)
print('Saved - token key fixed')
