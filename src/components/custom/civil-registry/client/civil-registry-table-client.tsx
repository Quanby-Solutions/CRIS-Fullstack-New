// src/components/custom/civil-registry/civil-registry-data-table-client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DataTable } from '@/components/custom/civil-registry/data-table'
import { createColumns } from '@/components/custom/civil-registry/columns'
import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action'
import { useTranslation } from 'react-i18next'

interface CivilRegistryDataTableClientProps {
    forms: BaseRegistryFormWithRelations[]
}

export function CivilRegistryDataTableClient({ forms: initialForms }: CivilRegistryDataTableClientProps) {
    const { data: session, status } = useSession()
    const { t } = useTranslation()
    const [forms, setForms] = useState<BaseRegistryFormWithRelations[]>([])

    useEffect(() => {
        setForms(initialForms)
    }, [initialForms])

    if (status === 'loading') {
        return <div>Loading session...</div>
    }

    const handleFormUpdate = (updatedForm: BaseRegistryFormWithRelations) => {
        setForms(prev =>
            prev.map(form => (form.id === updatedForm.id ? updatedForm : form))
        )
    }

    const handleFormDelete = (deletedFormId: string) => {
        setForms(prev => prev.filter(form => form.id !== deletedFormId))
    }

    const columns = createColumns(session, handleFormUpdate, handleFormDelete, t)

    return <DataTable data={forms} columns={columns} selection={false} />
}