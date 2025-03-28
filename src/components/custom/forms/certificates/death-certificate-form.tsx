"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { DeathCertificateFormValues } from "@/lib/types/zod-form-certificate/death-certificate-form-schema";
import { FormProvider } from "react-hook-form";
import { useRef } from "react";

import AttendantInformationCard from "./form-cards/death-cards/attendant-information-card";
import CausesOfDeath19aCard from "./form-cards/death-cards/19a";
import CausesOfDeath19bCard from "./form-cards/death-cards/19b";
import CertificationOfDeathCard from "./form-cards/death-cards/certification-of-death-card";
import CertificationInformantCard from "./form-cards/death-cards/certification-of-informant-card";
import AffidavitDelayedRegistrationCard from "./form-cards/death-cards/death-affidavit-elayed-registration-card";
import DeathByExternalCausesCard from "./form-cards/death-cards/death-by-external-causes";
import DeceasedInformationCard from "./form-cards/death-cards/1";
import DisposalInformationCard from "./form-cards/death-cards/disposal-information-card";
import EmbalmerCertificationCard from "./form-cards/death-cards/embalmer-certification-card";
import MaternalConditionCard from "./form-cards/death-cards/19c";
import PostmortemCertificateCard from "./form-cards/death-cards/postmortem-certificate-card";
import PaginationInputs from "./form-cards/shared-components/pagination-inputs";
import {
  ReceivedByCard,
  RegisteredAtOfficeCard,
} from "./form-cards/shared-components/processing-details-cards";
import RegistryInformationCard from "./form-cards/shared-components/registry-information-card";
import RemarksCard from "./form-cards/shared-components/remarks-card";
import { useDeathCertificateForm } from "@/hooks/form-certificates-hooks/useDeathCertificateForm";
import { RegistryInformationCardForEdit } from "./form-cards/death-cards/registry";
import DynamicPreparedByCard from "./form-cards/shared-components/prepared-by";

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
  // Reference to the scroll area for programmatic scrolling
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { formMethods, onSubmit, handleError, isSubmitting } =
    useDeathCertificateForm({
      onOpenChange,
      defaultValues,
      scrollAreaRef, // Pass the ref to the hook
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[70dvw] w-[70dvw] h-[95dvh] max-h-[95dvh] p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit, handleError)}
            className="space-y-6"
            noValidate
          >
            <div className="h-full flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center py-4">
                  Certificate of Death
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-1 overflow-hidden">
                {/* Left Side - Form */}
                <div className="w-full">
                  <ScrollArea
                    className="h-[calc(95vh-120px)]"
                    ref={scrollAreaRef}
                  >
                    <div className="p-6 space-y-4">
                      <div id="pagination-inputs">
                        <PaginationInputs />
                      </div>

                      <div id="registry-information-card">
                        {defaultValues?.id ? (
                          <RegistryInformationCardForEdit />
                        ) : (
                          <RegistryInformationCard formType="DEATH" />
                        )}
                      </div>

                      <div id="deceased-information-card">
                        <DeceasedInformationCard />
                      </div>

                      <div id="causes-of-death-19a-card">
                        <CausesOfDeath19aCard />
                      </div>

                      <div id="causes-of-death-19b-card">
                        <CausesOfDeath19bCard />
                      </div>

                      <div id="maternal-condition-card">
                        <MaternalConditionCard />
                      </div>

                      <div id="death-by-external-causes-card">
                        <DeathByExternalCausesCard />
                      </div>

                      <div id="attendant-information-card">
                        <AttendantInformationCard />
                      </div>

                      <div id="certification-of-death-card">
                        <CertificationOfDeathCard />
                      </div>

                      <div id="disposal-information-card">
                        <DisposalInformationCard />
                      </div>

                      <div id="certification-informant-card">
                        <CertificationInformantCard />
                      </div>

                      <div id="prepared-by-card">
                        <DynamicPreparedByCard />
                      </div>

                      <div id="received-by-card">
                        <ReceivedByCard cardTitle="28. Received by" />
                      </div>

                      <div id="registered-at-office-card">
                        <RegisteredAtOfficeCard
                          fieldPrefix="registeredByOffice"
                          cardTitle="Registered at the Office of Civil Registrar"
                        />
                      </div>

                      <div id="remarks-card">
                        <RemarksCard
                          fieldName="remarks"
                          cardTitle="Death Certificate Remarks"
                          label="Additional Remarks"
                          placeholder="Enter any additional remarks or annotations"
                        />
                      </div>
                      <div id="postmortem-certificate-card">
                        <PostmortemCertificateCard />
                      </div>

                      <div id="embalmer-certification-card">
                        <EmbalmerCertificationCard />
                      </div>

                      <div id="affidavit-delayed-registration-card">
                        <AffidavitDelayedRegistrationCard />
                      </div>
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
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="py-2 w-32 bg-primary/80 hover:bg-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
