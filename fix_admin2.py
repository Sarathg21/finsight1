
import subprocess, os

PROJECT = r'c:\Users\SARATH\project dubai\Finsight Project'
BRANCH = 'zenith-finsight/feature/payables-dashboard'

def get_original(git_path):
    result = subprocess.run(
        ['git', 'show', f'{BRANCH}:{git_path}'],
        capture_output=True, cwd=PROJECT
    )
    if result.returncode != 0:
        return None
    return result.stdout.decode('utf-8', errors='replace')

def save(local_path, content):
    full = os.path.join(PROJECT, local_path.replace('/', os.sep))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  SAVED {local_path} ({len(content):,} chars)')

# Files from Arshiya's branch that we need
files_to_get = [
    # Layout components (new in Arshiya's branch)
    'src/components/Layout/AdminLayout.jsx',
    'src/components/Layout/NavbarAdmin.jsx',
    'src/components/Layout/SidebarAdmin.jsx',
    'src/components/Layout/Layout.jsx',
    'src/components/Layout/Navbar.jsx',
    # Admin pages (already restored, but double-check)
    'src/pages/AdminDashboard.jsx',
    'src/pages/AdminMainDashboard.jsx',
    'src/pages/AdminPage.jsx',
    'src/pages/UserAccessManagement.jsx',
    'src/pages/UsersDashboard.jsx',
]

print(f'Pulling files from {BRANCH}...\n')
success = 0
for path in files_to_get:
    content = get_original(path)
    if content:
        save(path, content)
        success += 1
    else:
        print(f'  SKIP (not in branch): {path}')

print(f'\nDone! {success}/{len(files_to_get)} files restored.')
