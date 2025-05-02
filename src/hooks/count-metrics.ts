// src/hooks/count-metrics.ts
"use server"

import { prisma } from "@/lib/prisma"
import { FormType } from "@prisma/client"

interface MonthlyCount {
  month: string
  birth: number
  death: number
  marriage: number
}

interface RegistryMetrics {
  monthlyData: MonthlyCount[]
  trend: {
    percentage: string
    isUp: boolean
  }
}

interface BaseRegistration {
  name: string
  sex: string
  dateOfBirth: string
  registrationDate: string
  formType: FormType
}

interface GenderCount {
  male: number
  female: number
}

interface GenderData {
  name: string
  male: number
  female: number
}

export type PrismaModels =
  | "baseRegistryForm"
  | "birthCertificateForm"
  | "deathCertificateForm"
  | "marriageCertificateForm"

// Map relation names to the corresponding FormType
const modelToType: Record<Exclude<PrismaModels, "baseRegistryForm">, FormType> = {
  birthCertificateForm:    FormType.BIRTH,
  deathCertificateForm:    FormType.DEATH,
  marriageCertificateForm: FormType.MARRIAGE,
}

function monthBounds(offsetMonths: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1)
  const end   = new Date(start.getFullYear(), start.getMonth() + 1, 1)
  return { start, end }
}

export async function getRegistryMetrics(): Promise<RegistryMetrics> {
  const today = new Date()
  const last6Months = Array.from({ length: 6 }, (_, i) =>
    new Date(today.getFullYear(), today.getMonth() - i, 1)
  ).reverse()

  const rangeStart = last6Months[0]
  const rangeEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  const registryForms = await prisma.baseRegistryForm.findMany({
    where: {
      dateOfRegistration: { gte: rangeStart, lt: rangeEnd }
    },
    select: {
      formType: true,
      dateOfRegistration: true
    }
  })

  const monthlyData: MonthlyCount[] = last6Months.map(monthStart => {
    const monthNext  = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
    const label      = monthStart.toLocaleString("default", { month: "long" })
    const counts: MonthlyCount = { month: label, birth: 0, death: 0, marriage: 0 }

    for (const form of registryForms) {
      const dt = form.dateOfRegistration
      if (dt >= monthStart && dt < monthNext) {
        switch (form.formType) {
          case FormType.BIRTH:
            counts.birth++
            break
          case FormType.DEATH:
            counts.death++
            break
          case FormType.MARRIAGE:
            counts.marriage++
            break
        }
      }
    }

    return counts
  })

  const current  = monthlyData[monthlyData.length - 1]
  const previous = monthlyData[monthlyData.length - 2]!
  const currentTotal  = current.birth + current.death + current.marriage
  const previousTotal = previous.birth + previous.death + previous.marriage
  const changePct     = previousTotal
    ? ((currentTotal - previousTotal) / previousTotal) * 100
    : 0

  return {
    monthlyData,
    trend: {
      percentage: Math.abs(changePct).toFixed(1),
      isUp: changePct >= 0
    }
  }
}

export async function getRecentRegistrations(): Promise<BaseRegistration[]> {
  const regs = await prisma.baseRegistryForm.findMany({
    include: {
      birthCertificateForm:    true,
      deathCertificateForm:    true,
      marriageCertificateForm: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return regs.map(reg => {
    const r: BaseRegistration = {
      name: "",
      sex: "",
      dateOfBirth: "",
      registrationDate: reg.createdAt.toISOString().split("T")[0],
      formType: reg.formType
    }

    if (reg.birthCertificateForm) {
      const nameObj = reg.birthCertificateForm.childName as { first: string; middle?: string; last: string }
      r.name = `${nameObj.last}, ${nameObj.first} ${nameObj.middle || ""}`.trim()
      r.sex = reg.birthCertificateForm.sex
      r.dateOfBirth = reg.birthCertificateForm.dateOfBirth.toISOString().split("T")[0]
    } else if (reg.deathCertificateForm) {
      const nameObj = reg.deathCertificateForm.deceasedName as { first: string; middle?: string; last: string }
      r.name = `${nameObj.last}, ${nameObj.first} ${nameObj.middle || ""}`.trim()
      r.sex = reg.deathCertificateForm.sex ?? ""
      const dob = reg.deathCertificateForm.dateOfBirth
      r.dateOfBirth = dob instanceof Date
        ? dob.toISOString().split("T")[0]
        : String(dob || "")
    } else if (reg.marriageCertificateForm) {
      const m = reg.marriageCertificateForm
      r.name = `${m.husbandLastName}, ${m.husbandFirstName} & ${m.wifeLastName}, ${m.wifeFirstName}`
      r.sex = "N/A"
      r.dateOfBirth = m.dateOfMarriage.toISOString().split("T")[0]
    }

    return r
  })
}

export async function getCurrentMonthRegistrations(model: PrismaModels): Promise<number> {
  const { start, end } = monthBounds(0)
  const where: any = { dateOfRegistration: { gte: start, lt: end } }
  if (model !== "baseRegistryForm") {
    where.formType = modelToType[model]
  }
  return prisma.baseRegistryForm.count({ where })
}

export async function getPreviousMonthRegistrations(model: PrismaModels): Promise<number> {
  const { start, end } = monthBounds(1)
  const where: any = { dateOfRegistration: { gte: start, lt: end } }
  if (model !== "baseRegistryForm") {
    where.formType = modelToType[model]
  }
  return prisma.baseRegistryForm.count({ where })
}

export async function getBirthAndDeathGenderCount(type: "birth" | "death"): Promise<GenderData[]> {
  const birthResults = await prisma.birthCertificateForm.findMany({
    select: { sex: true, baseForm: { select: { createdAt: true } } }
  })
  const deathResults = await prisma.deathCertificateForm.findMany({
    select: { sex: true, baseForm: { select: { createdAt: true } } }
  })

  const grouped = new Map<string, GenderCount>()
  const process = (rows: typeof birthResults | typeof deathResults) => {
    rows.forEach(r => {
      const dt = r.baseForm?.createdAt
      const sex = r.sex?.toLowerCase()
      if (!dt || !sex) return
      const date = dt.toISOString().split("T")[0]
      if (!grouped.has(date)) grouped.set(date, { male: 0, female: 0 })
      const cnt = grouped.get(date)!
      if (sex === "male" || sex === "female") cnt[sex]++
    })
  }

  if (type === "birth") process(birthResults)
  else process(deathResults)

  return Array.from(grouped.entries())
    .map(([name, c]) => ({ name, male: c.male, female: c.female }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Returns the total count for the given model.
 */
export async function getTotalRegistrations(model: PrismaModels): Promise<number> {
  switch (model) {
    case "baseRegistryForm":
      return prisma.baseRegistryForm.count()
    case "birthCertificateForm":
      return prisma.birthCertificateForm.count()
    case "deathCertificateForm":
      return prisma.deathCertificateForm.count()
    case "marriageCertificateForm":
      return prisma.marriageCertificateForm.count()
  }
}
