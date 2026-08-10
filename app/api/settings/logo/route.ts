import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

const PROFILE_KEY = 'site_profile';
const DEFAULT_SITE_NAME = 'PhoenixAI Studio';
const DEFAULT_INSTAGRAM_ID = '@phoenixai.studio';

function normalizeInstagramId(value: string | null | undefined) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';

  const username = trimmed
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^instagram\.com\//i, '')
    .split(/[/?#]/)[0]
    .replace(/^@+/, '')
    .trim();

  return username ? `@${username}` : '';
}

async function ensureProfileSetting() {
  const rows = await prisma.setting.findMany({ orderBy: { createdAt: 'asc' } });
  const profile = rows.find((setting) => setting.key === PROFILE_KEY);
  if (profile) return profile;

  const logoRow = rows.find((setting) => Boolean(setting.logo_url));
  const siteNameRow = rows.find((setting) => setting.key === 'site_name');
  const instagramRow = rows.find((setting) => Boolean(setting.instagram_id));
  const instagramValueRow = rows.find((setting) => setting.key === 'instagram_id');
  const legacyInstagramRow = rows.find((setting) => setting.key === 'contact_instagram');
  const seed = logoRow || siteNameRow || instagramRow || rows[0];

  return prisma.setting.upsert({
    where: { key: PROFILE_KEY },
    update: {
      siteName: siteNameRow?.value || seed?.siteName || DEFAULT_SITE_NAME,
      logo_url: (logoRow?.logo_url || seed?.logo_url || '').split('?')[0],
      instagram_id:
        normalizeInstagramId(
          instagramRow?.instagram_id ||
            instagramValueRow?.value ||
            legacyInstagramRow?.value ||
            seed?.instagram_id ||
            DEFAULT_INSTAGRAM_ID
        ) || DEFAULT_INSTAGRAM_ID,
      type: 'profile',
    },
    create: {
      key: PROFILE_KEY,
      value: '',
      type: 'profile',
      siteName: siteNameRow?.value || seed?.siteName || DEFAULT_SITE_NAME,
      logo_url: (logoRow?.logo_url || seed?.logo_url || '').split('?')[0],
      instagram_id:
        normalizeInstagramId(
          instagramRow?.instagram_id ||
            instagramValueRow?.value ||
            legacyInstagramRow?.value ||
            seed?.instagram_id ||
            DEFAULT_INSTAGRAM_ID
        ) || DEFAULT_INSTAGRAM_ID,
    },
  });
}

function getLogoExtension(type: string) {
  switch (type) {
    case 'image/svg+xml':
      return 'svg';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    default:
      return 'png';
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Validate type
    const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logo');
    await fs.mkdir(uploadDir, { recursive: true });

    await Promise.all(
      ['png', 'jpg', 'jpeg', 'svg', 'webp'].map((ext) =>
        fs.rm(path.join(uploadDir, `logo.${ext}`), { force: true })
      )
    );

    const extension = getLogoExtension(file.type);
    const fileName = `logo.${extension}`;
    const filePath = path.join(uploadDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, new Uint8Array(arrayBuffer));

    const logoPath = `/uploads/logo/${fileName}`;
    const setting = await ensureProfileSetting();

    await prisma.setting.update({
      where: { id: setting.id },
      data: {
        logo_url: logoPath
      }
    });
    await prisma.setting.upsert({
      where: { key: 'logo_url' },
      update: { value: logoPath, type: 'image' },
      create: { key: 'logo_url', value: logoPath, type: 'image' },
    });

    return NextResponse.json({
      success: true,
      logo_url: logoPath
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logo');
    await Promise.all(
      ['png', 'jpg', 'jpeg', 'svg', 'webp'].map((ext) =>
        fs.rm(path.join(uploadDir, `logo.${ext}`), { force: true })
      )
    );
    const setting = await ensureProfileSetting();
    await prisma.setting.update({
      where: { id: setting.id },
      data: { logo_url: '' },
    });
    await prisma.setting.upsert({
      where: { key: 'logo_url' },
      update: { value: '', type: 'image' },
      create: { key: 'logo_url', value: '', type: 'image' },
    });
    return NextResponse.json({ success: true, logo_url: '' });
  } catch (error) {
    console.error('Logo removal error:', error);
    return NextResponse.json({ error: 'Removal failed' }, { status: 500 });
  }
}
