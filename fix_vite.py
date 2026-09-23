import json
with open('vite.config.js', 'r') as f:
    config = f.read()

# Add sourcemap: true to build config
if 'build: {' in config:
    config = config.replace('build: {', 'build: { sourcemap: true,')
else:
    config = config.replace('export default defineConfig({', 'export default defineConfig({ build: { sourcemap: true },')

with open('vite.config.js', 'w') as f:
    f.write(config)
