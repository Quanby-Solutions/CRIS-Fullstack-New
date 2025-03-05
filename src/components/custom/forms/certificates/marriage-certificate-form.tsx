'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMarriageCertificateForm } from '@/hooks/form-certificates-hooks/useMarriageCertificateForm';
import type { MarriageCertificateFormValues } from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
import { FormType } from '@prisma/client';
import ContractingPartiesCertificationCard from './form-cards/marriage-cards/contracting-parties-certification-card';
import HusbandInfoCard from './form-cards/marriage-cards/husband-info-card';
import HusbandParentsInfoCard from './form-cards/marriage-cards/husband-parent-info-card';
import MarriageDetailsCard from './form-cards/marriage-cards/marriage-details-card';
import SolemnizingOfficerCertification from './form-cards/marriage-cards/solemnizing-officer-certification-card';
import WifeInfoCard from './form-cards/marriage-cards/wife-info-card';
import WifeParentsInfoCard from './form-cards/marriage-cards/wife-parent-info-card';
import { WitnessesCard } from './form-cards/marriage-cards/witnesses-section-card';
import {
  PreparedByCard,
  ReceivedByCard,
  RegisteredAtOfficeCard,
} from './form-cards/shared-components/processing-details-cards';
import RegistryInformationCard from './form-cards/shared-components/registry-information-card';
import RemarksCard from './form-cards/shared-components/remarks-card';
import { AffidavitOfSolemnizingOfficer } from './form-cards/marriage-cards/affidavit-of-marriage';
import { AffidavitForDelayedMarriageRegistration } from './form-cards/marriage-cards/affidavit-of-delayed-marriage-registration';
import PaginationInputs from './form-cards/shared-components/pagination-inputs';


export interface MarriageCertificateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  defaultValues?: Partial<MarriageCertificateFormValues>
}

export default function MarriageCertificateForm({
  open,
  onOpenChange,
  onCancel,
  defaultValues,
}: MarriageCertificateFormProps) {
  const { formMethods, onSubmit, handleError } = useMarriageCertificateForm({
    onOpenChange,
    defaultValues,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[70vw] w-[70vw] h-[95vh] max-h-[95vh] p-0' >
        <Form {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit, handleError)}
            className='space-y-6'
          >
            <div className='h-full flex flex-col'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-bold text-center py-4'>
                  Certificate of Marriage
                </DialogTitle>
              </DialogHeader>

              <div className='flex flex-1 overflow-hidden'>
                {/* Left Side - Form */}
                <div className='w-full '>
                  <ScrollArea className='h-[calc(95vh-120px)]'>
                    <div className='p-6 space-y-4'>
                      <RegistryInformationCard
                        formType={FormType.MARRIAGE}
                        title='Marriage Registry Information'
                      />
                      <HusbandInfoCard />
                      <HusbandParentsInfoCard />
                      <WifeInfoCard />
                      <WifeParentsInfoCard />
                      <MarriageDetailsCard />
                      <ContractingPartiesCertificationCard />
                      <SolemnizingOfficerCertification />
                      <WitnessesCard />
                      <PreparedByCard />
                      <ReceivedByCard />
                      <RegisteredAtOfficeCard
                        fieldPrefix='registeredByOffice'
                        cardTitle='Registered at the Office of Civil Registrar'
                      />
                      <RemarksCard
                        fieldName='remarks'
                        cardTitle='Marriage Certificate Remarks'
                        label='Additional Remarks'
                        placeholder='Enter any additional remarks or annotations'
                      />
                      <AffidavitOfSolemnizingOfficer />
                      <AffidavitForDelayedMarriageRegistration />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
            <DialogFooter className='absolute bottom-2 right-2 gap-2 flex items-center'>
              <Button
                type='button'
                variant='outline'
                className='py-2 w-32 bg-muted-foreground/80 hover:bg-muted-foreground hover:text-accent text-accent'
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='py-2 w-32 bg-primary/80 hover:bg-primary'
              >
                Save
              </Button>
              {/* <Button type="button" onClick={() => console.log('Form State:', formMethods.getValues())}>
                Log Form Data
              </Button> */}

            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
