'use client'

import { toast } from 'sonner'
import { FormType } from '@prisma/client'
import { FormProvider } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PaginationInputs } from './form-cards/shared-components/pagination-inputs'
import { useBirthCertificateForm } from '@/hooks/form-certificates-hooks/useBirthCertificateForm'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  BirthCertificateFormProps,
  BirthCertificateFormValues,
} from '@/lib/types/zod-form-certificate/birth-certificate-form-schema'
import { PreparedByCard, ReceivedByCard, RegisteredAtOfficeCard } from './form-cards/shared-components/processing-details-cards'

import RemarksCard from './form-cards/shared-components/remarks-card'
import ChildInformationCard from './form-cards/birth-cards/child-information-card'
import FatherInformationCard from './form-cards/birth-cards/father-information-card'
import MarriageInformationCard from './form-cards/birth-cards/marriage-parents-card'
import MotherInformationCard from './form-cards/birth-cards/mother-information-card'
import AttendantInformationCard from './form-cards/birth-cards/attendant-information'
import AffidavitOfPaternityForm from './form-cards/birth-cards/affidavit-of-paternity'
import RegistryInformationCard from './form-cards/shared-components/registry-information-card'
import CertificationOfInformantCard from './form-cards/birth-cards/certification-of-informant'
import DelayedRegistrationForm from './form-cards/birth-cards/affidavit-for-delayed-registration'

interface DynamicBirthCertificateFormPropsExtended extends BirthCertificateFormProps {
  mode?: 'add' | 'edit'
  initialData?: Partial<BirthCertificateFormValues>
  onEditSubmit?: (data: BirthCertificateFormValues) => Promise<void>
}

export default function DynamicBirthCertificateForm({
  open,
  onOpenChangeAction,
  onCancelAction,
  mode = 'add',
  initialData,
  onEditSubmit,
}: DynamicBirthCertificateFormPropsExtended) {
  // Create wrapper functions to handle different function signatures
  const handleOpenChange = async (isOpen?: boolean) => {
    if (onOpenChangeAction) {
      // Call the original function if it exists
      try {
        await onOpenChangeAction()
      } catch (error) {
        console.error('Error in onOpenChangeAction:', error)
      }
    }
  }

  const handleCancel = async () => {
    if (onCancelAction) {
      try {
        await onCancelAction()
      } catch (error) {
        console.error('Error in onCancelAction:', error)
      }
    }
  }

  // Use the hook with the initialData for edit mode
  const { formMethods, onSubmit, handleError } = useBirthCertificateForm({
    onOpenChange: (isOpen) => {
      // Only call if there's a change handler provided
      if (typeof isOpen === 'boolean') {
        handleOpenChange()
      }
    },
    defaultValues: initialData,
  })

  // Handle form submission (create or edit)
  const handleFormSubmit = async (data: BirthCertificateFormValues): Promise<void> => {
    const result = await formMethods.trigger()

    if (result) {
      try {
        if (mode === 'edit' && onEditSubmit) {
          // Call the edit submission handler
          await onEditSubmit(data)
          toast.success('Form updated successfully')
        } else {
          // Call the standard submission handler for new forms
          await onSubmit(data)
          toast.success('Form submitted successfully')
        }
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

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState: boolean) => {
        if (typeof onOpenChangeAction === 'function') {
          onOpenChangeAction()
        }
      }}
    >
      <DialogContent className="max-w-[70dvw] w-[70dvw] h-[95dvh] max-h-[95dvh] p-0">
        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(handleFormSubmit, handleError)}
            className="space-y-6"
          >
            <div className="h-full flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center py-4">
                  {mode === 'edit'
                    ? 'Edit Certificate of Live Birth'
                    : 'Certificate of Live Birth'}
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
                  // Handle cancel action
                  handleCancel()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" className="py-2 w-32">
                {mode === 'edit' ? 'Update' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}