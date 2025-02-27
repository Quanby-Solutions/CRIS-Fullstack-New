'use client'

import { toast } from 'sonner'
import { useState, useCallback } from 'react'
import { hasPermission } from '@/types/auth'
import { Icons } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'
import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FormType, Permission, Attachment, DocumentStatus, AttachmentType } from '@prisma/client'
import { FileUploadDialog } from '@/components/custom/civil-registry/components/file-upload'
import { EditCivilRegistryFormDialog } from '@/components/custom/civil-registry/components/edit-civil-registry-form-dialog'
import { AttachmentsTable, AttachmentWithCertifiedCopies } from '@/components/custom/civil-registry/components/attachment-table'
import StatusSelect from './status-dropdown'

interface BaseDetailsCardProps {
    form: BaseRegistryFormWithRelations
    onUpdateAction?: (updatedForm: BaseRegistryFormWithRelations) => void
}

/**
 * Map form types to display labels.
 */
const formTypeLabels: Record<FormType, string> = {
    MARRIAGE: 'Marriage (Form 97)',
    BIRTH: 'Birth (Form 102)',
    DEATH: 'Death (Form 103)',
}

/**
 * Helper function to create a minimal Attachment object from file data.
 * (This is used only for UI purposes when uploading an attachment.)
 */
const createAttachment = (fileUrl: string, fileName: string): Attachment & { certifiedCopies: never[] } => {
    return {
        id: '',
        userId: null,
        documentId: null,
        type: 'BIRTH_CERTIFICATE' as const,
        fileUrl,
        fileName,
        fileSize: 0,
        mimeType: 'application/octet-stream',
        status: 'PENDING' as const,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        verifiedAt: null,
        notes: null,
        metadata: null,
        hash: null,
        certifiedCopies: [],
    }
}

export const BaseDetailsCard: React.FC<BaseDetailsCardProps> = ({ form, onUpdateAction }) => {
    const { t } = useTranslation()
    const { permissions } = useUser()

    // Action permissions
    const canEdit = hasPermission(permissions, Permission.DOCUMENT_UPDATE)
    const canDelete = hasPermission(permissions, Permission.DOCUMENT_DELETE)
    const canUpload = hasPermission(permissions, Permission.DOCUMENT_CREATE)

    // Dialog state variables for editing and uploading
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

    // State to track current form with attachments
    const [currentForm, setCurrentForm] = useState<BaseRegistryFormWithRelations>(form)

    // Ensure we always use the latest form data (from props or state)
    const formData = onUpdateAction ? form : currentForm

    // Explicitly cast attachments to include certifiedCopies.
    const attachments: AttachmentWithCertifiedCopies[] = formData.documents
        .flatMap(doc => doc.document.attachments)
        .map(att => ({
            ...att,
            certifiedCopies: att.certifiedCopies ?? []
        }))

    // Ensure every attachment has a certifiedCopies array (default to empty if missing).
    const attachmentsWithCTC = attachments.map((att) => ({
        ...att,
        certifiedCopies: att.certifiedCopies ?? [],
    }))

    /**
     * Callback for when an attachment has been deleted.
     */
    const handleAttachmentDeleted = useCallback((deletedId: string) => {
        const updatedDocuments = formData.documents.map(doc => ({
            ...doc,
            document: {
                ...doc.document,
                attachments: doc.document.attachments.filter(att => att.id !== deletedId)
            }
        }))

        const updatedForm = {
            ...formData,
            documents: updatedDocuments as typeof formData.documents
        }

        // Update local state for immediate UI feedback
        setCurrentForm(updatedForm)

        // Call parent update if available
        if (onUpdateAction) {
            onUpdateAction(updatedForm)
        }
    }, [formData, onUpdateAction])

    /**
     * Handle upload success - called when a file is successfully uploaded
     */
    const handleUploadSuccess = useCallback((fileData: { url: string, id: string, attachmentId: string, fileName: string }) => {
        // Map FormType to AttachmentType
        const attachmentType = formData.formType === 'MARRIAGE' ? 'MARRIAGE_CERTIFICATE' :
            formData.formType === 'BIRTH' ? 'BIRTH_CERTIFICATE' :
                formData.formType === 'DEATH' ? 'DEATH_CERTIFICATE' :
                    'CERTIFIED_TRUE_COPY_REQUEST' // Default case if needed

        // Create a new attachment from the uploaded file data
        const newAttachment = {
            ...createAttachment(fileData.url, fileData.fileName),
            id: fileData.attachmentId,
            type: attachmentType as AttachmentType,
            fileName: fileData.fileName, // Use the actual file name
            uploadedAt: new Date(),
        }

        // Create the new document object
        const newDocument = {
            document: {
                id: fileData.id,
                status: 'PENDING' as DocumentStatus,
                createdAt: new Date(),
                updatedAt: new Date(),
                type: attachmentType as AttachmentType,
                title: `${formData.formType} Document - ${formData.registryNumber}`,
                attachments: [newAttachment],
                metadata: {},
                description: null,
                version: 1,
                isLatest: true,
            },
        }

        const updatedForm = {
            ...formData,
            documents: [...formData.documents, newDocument] as typeof formData.documents,
        }

        // Update local state for immediate UI feedback
        setCurrentForm(updatedForm)

        // Call parent update if available
        if (onUpdateAction) {
            onUpdateAction(updatedForm)
        }

        // Display success message
        toast.success(t('Document uploaded successfully'))
    }, [formData, t, onUpdateAction])

    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl">{t('Base Details')}</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Form Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="font-medium">{t('Form Number')}</p>
                        <div>{formData.formNumber}</div>
                    </div>
                    <div>
                        <p className="font-medium">{t('Registry Number')}</p>
                        <div>{formData.registryNumber}</div>
                    </div>
                    <div>
                        <p className="font-medium">{t('Form Type')}</p>
                        <div>{formTypeLabels[formData.formType]}</div>
                    </div>
                    <div>
                        <p className="font-medium">{t('Status')}</p>
                        <div>
                            <StatusSelect
                                formId={formData.id}
                                registryNumber={formData.registryNumber ?? 'N/A'}
                                bookNumber={formData.bookNumber ?? 'N/A'}
                                pageNumber={formData.pageNumber ?? 'N/A'}
                                formType={formData.formType ?? 'N/A'}
                                currentStatus={formData.status as DocumentStatus}
                                onStatusChange={(newStatus) => {
                                    const updatedForm = { ...formData, status: newStatus }
                                    setCurrentForm(updatedForm)
                                    onUpdateAction?.(updatedForm)
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                {(canUpload || canEdit || canDelete) && (
                    <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-lg">{t('Actions')}</h4>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {canUpload && (
                                <Button onClick={() => setUploadDialogOpen(true)} variant="outline">
                                    <Icons.add className="mr-2 h-4 w-4" />
                                    {t('uploadDocument')}
                                </Button>
                            )}
                            {canEdit && (
                                <Button onClick={() => setEditDialogOpen(true)} variant="secondary">
                                    <Icons.edit className="mr-2 h-4 w-4" />
                                    {t('editForm.title')}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Latest Attachment Section as Table */}
                <div className="mt-4">
                    <h4 className="font-medium text-lg">{t('Latest Attachment')}</h4>
                    <AttachmentsTable
                        attachments={attachmentsWithCTC}
                        onAttachmentDeleted={handleAttachmentDeleted}
                        formType={formData.formType}
                        formData={formData}
                        canDelete={canDelete}
                    />
                </div>
            </CardContent>

            {/* Dialogs */}
            {canUpload && (
                <FileUploadDialog
                    open={uploadDialogOpen}
                    onOpenChangeAction={setUploadDialogOpen}
                    onUploadSuccess={handleUploadSuccess}
                    formId={formData.id}
                    formType={formData.formType}
                    bookNumber={formData.bookNumber}
                    pageNumber={formData.pageNumber}
                    registryNumber={formData.registryNumber}
                />
            )}

            {canEdit && (
                <EditCivilRegistryFormDialog
                    form={formData}
                    open={editDialogOpen}
                    onOpenChangeAction={setEditDialogOpen}
                    onSaveAction={async (updatedForm) => {
                        toast.success(`${t('Form updated successfully')} ${updatedForm.id}!`)
                        setCurrentForm(updatedForm)
                        onUpdateAction?.(updatedForm)
                        setEditDialogOpen(false)
                    }}
                    editType={formData.formType}
                />

            )}
        </Card>
    )
}

export default BaseDetailsCard
