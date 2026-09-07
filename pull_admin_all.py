
import subprocess, os, re

PROJECT = r'c:\Users\SARATH\project dubai\Finsight Project'
BRANCH = 'zenith-finsight/feature/payables-dashboard'

def pull(path):
    result = subprocess.run(
        ['git', 'show', f'{BRANCH}:{path}'],
        capture_output=True, cwd=PROJECT
    )
    if result.returncode != 0:
        return None
    return result.stdout.decode('utf-8', errors='replace')

def save(path, content):
    full = os.path.join(PROJECT, path.replace('/', os.sep))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  SAVED {path} ({len(content):,} chars)')

# All admin/user related files that differ
files = [
    # User sub-components
    'src/components/users/UserTable.jsx',
    'src/components/users/UserDetails.jsx',
    'src/components/users/AddUserModal.jsx',
    'src/components/users/RoleAccessTab.jsx',
    'src/components/users/Users.jsx',
    # Roles sub-components
    'src/components/roles/UserAssignment.jsx',
    # User Access sub-components
    'src/components/userAccess/HierarchyTree.jsx',
    'src/components/userAccess/SelectUserCard.jsx',
    # Shared components
    'src/components/StatCard.jsx',
    # Common components (lowercase 'common' path)
    'src/components/common/Checkbox.jsx',
    'src/components/common/ConfirmationModel.jsx',
    'src/components/common/FilterBar.jsx',
    'src/components/common/PageHeader.jsx',
    'src/components/common/PageSkeleton.jsx',
    'src/components/common/SaveFooter.jsx',
    'src/components/common/SelectField.jsx',
    'src/components/common/Toggle.jsx',
    'src/components/common/UnsavedChangesModal.jsx',
    # Admin Dashboard sub-components
    'src/components/AdminDashboard/AlertsCard.jsx',
    'src/components/AdminDashboard/DashboardKPICard.jsx',
    'src/components/AdminDashboard/ETLStatusTable.jsx',
    'src/components/AdminDashboard/QualityChart.jsx',
    'src/components/AdminDashboard/QuickActions.jsx',
    'src/components/AdminDashboard/RecentActivity.jsx',
    'src/components/AdminDashboard/TrendChart.jsx',
    # Admin protected route
    'src/components/AdminProtectedRoute.jsx',
    # Data files
    'src/data/adminDashboardData.js',
    # Services
    'src/services/adminApi.js',
    # Admin pages (re-pull to be sure)
    'src/pages/AdminDashboard.jsx',
    'src/pages/AdminMainDashboard.jsx',
    'src/pages/AdminPage.jsx',
    'src/pages/UsersDashboard.jsx',
    'src/pages/UserAccessManagement.jsx',
    # Roles page
    'src/pages/RolesDashboard.jsx',
    # Master data page
    'src/pages/MasterDataDashboard.jsx',
]

print(f'Pulling {len(files)} files from {BRANCH}...\n')
ok = 0
skip = 0
for path in files:
    content = pull(path)
    if content:
        save(path, content)
        ok += 1
    else:
        print(f'  SKIP (not in branch): {path}')
        skip += 1

print(f'\nDone: {ok} saved, {skip} skipped')
