// src/components/LiveBirthGenderReportWithFilter.tsx
'use client'

import { useState, useEffect } from 'react'
import { useReportsStore, type AgeGroups } from './use-reports-store'
import Papa                     from 'papaparse'
import { Button }               from '@/components/ui/button'
import { toast }                from 'sonner'

export default function LiveBirthGenderReportWithFilter() {
  const now          = new Date()
  const currentYear  = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const years        = Array.from({ length:5 }, (_,i)=>currentYear-i)

  const [startYear, setStartYear]   = useState(currentYear)
  const [startMonth, setStartMonth] = useState(currentMonth)
  const [endYear, setEndYear]       = useState(currentYear)
  const [endMonth, setEndMonth]     = useState(currentMonth)

  const {
    totalBirthCount,
    liveBirthGenderData,
    fatherAgeGroups,
    motherAgeGroups,
    motherBarangayGroups,
    marriageLegitimacyGroups,
    attendantTypeGroups,
    birthRegistrationStatusGroups,
    weightGroups,
    placeOfBirthGroups,
    loading,
    error,
    fetchReport
  } = useReportsStore()

  useEffect(() => {
    fetchReport(startYear, startMonth, endYear, endMonth)
  }, [startYear, startMonth, endYear, endMonth, fetchReport])

  const exportAllToCSV = () => {
    const rows: (string|number)[][] = []

    rows.push(['Live births by gender — Legazpi City'])
    rows.push(['Total registered births', totalBirthCount])
    rows.push([])

    // Gender
    rows.push(['Gender'])
    rows.push(['Month','Male','Female'])
    liveBirthGenderData.forEach(r => {
      rows.push([r.month, r.male, r.female])
    })
    rows.push([])

    // Age distribution
    rows.push(['Age distribution (Father vs Mother)'])
    rows.push(['Age Group','Fathers','Mothers'])
    const ageGroupKeys = Object.keys(fatherAgeGroups) as Array<keyof AgeGroups>
    ageGroupKeys.forEach(group => {
      rows.push([group, fatherAgeGroups[group], motherAgeGroups[group]])
    })
    rows.push([])

    // Mother’s Barangay
    rows.push(['Mother’s Barangay Distribution'])
    rows.push(['Barangay','Count'])
    Object.entries(motherBarangayGroups).forEach(([k,v]) => {
      rows.push([k, v])
    })
    rows.push([])

    // Marriage Legitimacy
    rows.push(['Marriage Legitimacy'])
    rows.push(['Status','Count'])
    Object.entries(marriageLegitimacyGroups).forEach(([k,v]) => {
      rows.push([k, v])
    })
    rows.push([])

    // Attendant at Birth
    rows.push(['Attendant at Birth'])
    rows.push(['Type','Count'])
    Object.entries(attendantTypeGroups).forEach(([k,v]) => {
      rows.push([k, v])
    })
    rows.push([])

    // Birth Registration Status
    rows.push(['Birth Registration Status'])
    rows.push(['Status','Count'])
    Object.entries(birthRegistrationStatusGroups).forEach(([k,v]) => {
      rows.push([k, v])
    })
    rows.push([])

    // Weight at Birth
    rows.push(['Weight at Birth'])
    rows.push(['Range','Count'])
    Object.entries(weightGroups).forEach(([k,v]) => {
      rows.push([k, v])
    })
    rows.push([])

    // Place of Birth
    rows.push(['Place of Birth Distribution'])
    rows.push(['Category','Count'])
    Object.entries(placeOfBirthGroups).forEach(([k, v]) => {
      rows.push([k, v])
    })

    // generate CSV with UTF-8 BOM
    const rawCsv = Papa.unparse(rows, { header: false })
    const csvWithBom = '\uFEFF' + rawCsv
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `live_births_by_gender_${timestamp}.csv`
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    toast.success(`Exported CSV as ${filename}`)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live births by gender — Legazpi City</h2>
        <Button onClick={exportAllToCSV}>Export CSV</Button>
      </div>
      <div className="text-lg">
        Total registered births:{' '}
        <span className="font-semibold">{totalBirthCount}</span>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <FilterPicker label="Start" month={startMonth} year={startYear}
          onMonthChange={setStartMonth} onYearChange={setStartYear} years={years}/>
        <FilterPicker label="End"   month={endMonth}   year={endYear}
          onMonthChange={setEndMonth}   onYearChange={setEndYear}   years={years}/>
      </div>

      {loading && <p>Loading…</p>}
      {error   && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="space-y-6 max-h-[70vh] overflow-auto">
          {/* Gender */}
          <OverflowTable
            headers={['Month','Male','Female']}
            rows={liveBirthGenderData.map(r=>[r.month, r.male, r.female])}
          />

          {/* Age */}
          <CombinedAgeTable 
            title="Age distribution (Father vs Mother)"
            fatherAgeGroups={fatherAgeGroups}
            motherAgeGroups={motherAgeGroups}
          />

          {/* Barangay */}
          <KeyValueTable
            title="Mother’s Barangay Distribution"
            data={motherBarangayGroups}
            keyLabel="Barangay"
          />

          {/* Legitimacy */}
          <KeyValueTable
            title="Marriage Legitimacy"
            data={marriageLegitimacyGroups}
            keyLabel="Status"
          />

          {/* Attendant */}
          <KeyValueTable
            title="Attendant at Birth"
            data={attendantTypeGroups}
            keyLabel="Type"
          />

          {/* Registration Status */}
          <KeyValueTable
            title="Birth Registration Status"
            data={birthRegistrationStatusGroups}
            keyLabel="Status"
          />

          {/* Weight at Birth */}
          <KeyValueTable
            title="Weight at Birth"
            data={weightGroups}
            keyLabel="Range"
          />

          {/* Place of Birth */}
          <KeyValueTable
            title="Place of Birth Distribution"
            data={placeOfBirthGroups}
            keyLabel="Category"
          />
        </div>
      )}
    </div>
  )
}

function FilterPicker({ label, month, year, onMonthChange, onYearChange, years }: {
  label:string, month:number, year:number,
  onMonthChange:(m:number)=>void, onYearChange:(y:number)=>void,
  years:number[]
}) {
  return (
    <div>
      <label className="block text-sm">{label}</label>
      <div className="flex gap-2">
        <select className="border px-2 py-1 rounded"
          value={month}
          onChange={e=>onMonthChange(+e.target.value)}
        >
          {Array.from({length:12},(_,i)=>i+1).map(m=>(
            <option key={m} value={m}>
              {new Date(0,m-1).toLocaleString('default',{month:'long'})}
            </option>
          ))}
        </select>
        <select className="border px-2 py-1 rounded"
          value={year}
          onChange={e=>onYearChange(+e.target.value)}
        >
          {years.map(y=>(
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function OverflowTable({ headers, rows }: {
  headers: string[]
  rows: Array<(string|number)[]>
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            {headers.map(h=>(
              <th key={h} className="border px-3 py-1 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              {r.map((c,j)=>(
                <td key={j} className={`border px-3 py-1 ${j>0?'text-right':''}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CombinedAgeTable({ title, fatherAgeGroups, motherAgeGroups }: {
  title:string
  fatherAgeGroups: AgeGroups
  motherAgeGroups: AgeGroups
}) {
  const ageGroupKeys = Object.keys(fatherAgeGroups) as Array<keyof AgeGroups>

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      <OverflowTable
        headers={['Age Group','Fathers','Mothers']}
        rows={ageGroupKeys.map(group=>[
          group,
          fatherAgeGroups[group],
          motherAgeGroups[group],
        ])}
      />
    </div>
  )
}

function KeyValueTable({ title, data, keyLabel }: {
  title:string
  data: Record<string,number>
  keyLabel: string
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      <OverflowTable
        headers={[keyLabel,'Count']}
        rows={Object.entries(data)}
      />
    </div>
  )
}
