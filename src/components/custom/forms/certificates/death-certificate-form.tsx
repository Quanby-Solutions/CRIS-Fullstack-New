'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { DeathCertificateFormValues } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { FormProvider } from 'react-hook-form';

import AttendantInformationCard from './form-cards/death-cards/attendant-information-card';
import CausesOfDeath19aCard from './form-cards/death-cards/causes-of-death19a';
import CausesOfDeath19bCard from './form-cards/death-cards/causes-of-death19b';
import CertificationOfDeathCard from './form-cards/death-cards/certification-of-death-card';
import CertificationInformantCard from './form-cards/death-cards/certification-of-informant-card';
import AffidavitDelayedRegistrationCard from './form-cards/death-cards/death-affidavit-elayed-registration-card';
import DeathByExternalCausesCard from './form-cards/death-cards/death-by-external-causes';
import DeceasedInformationCard from './form-cards/death-cards/deceased-information-card';
import DisposalInformationCard from './form-cards/death-cards/disposal-information-card';
import EmbalmerCertificationCard from './form-cards/death-cards/embalmer-certification-card';
import MaternalConditionCard from './form-cards/death-cards/maternal-condition-card';
import PostmortemCertificateCard from './form-cards/death-cards/postmortem-certificate-card';
import PaginationInputs from './form-cards/shared-components/pagination-inputs';
import {
  PreparedByCard,
  ReceivedByCard,
  RegisteredAtOfficeCard,
} from './form-cards/shared-components/processing-details-cards';
import RegistryInformationCard from './form-cards/shared-components/registry-information-card';
import RemarksCard from './form-cards/shared-components/remarks-card';
import { useDeathCertificateForm } from '@/hooks/form-certificates-hooks/useDeathCertificateForm';
import MedicalCertificateCard from './form-cards/death-cards/medical-certificate-card';

export interface DeathCertificateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  defaultValues?: Partial<DeathCertificateFormValues>;
}

export default function DeathCertificateForm({
  open,
  onOpenChange,
  onCancel,
  defaultValues,
}: DeathCertificateFormProps) {
  const { formMethods, onSubmit, handleError } = useDeathCertificateForm({
    onOpenChange,
    defaultValues,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[70dvw] w-[70dvw] h-[95dvh] max-h-[95dvh] p-0'>
        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit, handleError)}
            className='space-y-6'
          >
            <div className='h-full flex flex-col'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-bold text-center py-4'>
                  Certificate of Death
                </DialogTitle>
              </DialogHeader>
              <div className='flex flex-1 overflow-hidden'>
                {/* Left Side - Form */}
                <div className='w-full'>
                  <ScrollArea className='h-[calc(95vh-120px)]'>
                    <div className='p-6 space-y-4'>
                      <PaginationInputs />
                      <RegistryInformationCard formType='DEATH' />
                      <DeceasedInformationCard />
                      <CausesOfDeath19aCard />
                      <CausesOfDeath19bCard />
                      <MaternalConditionCard />
                      <DeathByExternalCausesCard />
                      <AttendantInformationCard />
                      <EmbalmerCertificationCard />
                      <PostmortemCertificateCard />
                      <AffidavitDelayedRegistrationCard />
                      <CertificationOfDeathCard />
                      <DisposalInformationCard />
                      <CertificationInformantCard />
                      {/* <MedicalCertificateCard /> */}
                      <PreparedByCard />
                      <ReceivedByCard />
                      <RegisteredAtOfficeCard
                        fieldPrefix='registeredByOffice'
                        cardTitle='Registered at the Office of Civil Registrar'
                      />
                      <RemarksCard
                        fieldName='remarks'
                        cardTitle='Death Certificate Remarks'
                        label='Additional Remarks'
                        placeholder='Enter any additional remarks or annotations'
                      />
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
                Submit
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
