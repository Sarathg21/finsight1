
import subprocess, re, os

PROJECT = r'c:\Users\SARATH\project dubai\Finsight Project'
BRANCH = 'zenith-finsight/feature/payables-dashboard'

files_to_fix = [
    'src/components/Tables/ExpenseCategoryDrillDown.jsx',
]

for path in files_to_fix:
    result = subprocess.run(
        ['git', 'show', f'{BRANCH}:{path}'],
        capture_output=True, cwd=PROJECT
    )
    content = result.stdout.decode('utf-8', errors='replace')

    wrong_count = len(re.findall(r'localStorage\.getItem\s*\(\s*"token"\s*\)', content))
    print(f'{path}: {wrong_count} wrong token key(s)')

    # Fix token key
    fixed = re.sub(
        r'(localStorage\.getItem\s*\(\s*)"token"(\s*\))',
        r'\1"finsight_token"\2',
        content
    )

    # Add useEffect to React import if not already there
    if 'useEffect' not in fixed and 'import React, { useState }' in fixed:
        fixed = fixed.replace(
            'import React, { useState } from "react";',
            'import React, { useState, useEffect } from "react";'
        )
        print(f'  Added useEffect import')

    # Add reset-on-period-change effect
    old_state = 'const [expandedRows, setExpandedRows] =\n        useState({});'
    new_state = '''const [expandedRows, setExpandedRows] =
        useState({});
    /* Reset when period changes */
    useEffect(() => {
        setCategoryDetails({});
        setCategoryDetailError({});
        setExpandedRows({});
    }, [periodName]);'''

    if old_state in fixed and 'Reset when period changes' not in fixed:
        fixed = fixed.replace(old_state, new_state)
        print(f'  Added period-change reset effect')

    # Add period guard
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

    if old_guard in fixed and 'Guard: skip API call' not in fixed:
        fixed = fixed.replace(old_guard, new_guard)
        print(f'  Added period guard')

    dest = os.path.join(PROJECT, path.replace('/', os.sep))
    with open(dest, 'w', encoding='utf-8') as f:
        f.write(fixed)
    right = len(re.findall(r'localStorage\.getItem\s*\(\s*"finsight_token"\s*\)', fixed))
    print(f'  Saved — finsight_token count: {right}')

print('\nAll done')
