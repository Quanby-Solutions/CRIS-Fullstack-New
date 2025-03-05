import {
  Attachment,
  CertifiedCopy,
  FormType,
  Permission,
} from '@prisma/client';
import { Row } from '@tanstack/react-table';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useDeleteFormAction } from '@/components/custom/civil-registry/actions/delete-form-action';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';
import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action';
import { hasPermission } from '@/types/auth';

import { DeleteConfirmationDialog } from '@/components/custom/civil-registry/components/delete-confirmation-dialog';
import { FileUploadDialog } from '@/components/custom/civil-registry/components/file-upload';

import BirthAnnotationForm from '@/components/custom/forms/annotations/birth-cert-annotation';
import DeathAnnotationForm from '@/components/custom/forms/annotations/death-annotation';
import MarriageAnnotationForm from '@/components/custom/forms/annotations/marriage-annotation-form';
import BirthCertificateFormCTC from '@/components/custom/forms/requests/birth-request-form';
import DeathCertificateFormCTC from '@/components/custom/forms/requests/death-request-form';
import MarriageCertificateFormCTC from '@/components/custom/forms/requests/marriage-request-form';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/ui/icons';
import { mapToDeathCertificateValues } from '@/lib/utils/map-to-death-certificate-values';
import { mapToMarriageCertificateValues } from '@/lib/utils/map-to-marriage-certificate';
import DeathCertificateForm from '../forms/certificates/death-certificate-form';
import MarriageCertificateForm from '../forms/certificates/marriage-certificate-form';
import { EditCivilRegistryFormDialog } from './components/edit-civil-registry-form-dialog';

interface DataTableRowActionsProps {
  row: Row<BaseRegistryFormWithRelations>;
  onUpdateForm?: (updatedForm: BaseRegistryFormWithRelations) => void;
  onDeleteForm?: (id: string) => void;
}

type AttachmentWithCertifiedCopies = Attachment & {
  certifiedCopies: CertifiedCopy[];
};

export function DataTableRowActions({
  row,
  onUpdateForm,
  onDeleteForm,
}: DataTableRowActionsProps) {
  const { t } = useTranslation();
  const { permissions } = useUser();
  const form = row.original;

  const [isLoading, setIsLoading] = useState(false);
  const [ctcFormOpen, setCtcFormOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deletionAlertOpen, setDeletionAlertOpen] = useState(false);
  const [annotationFormOpen, setAnnotationFormOpen] = useState(false);
  const [currentAttachment, setCurrentAttachment] =
    useState<AttachmentWithCertifiedCopies | null>(null);

  const { handleDelete, isLoading: isDeleteLoading } = useDeleteFormAction({
    form,
  });

  const canView = hasPermission(permissions, Permission.DOCUMENT_READ);
  const canEdit = hasPermission(permissions, Permission.DOCUMENT_UPDATE);
  const canDelete = hasPermission(permissions, Permission.DOCUMENT_DELETE);
  const canUpload = hasPermission(permissions, Permission.DOCUMENT_CREATE);
  const canExport =
    hasPermission(permissions, Permission.DOCUMENT_EXPORT) ||
    process.env.NEXT_PUBLIC_NODE_ENV === 'development';

  // Get the latest attachment with CTC information
  const attachments: AttachmentWithCertifiedCopies[] = form.documents
    .flatMap((doc) => doc.document.attachments)
    .map((att) => ({
      ...att,
      certifiedCopies: att.certifiedCopies ?? [],
    }))
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

  const latestAttachment = attachments[0];
  const hasAttachments = attachments.length > 0;
  const hasCTC =
    hasAttachments && (latestAttachment?.certifiedCopies?.length ?? 0) > 0;

  // Refresh attachments after updates
  const handleAttachmentsRefresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/forms/${form.id}/attachments`);
      if (!response.ok) {
        throw new Error('Failed to refresh attachments');
      }
      const updatedAttachments = await response.json();
      // Update form with new attachments if needed
      if (onUpdateForm) {
        onUpdateForm({
          ...form,
          documents: form.documents.map((doc) => ({
            ...doc,
            document: {
              ...doc.document,
              attachments: updatedAttachments,
            },
          })),
        });
      }
    } catch (error) {
      console.error('Error refreshing attachments:', error);
      toast.error(t('Failed to refresh attachments'));
    }
  }, [form, onUpdateForm, t]);

  // Handle Export
  const handleExport = async () => {
    if (!canExport) {
      toast.error(t('You do not have permission to export documents'));
      return;
    }

    if (!latestAttachment) {
      toast.error(t('No attachment found'));
      return;
    }

    if (!hasCTC) {
      toast.error(
        t(
          'Latest attachment needs a certified true copy (CTC) before you can export'
        )
      );
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/attachments/${latestAttachment.id}/export?zip=true`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      const blob = await response.blob();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${form.registryNumber}-${timestamp}-export.zip`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(t('Export completed successfully'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        error instanceof Error ? error.message : t('Failed to export files')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle CTC
  const handleCtc = useCallback((attachment: AttachmentWithCertifiedCopies) => {
    setCurrentAttachment(attachment);
    setCtcFormOpen(true);
  }, []);

  // Handle Annotation (Issue Certificate)
  const handleAnnotationClick = () => {
    if (!latestAttachment) {
      toast.error(t('No attachment found'));
      return;
    }

    if (!hasCTC) {
      toast.error(t('You need to issue a CTC first'));
      return;
    }

    if (hasCTC) {
      toast.info(
        t(
          'A certified true copy (CTC) already exists. You can add another issue certificate if needed.'
        )
      );
    }

    setCurrentAttachment(latestAttachment);
    setAnnotationFormOpen(true);
  };

  const handleCancel = () => {
    console.log(`${form.formType} form editing is not implemented yet`);
    setEditDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <Icons.moreHorizontal className='h-4 w-4' />
            <span className='sr-only'>{t('openMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[200px]'>
          <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {canView && (
            <DropdownMenuItem asChild>
              <Link href={`/civil-registry/details?formId=${form.id}`}>
                <Icons.eye className='mr-2 h-4 w-4' />
                {t('viewDetails')}
              </Link>
            </DropdownMenuItem>
          )}

          {canUpload && (
            <DropdownMenuItem onClick={() => setUploadDialogOpen(true)}>
              <Icons.printer className='mr-2 h-4 w-4' />
              {t('uploadDocument')}
            </DropdownMenuItem>
          )}

          {canEdit && hasAttachments && (
            <>
              <DropdownMenuItem onClick={() => handleCtc(latestAttachment)}>
                <Icons.files className='mr-2 h-4 w-4' />
                {t('Issue CTC')}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleAnnotationClick}
                disabled={!hasCTC}
                className={!hasCTC ? 'text-muted-foreground' : ''}
              >
                <Icons.files className='mr-2 h-4 w-4' />
                {t('Issue Annotation')}
              </DropdownMenuItem>
            </>
          )}

          {canEdit && (
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Icons.folder className='mr-2 h-4 w-4' />
              {t('editForm.title')}
            </DropdownMenuItem>
          )}

          {canExport && (
            <DropdownMenuItem
              onClick={handleExport}
              disabled={!hasCTC || isLoading}
              className={!hasCTC ? 'text-muted-foreground' : ''}
            >
              <Icons.download className='mr-2 h-4 w-4' />
              {isLoading ? t('Exporting...') : t('Export')}
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={() => setDeletionAlertOpen(true)}
              disabled={isDeleteLoading}
              className='text-destructive focus:text-destructive'
            >
              <Icons.trash className='mr-2 h-4 w-4' />
              {isDeleteLoading ? t('deleting') : t('delete')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      {canEdit && (
        <>
          {form.formType === FormType.DEATH &&
            (() => {
              const deathFormValues = mapToDeathCertificateValues(form);
              return (
                <DeathCertificateForm
                  open={editDialogOpen}
                  onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    // Optionally, add refresh logic when dialog closes.
                  }}
                  onCancel={handleCancel}
                  defaultValues={deathFormValues}
                />
              );
            })()}

          {form.formType === FormType.MARRIAGE &&
            (() => {
              const marriageFormValues = mapToMarriageCertificateValues(form);
              return (
                <MarriageCertificateForm
                  open={editDialogOpen}
                  onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    // Optionally, add refresh logic when dialog closes.
                  }}
                  onCancel={handleCancel}
                  defaultValues={marriageFormValues}
                />
              );
            })()}

          {form.formType === 'BIRTH' && (
            <EditCivilRegistryFormDialog
              form={form}
              open={editDialogOpen}
              onOpenChangeAction={setEditDialogOpen}
              onSaveAction={async (updatedForm) => {
                toast.success(`${t('formUpdated')} ${updatedForm.id}!`);
                onUpdateForm?.(updatedForm);
                setEditDialogOpen(false);
                return Promise.resolve();
              }}
              editType={form.formType}
            />
          )}
        </>
      )}

      {canDelete && (
        <DeleteConfirmationDialog
          open={deletionAlertOpen}
          onOpenChangeAction={setDeletionAlertOpen}
          onConfirmAction={() => {
            handleDelete();
            setDeletionAlertOpen(false);
            onDeleteForm?.(form.id);
          }}
          isLoading={isDeleteLoading}
        />
      )}

      {canUpload && (
        <FileUploadDialog
          open={uploadDialogOpen}
          onOpenChangeAction={setUploadDialogOpen}
          formId={form.id}
          formType={form.formType}
          registryNumber={form.registryNumber}
          bookNumber={form.bookNumber}
          pageNumber={form.pageNumber}
          onUploadSuccess={handleAttachmentsRefresh}
        />
      )}

      {/* CTC Forms */}
      {currentAttachment && (
        <>
          {form.formType === 'BIRTH' && (
            <BirthCertificateFormCTC
              formData={form}
              open={ctcFormOpen}
              onOpenChange={(open) => {
                setCtcFormOpen(open);
                if (!open) {
                  handleAttachmentsRefresh();
                }
              }}
              onClose={() => {
                setCtcFormOpen(false);
                handleAttachmentsRefresh();
              }}
              attachment={currentAttachment}
              onAttachmentUpdated={handleAttachmentsRefresh}
            />
          )}
          {form.formType === 'DEATH' && (
            <DeathCertificateFormCTC
              formData={form}
              open={ctcFormOpen}
              onOpenChange={(open) => {
                setCtcFormOpen(open);
                if (!open) {
                  handleAttachmentsRefresh();
                }
              }}
              onClose={() => {
                setCtcFormOpen(false);
                handleAttachmentsRefresh();
              }}
              attachment={currentAttachment}
              onAttachmentUpdated={handleAttachmentsRefresh}
            />
          )}
          {form.formType === 'MARRIAGE' && (
            <MarriageCertificateFormCTC
              formData={form}
              open={ctcFormOpen}
              onOpenChange={(open) => {
                setCtcFormOpen(open);
                if (!open) {
                  handleAttachmentsRefresh();
                }
              }}
              onClose={() => {
                setCtcFormOpen(false);
                handleAttachmentsRefresh();
              }}
              attachment={currentAttachment}
              onAttachmentUpdated={handleAttachmentsRefresh}
            />
          )}
        </>
      )}

      {/* Annotation Forms */}
      {currentAttachment && currentAttachment.certifiedCopies.length > 0 && (
        <>
          {form.formType === 'BIRTH' && (
            <BirthAnnotationForm
              open={annotationFormOpen}
              onOpenChange={(open) => {
                setAnnotationFormOpen(open);
                if (!open) {
                  setTimeout(() => {
                    handleAttachmentsRefresh();
                  }, 500);
                  setCurrentAttachment(null);
                }
              }}
              onCancel={() => {
                setAnnotationFormOpen(false);
                setCurrentAttachment(null);
                handleAttachmentsRefresh();
              }}
              formData={form}
              certifiedCopyId={currentAttachment.certifiedCopies[0].id}
            />
          )}
          {form.formType === 'DEATH' && (
            <DeathAnnotationForm
              open={annotationFormOpen}
              onOpenChange={(open) => {
                setAnnotationFormOpen(open);
                if (!open) {
                  setTimeout(() => {
                    handleAttachmentsRefresh();
                  }, 500);
                  setCurrentAttachment(null);
                }
              }}
              onCancel={() => {
                setAnnotationFormOpen(false);
                setCurrentAttachment(null);
                handleAttachmentsRefresh();
              }}
              formData={form}
              certifiedCopyId={currentAttachment.certifiedCopies[0].id}
            />
          )}
          {form.formType === 'MARRIAGE' && (
            <MarriageAnnotationForm
              open={annotationFormOpen}
              onOpenChange={(open) => {
                setAnnotationFormOpen(open);
                if (!open) {
                  setTimeout(() => {
                    handleAttachmentsRefresh();
                  }, 500);
                  setCurrentAttachment(null);
                }
              }}
              onCancel={() => {
                setAnnotationFormOpen(false);
                setCurrentAttachment(null);
                handleAttachmentsRefresh();
              }}
              formData={form}
              certifiedCopyId={currentAttachment.certifiedCopies[0].id}
            />
          )}
        </>
      )}
    </>
  );
}