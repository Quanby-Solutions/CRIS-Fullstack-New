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

export function EditCivilRegistryFormDialog({
    form,
    open,
    onOpenChangeAction,
    onSaveAction,
    editType,
}: EditCivilRegistryFormDialogProps) {
    const { t } = useTranslation()

    // Convert the BaseRegistryFormWithRelations to BirthCertificateFormValues
    const mapToBirthCertificateValues = (form: BaseRegistryFormWithRelations): Partial<BirthCertificateFormValues> => {
        // Parse dates safely
        const parseDateSafely = (dateString: Date | null): Date => {
            if (!dateString) return new Date()
            return dateString
        }

        console.log("form.cityMunicipality-> ", form.cityMunicipality)

        return {
            registryNumber: form.registryNumber || '',
            province: form.province || '',
            cityMunicipality: form.cityMunicipality || '',
            pagination: {
                pageNumber: form.pageNumber || '',
                bookNumber: form.bookNumber || '',
            },
            remarks: form.remarks || '',

            // Child information - default values
            childInfo: {
                firstName: '',
                middleName: '',
                lastName: '',
                sex: 'Male',
                dateOfBirth: new Date(),
                placeOfBirth: {
                    hospital: '',
                    cityMunicipality: '',
                    province: '',
                },
                typeOfBirth: 'Single',
                birthOrder: '1',
                weightAtBirth: '3.5',
            },

            // Mother information - default values
            motherInfo: {
                firstName: '',
                middleName: '',
                lastName: '',
                citizenship: '',
                religion: '',
                occupation: '',
                age: '30',
                totalChildrenBornAlive: '1',
                childrenStillLiving: '1',
                childrenNowDead: '0',
                residence: {
                    houseNo: '',
                    st: '',
                    barangay: '',
                    cityMunicipality: '',
                    province: '',
                    country: '',
                },
            },

            // Father information - default values
            fatherInfo: {
                firstName: '',
                middleName: '',
                lastName: '',
                citizenship: '',
                religion: '',
                occupation: '',
                age: '32',
                residence: {
                    houseNo: '',
                    st: '',
                    barangay: '',
                    cityMunicipality: '',
                    province: '',
                    country: '',
                },
            },

            // Parent marriage information - default values
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

            // Attendant information - default values
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

            // Informant information - default values
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

            // Affidavit information
            hasAffidavitOfPaternity: false,
            affidavitOfPaternityDetails: null,
            isDelayedRegistration: false,
            affidavitOfDelayedRegistration: null,
        }
    }

    const initialData = mapToBirthCertificateValues(form)

    const handleEditSubmit = async (
        data: BirthCertificateFormValues
    ): Promise<void> => {
        try {
            const preparedByValue = {
                name: data.preparedBy.nameInPrint
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
        onOpenChange: () => {
            // Handle any side effects on open change if necessary
        },
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
                        <form
                            onSubmit={formMethods.handleSubmit(handleFormSubmit, handleError)}
                            className="space-y-6"
                        >
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
                                                <RegisteredAtOfficeCard
                                                    fieldPrefix="registeredByOffice"
                                                    cardTitle="Registered at the Office of Civil Registrar"
                                                />
                                                <RemarksCard
                                                    fieldName="remarks"
                                                    cardTitle="Birth Certificate Remarks"
                                                    label="Additional Remarks"
                                                    placeholder="Enter any additional remarks or annotations"
                                                />
                                                <AffidavitOfPaternityForm />
                                                <DelayedRegistrationForm />
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="absolute bottom-2 right-2 gap-2 flex items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="py-2 w-32 bg-muted-foreground/80 hover:bg-muted-foreground hover:text-accent text-accent"
                                    onClick={() => {
                                        handleCancel()
                                    }}
                                >
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
