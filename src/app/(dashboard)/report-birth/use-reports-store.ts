// src/state/use-reports-store.ts
import { create } from 'zustand'

export interface LiveBirthGenderData {
  month: string
  male:  number
  female:number
}

export type AgeGroups = Record<
  '50 and over'|'45–49'|'40–44'|'35–39'|
  '25–29'|'20–24'|'15–19'|'Under 15',
  number
>

type WeightGroups = Record<
  '3,000 - 3,499'|'2,500 - 2,999'|
  '1,500 - 1,999'|'1,000 - 1,499'|
  'Not Stated',
  number
>

interface ReportsState {
  totalBirthCount:               number
  liveBirthGenderData:           LiveBirthGenderData[]
  fatherAgeGroups:               AgeGroups
  motherAgeGroups:               AgeGroups
  motherBarangayGroups:          Record<string,number>
  marriageLegitimacyGroups:      Record<'MARITAL'|'NON_MARITAL',number>
  attendantTypeGroups:           Record<'Physician'|'Nurse'|'Midwife'|'Hilot'|'Others',number>
  birthRegistrationStatusGroups: Record<'On time registration'|'Late registration',number>
  weightGroups:                  WeightGroups
  placeOfBirthGroups:            Record<'Health facility'|'Home'|'Others', number>
  loading:                       boolean
  error:                         string|null
  fetchReport(
    startYear:number, startMonth:number,
    endYear:number,   endMonth:number
  ): Promise<void>
}

export const useReportsStore = create<ReportsState>((set) => ({
  totalBirthCount:               0,
  liveBirthGenderData:           [],
  fatherAgeGroups:               { '50 and over':0,'45–49':0,'40–44':0,'35–39':0,'25–29':0,'20–24':0,'15–19':0,'Under 15':0 },
  motherAgeGroups:               { '50 and over':0,'45–49':0,'40–44':0,'35–39':0,'25–29':0,'20–24':0,'15–19':0,'Under 15':0 },
  motherBarangayGroups:          {},
  marriageLegitimacyGroups:      { MARITAL:0, NON_MARITAL:0 },
  attendantTypeGroups:           { Physician:0, Nurse:0, Midwife:0, Hilot:0, Others:0 },
  birthRegistrationStatusGroups: { 'On time registration':0, 'Late registration':0 },
  weightGroups:                  { '3,000 - 3,499':0,'2,500 - 2,999':0,'1,500 - 1,999':0,'1,000 - 1,499':0,'Not Stated':0 },
  placeOfBirthGroups:            { 'Health facility':0, Home:0, Others:0 },
  loading:                       false,
  error:                         null,

  fetchReport: async (sy, sm, ey, em) => {
    set({ loading:true, error:null })
    try {
      const res = await fetch(
        `/api/reports/live-births-by-gender` +
        `?startYear=${sy}&startMonth=${sm}` +
        `&endYear=${ey}&endMonth=${em}`
      )
      if (!res.ok) throw new Error('Fetch failed')
      const {
        totalCount, monthlyData,
        fatherAgeGroups, motherAgeGroups,
        motherBarangayGroups, marriageLegitimacyGroups,
        attendantTypeGroups, birthRegistrationStatusGroups,
        weightGroups, placeOfBirthGroups
      } = await res.json()
      set({
        totalBirthCount:               totalCount,
        liveBirthGenderData:           monthlyData,
        fatherAgeGroups,
        motherAgeGroups,
        motherBarangayGroups,
        marriageLegitimacyGroups,
        attendantTypeGroups,
        birthRegistrationStatusGroups,
        weightGroups,
        placeOfBirthGroups,
        loading:                       false
      })
    } catch (err:any) {
      set({ error: err.message, loading:false })
    }
  }
}))
