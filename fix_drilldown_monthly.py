
import subprocess, re

PROJECT = r'c:\Users\SARATH\project dubai\Finsight Project'
BRANCH = 'zenith-finsight/feature/payables-dashboard'

# Get original from Arshiya's branch
result = subprocess.run(
    ['git', 'show', f'{BRANCH}:src/components/Tables/ExpenseCategoryDrillDown.jsx'],
    capture_output=True, cwd=PROJECT
)
content = result.stdout.decode('utf-8', errors='replace')

# ---- Fix 1: Token key ----
content = re.sub(
    r'(localStorage\.getItem\s*\(\s*)"token"(\s*\))',
    r'\1"finsight_token"\2',
    content
)
print('Fix 1: token key applied')

# ---- Fix 2: Switch category-detail -> category-detail-monthly ----
content = content.replace(
    '? `${baseUrl}/opex/category-detail`\n                : `${baseUrl}/api/opex/category-detail`',
    '? `${baseUrl}/opex/category-detail-monthly`\n                : `${baseUrl}/api/opex/category-detail-monthly`'
)
print('Fix 2: API endpoint switched to category-detail-monthly')

# ---- Fix 3: Update getMonthValue to read monthly_actual_aed[month] ----
# The backend returns: account.monthly_actual_aed = {"Jan-26": "6904800.11", ...}
# We need to read: account.monthly_actual_aed[month] or account.monthly_actual[month]
old_get_month = '''const getMonthValue = (
    monthData,
    month
) => {'''

new_get_month = '''const getMonthValue = (
    monthData,
    month
) => {
    /* -------------------------------------------------------
       category-detail-monthly returns:
         account.monthly_actual_aed = { "Jan-26": "123.45", ... }
         account.monthly_actual     = { "Jan-26": "123.45", ... }
       Read from these first before falling through to legacy paths.
    ------------------------------------------------------- */
    if (monthData?.monthly_actual_aed && month) {
        const val = monthData.monthly_actual_aed[month];
        if (val !== undefined && val !== null && val !== "") return val;
    }
    if (monthData?.monthly_actual && month) {
        const val = monthData.monthly_actual[month];
        if (val !== undefined && val !== null && val !== "") return val;
    }'''

if old_get_month in content:
    content = content.replace(old_get_month, new_get_month)
    print('Fix 3: getMonthValue updated to read monthly_actual_aed[month]')
else:
    print('Fix 3: WARNING - getMonthValue pattern not found, manual check needed')

# ---- Fix 4: Add useEffect import ----
if 'useEffect' not in content and 'import React, { useState }' in content:
    content = content.replace(
        'import React, { useState } from "react";',
        'import React, { useState, useEffect } from "react";'
    )
    print('Fix 4: useEffect import added')

# ---- Fix 5: Reset on period change ----
old_state = 'const [expandedRows, setExpandedRows] =\n        useState({});'
new_state = '''const [expandedRows, setExpandedRows] =
        useState({});
    /* Reset when period changes */
    useEffect(() => {
        setCategoryDetails({});
        setCategoryDetailError({});
        setExpandedRows({});
    }, [periodName]);'''

if old_state in content and 'Reset when period changes' not in content:
    content = content.replace(old_state, new_state)
    print('Fix 5: period-change reset effect added')

# ---- Fix 6: Period guard ----
old_guard = '        if (!category) {\n            return;\n        }\n        /* Already loaded */'
new_guard = '''        if (!category) {
            return;
        }
        /* Guard: skip API call without a period */
        if (!periodName) {
            setCategoryDetailError((prev) => ({
                ...prev,
                [category]: "Select a period to load details.",
            }));
            return;
        }
        /* Already loaded */'''

if old_guard in content and 'Guard: skip API call' not in content:
    content = content.replace(old_guard, new_guard)
    print('Fix 6: period guard added')

dest = PROJECT + r'\src\components\Tables\ExpenseCategoryDrillDown.jsx'
with open(dest, 'w', encoding='utf-8') as f:
    f.write(content)

token_count = len(re.findall(r'finsight_token', content))
monthly_count = content.count('category-detail-monthly')
print(f'\nSaved - finsight_token: {token_count}, category-detail-monthly: {monthly_count}')
print('Done')
