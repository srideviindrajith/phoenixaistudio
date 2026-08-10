import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PROFILE_KEY = 'site_profile'
const DEFAULT_SITE_NAME = 'PhoenixAI Studio'
const DEFAULT_INSTAGRAM_ID = '@phoenixai.studio'

function stripCacheFromUrl(value: string | null | undefined) {
  return (value || '').trim().split('?')[0]
}

function normalizeInstagramId(value: string | null | undefined) {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''

  const username = trimmed
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^instagram\.com\//i, '')
    .split(/[/?#]/)[0]
    .replace(/^@+/, '')
    .trim()

  return username ? `@${username}` : ''
}

async function ensureProfileSetting() {
  const rows = await prisma.setting.findMany({ orderBy: { createdAt: 'asc' } })
  const profile = rows.find((setting) => setting.key === PROFILE_KEY)
  if (profile) return { profile, rows }

  const logoRow = rows.find((setting) => Boolean(setting.logo_url))
  const instagramRow = rows.find((setting) => Boolean(setting.instagram_id))
  const siteNameRow = rows.find((setting) => setting.key === 'site_name')
  const instagramValueRow = rows.find((setting) => setting.key === 'instagram_id')
  const legacyInstagramRow = rows.find((setting) => setting.key === 'contact_instagram')
  const seed = logoRow || instagramRow || siteNameRow || rows[0]

  const siteName = siteNameRow?.value || seed?.siteName || DEFAULT_SITE_NAME
  const instagramId =
    normalizeInstagramId(
      instagramRow?.instagram_id ||
        instagramValueRow?.value ||
        legacyInstagramRow?.value ||
        seed?.instagram_id ||
        DEFAULT_INSTAGRAM_ID
    ) || DEFAULT_INSTAGRAM_ID

  const createdProfile = await prisma.setting.upsert({
    where: { key: PROFILE_KEY },
    update: {
      siteName,
      logo_url: stripCacheFromUrl(logoRow?.logo_url || seed?.logo_url),
      instagram_id: instagramId,
      type: 'profile',
    },
    create: {
      key: PROFILE_KEY,
      value: '',
      type: 'profile',
      siteName,
      logo_url: stripCacheFromUrl(logoRow?.logo_url || seed?.logo_url),
      instagram_id: instagramId,
    },
  })

  return { profile: createdProfile, rows: [...rows, createdProfile] }
}

async function getSettingsMap() {
  const { profile, rows } = await ensureProfileSetting()
  const settingsMap: Record<string, string> = {}

  rows.forEach((setting) => {
    if (setting.key && setting.key !== PROFILE_KEY) {
      settingsMap[setting.key] = setting.value ?? ''
    }
  })

  const siteName = settingsMap.site_name || profile.siteName || DEFAULT_SITE_NAME
  const instagramId =
    normalizeInstagramId(
      profile.instagram_id ||
        settingsMap.instagram_id ||
        settingsMap.contact_instagram ||
        DEFAULT_INSTAGRAM_ID
    ) || DEFAULT_INSTAGRAM_ID

  settingsMap.site_name = siteName
  settingsMap.siteName = siteName
  settingsMap.logo_url = stripCacheFromUrl(profile.logo_url || settingsMap.logo_url)
  settingsMap.instagram_id = instagramId
  delete settingsMap.contact_instagram

  return settingsMap
}

async function updateSettingValue(key: string, value: string, type = 'text') {
  const normalizedKey =
    key === 'siteName' ? 'site_name' : key === 'contact_instagram' ? 'instagram_id' : key
  const normalizedValue =
    normalizedKey === 'instagram_id'
      ? normalizeInstagramId(value)
      : normalizedKey === 'logo_url'
        ? stripCacheFromUrl(value)
        : value

  const setting = await prisma.setting.upsert({
    where: { key: normalizedKey },
    update: { value: normalizedValue, type },
    create: { key: normalizedKey, value: normalizedValue, type },
  })

  if (['site_name', 'instagram_id', 'logo_url'].includes(normalizedKey)) {
    const { profile } = await ensureProfileSetting()
    await prisma.setting.update({
      where: { id: profile.id },
      data: {
        ...(normalizedKey === 'site_name'
          ? { siteName: normalizedValue || DEFAULT_SITE_NAME }
          : {}),
        ...(normalizedKey === 'instagram_id'
          ? { instagram_id: normalizedValue || DEFAULT_INSTAGRAM_ID }
          : {}),
        ...(normalizedKey === 'logo_url' ? { logo_url: normalizedValue } : {}),
      },
    })
  }

  return setting
}

export async function GET() {
  try {
    const settings = await getSettingsMap()

    // Compute dynamic hero statistics
    // Projects Delivered
    const projectCount = await prisma.project.count()
    const projectsStat = projectCount > 0 ? `${projectCount}+` : 'Accepting New Projects'

    // Happy Clients (using contacts as clients)
    const clientCount = await prisma.contact.count()
    const clientsStat = clientCount > 0 ? `${clientCount}+` : 'Growing Portfolio'

    // Years Experience based on founded year setting (optional)
    const foundingYearStr = settings.founded_year || ''
    const currentYear = new Date().getFullYear()
    let yearsExpStat: string
    if (foundingYearStr) {
      const foundingYear = parseInt(foundingYearStr, 10)
      const years = currentYear - foundingYear
      yearsExpStat = years > 0 ? `${years}+` : `Founded ${currentYear}`
    } else {
      yearsExpStat = `Founded ${currentYear}`
    }

    // Client Satisfaction from approved testimonials average rating
    const testimonialAgg = await prisma.testimonial.aggregate({
      _avg: { rating: true },
      where: { approved: true },
    })
    const avgRating = testimonialAgg._avg.rating
    const satisfactionStat = avgRating ? `${Math.round((avgRating / 5) * 100)}%` : 'New Startup'

    // Merge stats into settings
    settings.hero_stats_projects = projectsStat
    settings.hero_stats_clients = clientsStat
    settings.hero_stats_experience = yearsExpStat
    settings.hero_stats_satisfaction = satisfactionStat
    
    // Add Career Builder category visibility (default to true if not set)
    const careerBuilderSetting = await prisma.setting.findUnique({
      where: { key: 'careerBuilderCategoryVisible' }
    })
    settings.careerBuilderCategoryVisible = careerBuilderSetting?.value === 'false' ? 'false' : 'true'
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle Career Builder category visibility toggle
    if (body.careerBuilderCategoryVisible !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'careerBuilderCategoryVisible' },
        update: { value: body.careerBuilderVisible ? 'true' : 'false', type: 'boolean' },
        create: { key: 'careerBuilderCategoryVisible', value: body.careerBuilderCategoryVisible ? 'true' : 'false', type: 'boolean' }
      })
      return NextResponse.json({ careerBuilderCategoryVisible: body.careerBuilderCategoryVisible })
    }

    if (body.settings && typeof body.settings === 'object') {
      await Promise.all(
        Object.entries(body.settings).map(([key, value]) =>
          updateSettingValue(key, String(value ?? ''), body.type || 'text')
        )
      )
      return NextResponse.json({ settings: await getSettingsMap() })
    }

    const { key, value, type } = body
    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 })
    }

    const setting = await updateSettingValue(key, String(value ?? ''), type || 'text')
    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
