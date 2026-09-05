
import subprocess

PROJECT = r'c:\Users\SARATH\project dubai\Finsight Project'
BRANCH = 'zenith-finsight/feature/payables-dashboard'

def get_original(git_path):
    result = subprocess.run(
        ['git', 'show', f'{BRANCH}:{git_path}'],
        capture_output=True, cwd=PROJECT
    )
    if result.returncode != 0:
        print(f'  ERROR getting {git_path}: {result.stderr.decode()[:200]}')
        return None
    return result.stdout.decode('utf-8', errors='replace')

def save(local_path, content):
    full = f'{PROJECT}\\{local_path.replace("/", "\\")}'
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    size = len(content)
    print(f'  Saved {local_path} ({size:,} chars)')

# All Admin-related files that changed in Arshiya's branch
admin_files = [
    # AdminDashboard components
    'src/components/AdminDashboard/AlertsCard.jsx',
    'src/components/AdminDashboard/DashboardKPICard.jsx',
    'src/components/AdminDashboard/ETLStatusTable.jsx',
    'src/components/AdminDashboard/QualityChart.jsx',
    'src/components/AdminDashboard/QuickActions.jsx',
    'src/components/AdminDashboard/RecentActivity.jsx',
    'src/components/AdminDashboard/TrendChart.jsx',
    # Admin boundary/route components
    'src/components/AdminErrorBoundary.jsx',
    'src/components/AdminProtectedRoute.jsx',
    # Admin pages
    'src/pages/AdminDashboard.jsx',
    'src/pages/AdminMainDashboard.jsx',
    'src/pages/AdminPage.jsx',
    'src/pages/UserAccessManagement.jsx',
    'src/pages/UsersDashboard.jsx',
]

print('Restoring Admin files from Arshiya\'s branch...\n')
success = 0
for path in admin_files:
    print(f'Processing: {path}')
    content = get_original(path)
    if content:
        save(path, content)
        success += 1
    else:
        print(f'  SKIPPED (not found in Arshiya\'s branch)')

print(f'\nDone! {success}/{len(admin_files)} files restored successfully.')
