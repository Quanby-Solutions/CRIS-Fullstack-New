// src/app/api/reports/live-births-by-gender/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Define a single interface where both min and max are optional
interface AgeBracket {
  label: string
  min?: number
  max?: number
}

const AGE_BRACKETS: AgeBracket[] = [
  { label: '50 and over', min: 50 },
  { label: '45–49',       min: 45, max: 49 },
  { label: '40–44',       min: 40, max: 44 },
  { label: '35–39',       min: 35, max: 39 },
  { label: '25–29',       min: 25, max: 29 },
  { label: '20–24',       min: 20, max: 24 },
  { label: '15–19',       min: 15, max: 19 },
  { label: 'Under 15',    max: 14 },
]

function initGroups<Label extends string>(
  labels: readonly Label[]
): Record<Label, number> {
  const acc = {} as Record<Label, number>
  labels.forEach(label => { acc[label] = 0 })
  return acc
}

export async function GET(request: Request) {
  if (request.method !== 'GET') {
    return NextResponse.json({}, { status: 405 })
  }

  const { searchParams } = new URL(request.url)
  const sy = parseInt(searchParams.get('startYear')  || '', 10)
  const sm = parseInt(searchParams.get('startMonth') || '', 10)
  const ey = parseInt(searchParams.get('endYear')    || '', 10)
  const em = parseInt(searchParams.get('endMonth')   || '', 10)

  if ([sy, sm, ey, em].some(Number.isNaN)) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  const startDate = new Date(sy, sm - 1, 1)
  const endDate   = new Date(ey, em, 0, 23, 59, 59)

  const forms = await prisma.baseRegistryForm.findMany({
    where: {
      formType: 'BIRTH',
      dateOfRegistration: { gte: startDate, lte: endDate }
    },
    include: { birthCertificateForm: true }
  })

  const totalCount = forms.length

  // Build monthlyData
  const monthlyMap = new Map<string, { month: string; male: number; female: number }>()
  for (const { dateOfRegistration, birthCertificateForm } of forms) {
    if (!birthCertificateForm) continue
    const y = dateOfRegistration.getFullYear()
    const m = String(dateOfRegistration.getMonth() + 1).padStart(2, '0')
    const key = `${y}-${m}`

    const entry = monthlyMap.get(key) ?? { month: key, male: 0, female: 0 }
    if (birthCertificateForm.sex === 'Male')   entry.male++
    if (birthCertificateForm.sex === 'Female') entry.female++
    monthlyMap.set(key, entry)
  }
  const monthlyData = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))

  // Build age groups
  const ageLabels = AGE_BRACKETS.map(b => b.label) as readonly string[]
  const fatherAgeGroups = initGroups(ageLabels)
  const motherAgeGroups = initGroups(ageLabels)
  for (const { birthCertificateForm } of forms) {
    if (!birthCertificateForm) continue
    const { fatherAge, motherAge } = birthCertificateForm
    for (const [field, raw] of Object.entries({ fatherAge, motherAge })) {
      const age = Number(raw)
      if (Number.isNaN(age)) continue

      const target = field === 'fatherAge' ? fatherAgeGroups : motherAgeGroups
      const bracket = AGE_BRACKETS.find(b => {
        if (b.min != null && b.max != null) {
          return age >= b.min && age <= b.max
        } else if (b.min != null) {
          return age >= b.min
        } else if (b.max != null) {
          return age <= b.max
        }
        return false
      })
      if (bracket) target[bracket.label]++
    }
  }

  // Build motherBarangayGroups
  const motherBarangayGroups: Record<string, number> = {}
  for (const { birthCertificateForm } of forms) {
    if (!birthCertificateForm) continue
    const res = birthCertificateForm.motherResidence as any
    const bgy  = res.barangay?.trim() || 'Unknown'
    const city = res.cityMunicipality?.trim() || ''
    const key  = city === 'City of Legazpi' ? bgy : 'Outside Legazpi'
    motherBarangayGroups[key] = (motherBarangayGroups[key] || 0) + 1
  }

  // Build marriageLegitimacyGroups (with null-check)
  const marriageLegitimacyGroups = { MARITAL: 0, NON_MARITAL: 0 }
  for (const { birthCertificateForm } of forms) {
    if (!birthCertificateForm) continue
    const pm = birthCertificateForm.parentMarriage as { date?: string } | null
    // treat missing or 'Not Married' as NON_MARITAL
    const isNonMarital = !pm || pm.date === 'Not Married'
    const key = isNonMarital ? 'NON_MARITAL' : 'MARITAL'
    marriageLegitimacyGroups[key as keyof typeof marriageLegitimacyGroups]++
  }

  // Build attendantTypeGroups
  const attendantLabels = ['Physician','Nurse','Midwife','Hilot','Others'] as const
  const attendantTypeGroups = initGroups(attendantLabels)
  for (const { birthCertificateForm } of forms) {
    if (!birthCertificateForm) continue
    const att = birthCertificateForm.attendant as { type?: string }
    const rawType = att.type ?? 'Others'
    const key = (attendantLabels as readonly string[]).includes(rawType)
      ? rawType
      : 'Others'
    attendantTypeGroups[key as keyof typeof attendantTypeGroups]++
  }

  // Build birthRegistrationStatusGroups
  const birthRegistrationStatusGroups = initGroups([
    'On time registration',
    'Late registration'
  ] as const)
  for (const { birthCertificateForm } of forms) {
    if (!birthCertificateForm) continue
    const delayed = birthCertificateForm.isDelayedRegistration
    const key = delayed ? 'Late registration' : 'On time registration'
    birthRegistrationStatusGroups[key as keyof typeof birthRegistrationStatusGroups]++
  }

  // Build weightGroups
  const weightLabels = [
    '3,000 - 3,499',
    '2,500 - 2,999',
    '1,500 - 1,999',
    '1,000 - 1,499',
    'Not Stated'
  ] as const
  const weightGroups = initGroups(weightLabels)
  for (const { birthCertificateForm } of forms) {
    if (!birthCertificateForm) continue
    const raw = birthCertificateForm.weightAtBirth
    const num = Number(raw)
    let key: typeof weightLabels[number]
    if (Number.isNaN(num)) {
      key = 'Not Stated'
    } else if (num >= 3000 && num <= 3499) {
      key = '3,000 - 3,499'
    } else if (num >= 2500 && num <= 2999) {
      key = '2,500 - 2,999'
    } else if (num >= 1500 && num <= 1999) {
      key = '1,500 - 1,999'
    } else if (num >= 1000 && num <= 1499) {
      key = '1,000 - 1,499'
    } else {
      key = 'Not Stated'
    }
    weightGroups[key]++
  }

  // Build placeOfBirthGroups
  const placeOfBirthLabels = ['Health facility', 'Home', 'Others'] as const
  const placeOfBirthGroups = initGroups(placeOfBirthLabels)
  for (const { birthCertificateForm } of forms) {
    if (!birthCertificateForm) continue
    const pb = birthCertificateForm.placeOfBirth as any
    const hospital = (pb.hospital ?? '').toLowerCase()

    let category: typeof placeOfBirthLabels[number]
    if (
      hospital.includes('hospital') ||
      hospital.includes('clinic') ||
      hospital.includes('medical')
    ) {
      category = 'Health facility'
    } else if (hospital.includes('barangay')) {
      category = 'Home'
    } else {
      category = 'Others'
    }

    placeOfBirthGroups[category]++
  }

  return NextResponse.json({
    totalCount,
    monthlyData,
    fatherAgeGroups,
    motherAgeGroups,
    motherBarangayGroups,
    marriageLegitimacyGroups,
    attendantTypeGroups,
    birthRegistrationStatusGroups,
    weightGroups,
    placeOfBirthGroups
  })
}
