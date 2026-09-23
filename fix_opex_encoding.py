
import subprocess, re

"""
Arshiya's files were copied via PowerShell Out-File which double-encoded all 
multi-byte UTF-8 characters. This script:
1. Gets the originals from Arshiya's git branch (correct UTF-8)
2. Re-applies our specific fixes (token key, useEffect, period guard, auto-apply)
3. Saves properly as UTF-8
"""

PROJECT = r'c:\Users\SARATH\project dubai\Finsight Project'
BRANCH = 'zenith-finsight/feature/payables-dashboard'

def get_original(git_path):
    result = subprocess.run(
        ['git', 'show', f'{BRANCH}:{git_path}'],
        capture_output=True, cwd=PROJECT
    )
    if result.returncode != 0:
        print(f'  ERROR getting {git_path}: {result.stderr.decode()}')
        return None
    return result.stdout.decode('utf-8', errors='replace')

def save(local_path, content):
    full = f'{PROJECT}\\{local_path.replace("/", "\\")}'
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  Saved {local_path}')

# ============================================================
# FIX ExpenseCategoryDrillDown.jsx
# ============================================================
print('\n=== ExpenseCategoryDrillDown.jsx ===')
content = get_original('src/components/Tables/ExpenseCategoryDrillDown.jsx')
if content:
    # Fix 1: Wrong token key
    content = content.replace('localStorage.getItem("token")', 'localStorage.getItem("finsight_token")')
    # Fix 2: Add useEffect import
    content = content.replace(
        'import React, { useState } from "react";',
        'import React, { useState, useEffect } from "react";'
    )
    # Fix 3: Add reset-on-period-change useEffect and period guard
    # Find where expandedRows state is declared and add after it
    content = content.replace(
        'const [expandedRows, setExpandedRows] =\n        useState({});',
        '''const [expandedRows, setExpandedRows] =
        useState({});
    /* Reset details when period changes */
    useEffect(() => {
        setCategoryDetails({});
        setCategoryDetailError({});
        setExpandedRows({});
    }, [periodName]);'''
    )
    # Fix 4: Add period guard before API call
    old_guard = '''        if (!category) {
            return;
        }
        /* Already loaded */'''
    new_guard = '''        if (!category) {
            return;
        }
        /* Guard: no API call without a period */
        if (!periodName) {
            setCategoryDetailError((prev) => ({
                ...prev,
                [category]: "Select a period to load details.",
            }));
            return;
        }
        /* Already loaded */'''
    content = content.replace(old_guard, new_guard)
    save('src/components/Tables/ExpenseCategoryDrillDown.jsx', content)
    print('  Token fix + useEffect + period guard applied')

# ============================================================
# FIX MonthOnMonthOpexReport.jsx
# ============================================================
print('\n=== MonthOnMonthOpexReport.jsx ===')
content = get_original('src/components/Tables/MonthOnMonthOpexReport.jsx')
if content:
    # Fix: Wrong token key
    content = content.replace('localStorage.getItem("token")', 'localStorage.getItem("finsight_token")')
    save('src/components/Tables/MonthOnMonthOpexReport.jsx', content)
    print('  Token fix applied')

# ============================================================
# FIX Filters.jsx - add auto-apply useEffect
# ============================================================
print('\n=== Filters.jsx ===')
content = get_original('src/components/Filters/Filters.jsx')
if content:
    # Add autoApplied ref and useEffect for initial auto-apply
    content = content.replace(
        'const [opexFilterLoading, setOpexFilterLoading] =\n    useState(false);',
        '''const [opexFilterLoading, setOpexFilterLoading] =
    useState(false);
  /* Auto-apply once after defaults are loaded */
  const autoApplied = React.useRef(false);'''
    )
    # Add the auto-apply effect after the OPEX Default Values effect
    old_deps = '''  }, [
    opexFilterOptions,
    filterOptions,
    isOperatingExpenses,
  ]);
  /* =======================================================
     OPEX Filter Change'''
    new_deps = '''  }, [
    opexFilterOptions,
    filterOptions,
    isOperatingExpenses,
  ]);
  /* =======================================================
     OPEX Auto Apply once on initial load
  ======================================================= */
  useEffect(() => {
    if (!isOperatingExpenses) return;
    if (autoApplied.current) return;
    if (!selectedFilters?.period) return;
    autoApplied.current = true;
    if (onApply) {
      onApply(selectedFilters);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters?.period, isOperatingExpenses]);
  /* =======================================================
     OPEX Filter Change'''
    content = content.replace(old_deps, new_deps)
    save('src/components/Filters/Filters.jsx', content)
    print('  Auto-apply useEffect applied')

# ============================================================
# Restore other OPEX files that may have garbled chars
# ============================================================
opex_files = [
    'src/components/Cards/OperatingExpenseSummary.jsx',
    'src/components/Charts/ActualvsTargetChart.jsx',
    'src/components/Charts/OpexCompositionChart.jsx',
    'src/api/opexApi.js',
]

for path in opex_files:
    print(f'\n=== {path} ===')
    content = get_original(path)
    if content:
        save(path, content)
        print('  Restored from git (proper UTF-8)')

print('\n\nAll done!')
