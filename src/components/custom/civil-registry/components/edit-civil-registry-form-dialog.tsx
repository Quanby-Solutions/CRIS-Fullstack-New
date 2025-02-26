'use client'

import { useTranslation } from 'react-i18next'
import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema'
import { toast } from 'sonner'
import { useBirthCertificateForm } from '@/hooks/form-certificates-hooks/useBirthCertificateForm'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FormProvider } from 'react-hook-form'
import { FormType } from '@prisma/client'
import { PaginationInputs } from '../../forms/certificates/form-cards/shared-components/pagination-inputs'
import { PreparedByCard, ReceivedByCard, RegisteredAtOfficeCard } from '../../forms/certificates/form-cards/shared-components/processing-details-cards'
import RemarksCard from '../../forms/certificates/form-cards/shared-components/remarks-card'
import ChildInformationCard from '../../forms/certificates/form-cards/birth-cards/child-information-card'
import FatherInformationCard from '../../forms/certificates/form-cards/birth-cards/father-information-card'
import MarriageInformationCard from '../../forms/certificates/form-cards/birth-cards/marriage-parents-card'
import MotherInformationCard from '../../forms/certificates/form-cards/birth-cards/mother-information-card'
import AttendantInformationCard from '../../forms/certificates/form-cards/birth-cards/attendant-information'
import AffidavitOfPaternityForm from '../../forms/certificates/form-cards/birth-cards/affidavit-of-paternity'
import CertificationOfInformantCard from '../../forms/certificates/form-cards/birth-cards/certification-of-informant'
import DelayedRegistrationForm from '../../forms/certificates/form-cards/birth-cards/affidavit-for-delayed-registration'
import RegistryInformationCard from '../../forms/certificates/form-cards/shared-components/registry-information-card'

interface EditCivilRegistryFormDialogProps {
    form: BaseRegistryFormWithRelations
    open: boolean
    onOpenChangeAction: (open: boolean) => void
    onSaveAction: (updatedForm: BaseRegistryFormWithRelations) => Promise<void>
    editType: 'BIRTH' | 'DEATH' | 'MARRIAGE'
}

interface ChildName {
    first: string
    middle: string
    last: string
}

interface motherName {
    first: string
    middle: string
    last: string
}

interface FatherName {
    first: string
    middle: string
    last: string
}

interface PlaceOfBirth {
    province: string
    cityMunicipality: string
    hospital: string
}

interface MotherResidence {
    houseNo: string
    street: string
    barangay: string
    cityMunicipality: string
    province: string
    country: string
}

interface FatherResidence {
    houseNo: string
    street: string
    barangay: string
    cityMunicipality: string
    province: string
    country: string
}

export function EditCivilRegistryFormDialog({
    form,
    open,
    onOpenChangeAction,
    onSaveAction,
    editType,
}: EditCivilRegistryFormDialogProps) {
    const { t } = useTranslation()

    // Helper function to safely parse dates
    const parseDateSafely = (dateValue: Date | null): Date => {
        if (!dateValue) return new Date()
        return dateValue
    }

    // Convert BaseRegistryFormWithRelations to BirthCertificateFormValues with proper type guarding
    const mapToBirthCertificateValues = (form: BaseRegistryFormWithRelations): Partial<BirthCertificateFormValues> => {
        console.log("form.cityMunicipality-> ", form.cityMunicipality)

        // Extract and guard childName
        const rawChildName = form.birthCertificateForm?.childName
        let childName: ChildName = { first: '', middle: '', last: '' }
        if (
            rawChildName &&
            typeof rawChildName === 'object' &&
            !Array.isArray(rawChildName) &&
            'first' in rawChildName &&
            'middle' in rawChildName &&
            'last' in rawChildName
        ) {
            childName = rawChildName as unknown as ChildName
        }

        // Extract and guard motherName
        const rawMotherName = form.birthCertificateForm?.motherMaidenName
        let motherName: motherName = { first: '', middle: '', last: '' }
        if (
            rawMotherName &&
            typeof rawMotherName === 'object' &&
            !Array.isArray(rawMotherName) &&
            'first' in rawMotherName &&
            'middle' in rawMotherName &&
            'last' in rawMotherName
        ) {
            motherName = rawMotherName as unknown as motherName
        }

        // Extract and guard fatherName
        const rawFatherName = form.birthCertificateForm?.fatherName
        let fatherName: FatherName = { first: '', middle: '', last: '' }
        if (
            rawFatherName &&
            typeof rawFatherName === 'object' &&
            !Array.isArray(rawFatherName) &&
            'first' in rawFatherName &&
            'middle' in rawFatherName &&
            'last' in rawFatherName
        ) {
            fatherName = rawFatherName as unknown as FatherName
        }

        // Extract and guard placeOfBirth
        const rawPlaceOfBirth = form.birthCertificateForm?.placeOfBirth
        let placeOfBirth: PlaceOfBirth = { province: '', cityMunicipality: '', hospital: '' }
        if (
            rawPlaceOfBirth &&
            typeof rawPlaceOfBirth === 'object' &&
            !Array.isArray(rawPlaceOfBirth) &&
            'province' in rawPlaceOfBirth &&
            'cityMunicipality' in rawPlaceOfBirth &&
            'hospital' in rawPlaceOfBirth
        ) {
            placeOfBirth = rawPlaceOfBirth as unknown as PlaceOfBirth
        }

        // For the sex field, if the value is not "Male" or "Female", default to "Male"
        const rawSex = form.birthCertificateForm?.sex
        const sex: "Male" | "Female" =
            rawSex === "Male" || rawSex === "Female" ? rawSex : "Male"

        // For dateOfBirth, convert to a Date if provided; otherwise, default to new Date()
        const rawDateOfBirth = form.birthCertificateForm?.dateOfBirth
        const dateOfBirth: Date =
            rawDateOfBirth ? new Date(rawDateOfBirth) : new Date()

        const rawTypeOfBirth = form.birthCertificateForm?.typeOfBirth
        const typeOfBirth: "Single" | "Twin" | "Triplet" | "Others" =
            rawTypeOfBirth === "Single" ||
            rawTypeOfBirth === "Twin" ||
            rawTypeOfBirth === "Triplet" ||
            rawTypeOfBirth === "Others"
                ? rawTypeOfBirth
                : "Single"

        // Convert weightAtBirth to string if it's a number.
        const rawWeightAtBirth = form.birthCertificateForm?.weightAtBirth
        const weightAtBirth: string =
            typeof rawWeightAtBirth === "number"
                ? rawWeightAtBirth.toString()
                : rawWeightAtBirth || ''

        // Handle motherResidence correctly using rawMotherResidence
        const rawMotherResidence = form.birthCertificateForm?.motherResidence
        let motherResidence: MotherResidence = { houseNo: '', street: '', barangay: '', cityMunicipality: '', province: '', country: '' }
        if (
            rawMotherResidence &&
            typeof rawMotherResidence === 'object' &&
            !Array.isArray(rawMotherResidence) &&
            'houseNo' in rawMotherResidence &&
            'street' in rawMotherResidence &&
            'barangay' in rawMotherResidence &&
            'cityMunicipality' in rawMotherResidence &&
            'province' in rawMotherResidence &&
            'country' in rawMotherResidence
        ) {
            motherResidence = rawMotherResidence as unknown as MotherResidence
        }

        // Handle fatherResidence similarly
        const rawFatherResidence = form.birthCertificateForm?.fatherResidence
        let fatherResidence: FatherResidence = { houseNo: '', street: '', barangay: '', cityMunicipality: '', province: '', country: '' }
        if (
            rawFatherResidence &&
            typeof rawFatherResidence === 'object' &&
            !Array.isArray(rawFatherResidence) &&
            'houseNo' in rawFatherResidence &&
            'street' in rawFatherResidence &&
            'barangay' in rawFatherResidence &&
            'cityMunicipality' in rawFatherResidence &&
            'province' in rawFatherResidence &&
            'country' in rawFatherResidence
        ) {
            fatherResidence = rawFatherResidence as unknown as FatherResidence
        }

        // Validate multipleBirthOrder against allowed literals.
        const validBirthOrders = ["First", "Second", "Third"] as const
        const rawMultipleBirthOrder = form.birthCertificateForm?.multipleBirthOrder
        const multipleBirthOrder: "First" | "Second" | "Third" | undefined =
            validBirthOrders.includes(rawMultipleBirthOrder as any)
                ? rawMultipleBirthOrder as "First" | "Second" | "Third"
                : undefined

        return {
            registryNumber: form.registryNumber || '',
            province: form.province || '',
            cityMunicipality: form.cityMunicipality || '',
            pagination: {
                pageNumber: form.pageNumber || '',
                bookNumber: form.bookNumber || '',
            },
            remarks: form.remarks || '',

            // Child information
            childInfo: {
                firstName: childName.first,
                middleName: childName.middle,
                lastName: childName.last,
                sex,
                dateOfBirth,
                placeOfBirth,
                typeOfBirth,
                multipleBirthOrder,
                birthOrder: form.birthCertificateForm?.birthOrder || '',
                weightAtBirth,
            },

            // Mother information
            motherInfo: {
                firstName: motherName.first,
                middleName: motherName.middle,
                lastName: motherName.last,
                citizenship: form.birthCertificateForm?.motherCitizenship || '',
                religion: form.birthCertificateForm?.motherReligion || '',
                occupation: form.birthCertificateForm?.motherOccupation || '',
                age: String(form.birthCertificateForm?.motherAge || ''),
                totalChildrenBornAlive: String(form.birthCertificateForm?.totalChildrenBornAlive || ''),
                childrenStillLiving: String(form.birthCertificateForm?.childrenStillLiving || ''),
                childrenNowDead: String(form.birthCertificateForm?.childrenNowDead || ''),
                residence: {
                    houseNo: motherResidence.houseNo || '',
                    st: motherResidence.street || '',
                    barangay: motherResidence.barangay || '',
                    cityMunicipality: motherResidence.cityMunicipality || '',
                    province: motherResidence.province || '',
                    country: motherResidence.country || '',
                },
            },

            // Father information
            fatherInfo: {
                firstName: fatherName.first,
                middleName: fatherName.middle,
                lastName: fatherName.last,
                citizenship: form.birthCertificateForm?.fatherCitizenship || '',
                religion: form.birthCertificateForm?.fatherReligion || '',
                occupation: form.birthCertificateForm?.fatherOccupation || '',
                age: String(form.birthCertificateForm?.fatherAge || ''),
                residence: {
                    houseNo: fatherResidence.houseNo || '',
                    st: fatherResidence.street || '',
                    barangay: fatherResidence.barangay || '',
                    cityMunicipality: fatherResidence.cityMunicipality || '',
                    province: fatherResidence.province || '',
                    country: fatherResidence.country || '',
                },
            },

            // Parent marriage information
            parentMarriage: {
                date: new Date(),
                place: {
                    houseNo: '',
                    st: '',
                    barangay: '',
                    cityMunicipality: '',
                    province: '',
                    country: '',
                },
            },

            // Attendant information
            attendant: {
                type: 'Physician',
                certification: {
                    time: new Date(),
                    signature: '',
                    name: '',
                    title: '',
                    address: {
                        houseNo: '',
                        st: '',
                        barangay: '',
                        cityMunicipality: '',
                        province: '',
                        country: '',
                    },
                    date: new Date(),
                },
            },

            // Informant information
            informant: {
                signature: '',
                name: '',
                relationship: '',
                address: {
                    houseNo: '',
                    st: '',
                    barangay: '',
                    cityMunicipality: '',
                    province: '',
                    country: '',
                },
                date: new Date(),
            },

            // Processing details
            preparedBy: {
                signature: '',
                nameInPrint: typeof form.preparedBy === 'string'
                    ? form.preparedBy
                    : form.preparedBy?.name || '',
                titleOrPosition: '',
                date: parseDateSafely(form.preparedByDate),
            },
            receivedBy: {
                signature: '',
                nameInPrint: typeof form.receivedBy === 'string'
                    ? form.receivedBy
                    : '',
                titleOrPosition: '',
                date: parseDateSafely(form.receivedByDate),
            },
            registeredByOffice: {
                signature: '',
                nameInPrint: typeof form.registeredBy === 'string'
                    ? form.registeredBy
                    : '',
                titleOrPosition: '',
                date: parseDateSafely(form.registeredByDate),
            },
            hasAffidavitOfPaternity: false,
            affidavitOfPaternityDetails: null,
            isDelayedRegistration: false,
            affidavitOfDelayedRegistration: null,
        }
    }

    const initialData = mapToBirthCertificateValues(form)

    const handleEditSubmit = async (data: BirthCertificateFormValues): Promise<void> => {
        try {
            const preparedByValue = {
                name: data.preparedBy.nameInPrint,
            }

            const updatedForm: BaseRegistryFormWithRelations = {
                ...form,
                registryNumber: data.registryNumber,
                province: data.province,
                cityMunicipality: data.cityMunicipality,
                pageNumber: data.pagination?.pageNumber || form.pageNumber,
                bookNumber: data.pagination?.bookNumber || form.bookNumber,
                remarks: data.remarks || null,
                preparedBy: preparedByValue,
                preparedByDate: data.preparedBy.date,
                receivedBy: data.receivedBy.nameInPrint || null,
                receivedByDate: data.receivedBy.date,
                registeredBy: data.registeredByOffice.nameInPrint || null,
                registeredByDate: data.registeredByOffice.date,
                updatedAt: new Date(),
            }

            await onSaveAction(updatedForm)
            toast.success(`${t('formUpdated')} ${updatedForm.id}!`)
            onOpenChangeAction(false)
        } catch (error) {
            console.error('Error updating form:', error)
            toast.error(t('errorUpdatingForm'))
        }
    }

    const { formMethods, handleError } = useBirthCertificateForm({
        onOpenChange: () => { },
        defaultValues: initialData,
    })

    const handleFormSubmit = async (data: BirthCertificateFormValues): Promise<void> => {
        const result = await formMethods.trigger()
        if (result) {
            try {
                await handleEditSubmit(data)
                formMethods.reset()
            } catch (error: unknown) {
                console.error('Error submitting form:', error)
                toast.error('Error submitting form')
                handleError(error)
            }
        } else {
            toast.warning('Please complete all required fields')
        }
    }

    const handleCancel = () => {
        onOpenChangeAction(false)
    }

    const renderForm = () => {
        switch (editType) {
            case 'BIRTH':
                return (
                    <FormProvider {...formMethods}>
                        <form onSubmit={formMethods.handleSubmit(handleFormSubmit, handleError)} className="space-y-6">
                            <div className="h-full flex flex-col">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-center py-4">
                                        {t('Edit Certificate of Live Birth')}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-1 overflow-hidden">
                                    <div className="w-full">
                                        <ScrollArea className="h-[calc(95vh-120px)]">
                                            <div className="p-6 space-y-4">
                                                <PaginationInputs />
                                                <RegistryInformationCard formType={FormType.BIRTH} />
                                                <ChildInformationCard />
                                                <MotherInformationCard />
                                                <FatherInformationCard />
                                                <MarriageInformationCard />
                                                <AttendantInformationCard />
                                                <CertificationOfInformantCard />
                                                <PreparedByCard />
                                                <ReceivedByCard />
                                                <RegisteredAtOfficeCard fieldPrefix="registeredByOffice" cardTitle="Registered at the Office of Civil Registrar" />
                                                <RemarksCard fieldName="remarks" cardTitle="Birth Certificate Remarks" label="Additional Remarks" placeholder="Enter any additional remarks or annotations" />
                                                <AffidavitOfPaternityForm />
                                                <DelayedRegistrationForm />
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="absolute bottom-2 right-2 gap-2 flex items-center">
                                <Button type="button" variant="outline" className="py-2 w-32 bg-muted-foreground/80 hover:bg-muted-foreground hover:text-accent text-accent" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="default" className="py-2 w-32">
                                    Update
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                )
            case 'DEATH':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>{t('editForm.title')}</DialogTitle>
                        </DialogHeader>
                        {t('Death certificate edit form coming soon.')}
                    </>
                )
            case 'MARRIAGE':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>{t('editForm.title')}</DialogTitle>
                        </DialogHeader>
                        {t('Marriage certificate edit form coming soon.')}
                    </>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="max-w-[70dvw] w-[70dvw] h-[95dvh] max-h-[95dvh] p-4">
                {renderForm()}
            </DialogContent>
        </Dialog>
    )
}
