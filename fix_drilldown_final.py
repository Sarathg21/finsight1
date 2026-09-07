
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

# ---- Fix 2: Switch API endpoint to category-detail-monthly ----
content = content.replace(
    '? `${baseUrl}/opex/category-detail`\n                : `${baseUrl}/api/opex/category-detail`',
    '? `${baseUrl}/opex/category-detail-monthly`\n                : `${baseUrl}/api/opex/category-detail-monthly`'
)
print('Fix 2: API endpoint -> category-detail-monthly')

# ---- Fix 3: Smarter getMonthValue using prefix-match for "Jan-26" keys ----
# The API returns monthly_actual_aed = {"Jan-26": "6904800.11", ...}
# The table column month could be "JAN", "Jan", "jan" etc.
# We need to match "JAN" -> "Jan-26" by checking if key starts with "jan" (case-insensitive)
old_get_month = 'const getMonthValue = (\n    monthData,\n    month\n) => {'

new_get_month = '''const getMonthValue = (
    monthData,
    month
) => {
    /* ---------------------------------------------------------
       category-detail-monthly returns:
         account.monthly_actual_aed = { "Jan-26": "6904800.11", ... }
       Column headers are "JAN", "FEB", etc. (3-letter uppercase).
       Match by first 3 chars, case-insensitive prefix search.
    --------------------------------------------------------- */
    if (monthData?.monthly_actual_aed && month) {
        const prefix = String(month).substring(0, 3).toLowerCase();
        const matchKey = Object.keys(monthData.monthly_actual_aed)
            .find(k => k.toLowerCase().startsWith(prefix));
        if (matchKey !== undefined) {
            const val = monthData.monthly_actual_aed[matchKey];
            if (val !== undefined && val !== null && String(val) !== "") return val;
        }
    }
    if (monthData?.monthly_actual && month) {
        const prefix = String(month).substring(0, 3).toLowerCase();
        const matchKey = Object.keys(monthData.monthly_actual)
            .find(k => k.toLowerCase().startsWith(prefix));
        if (matchKey !== undefined) {
            const val = monthData.monthly_actual[matchKey];
            if (val !== undefined && val !== null && String(val) !== "") return val;
        }
    }'''

if old_get_month in content:
    content = content.replace(old_get_month, new_get_month)
    print('Fix 3: getMonthValue updated with prefix-match for "Jan-26" style keys')
else:
    print('Fix 3: WARNING - pattern not found!')

# ---- Fix 4: useEffect import ----
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
    print('Fix 5: period-change reset added')

# ---- Fix 6: Period guard ----
old_guard = '        if (!category) {\n            return;\n        }\n        /* Already loaded */'
new_guard = '''        if (!category) {
            return;
        }
        /* Guard: skip if no period */
        if (!periodName) {
            setCategoryDetailError((prev) => ({ ...prev, [category]: "Select a period." }));
            return;
        }
        /* Already loaded */'''
if old_guard in content and 'Guard: skip if no period' not in content:
    content = content.replace(old_guard, new_guard)
    print('Fix 6: period guard added')

dest = PROJECT + r'\src\components\Tables\ExpenseCategoryDrillDown.jsx'
with open(dest, 'w', encoding='utf-8') as f:
    f.write(content)

monthly_count = content.count('category-detail-monthly')
token_count = len(re.findall(r'finsight_token', content))
print(f'\nSaved - category-detail-monthly: {monthly_count}, finsight_token: {token_count}')
print('Done')
