from pathlib import Path
for path in ['app/api/auth/login/route.ts', 'lib/auth.ts']:
    p = Path(path)
    print('---', path, '---')
    text = p.read_text(encoding='utf8')
    for i, line in enumerate(text.splitlines(), start=1):
        print(f'{i}:{line}')
print('ROOT_DEV_DB_EXISTS=', Path('dev.db').exists())
print('PRISMA_DEV_DB_EXISTS=', Path('prisma/dev.db').exists())
print('ENV=', Path('.env').read_text(encoding='utf8'))
