'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Attachment,
    BirthCertificateForm,
    CertifiedCopy,
    DeathCertificateForm,
    FormType,
    MarriageCertificateForm,
    Permission,
} from '@prisma/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Icons } from '@/components/ui/icons'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover'

import BirthAnnotationForm from '@/components/custom/forms/annotations/birth-cert-annotation'
import DeathAnnotationForm from '@/components/custom/forms/annotations/death-annotation'
import MarriageAnnotationForm from '@/components/custom/forms/annotations/marriage-annotation-form'
import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action'
import { useUser } from '@/context/user-context'
import { hasPermission } from '@/types/auth'
import BirthCertificateFormCTC from '../../forms/requests/birth-request-form'
import MarriageCertificateFormCTC from '../../forms/requests/marriage-request-form'
import DeathCertificateFormCTC from '../../forms/requests/death-request-form'

export type AttachmentWithCertifiedCopies = Attachment & {
    certifiedCopies: CertifiedCopy[]
}

export interface AttachmentsTableProps {
    attachments: AttachmentWithCertifiedCopies[]
    onAttachmentDeleted?: (deletedId: string) => void
    onAttachmentsUpdated?: ((updatedAttachments: AttachmentWithCertifiedCopies[]) => void) | undefined
    canDelete?: boolean
    formType: FormType
    formData?: BaseRegistryFormWithRelations & {
        birthCertificateForm?: BirthCertificateForm | null
        deathCertificateForm?: DeathCertificateForm | null
        marriageCertificateForm?: MarriageCertificateForm | null
    }
}

export const AttachmentsTable: React.FC<AttachmentsTableProps> = ({
    attachments: initialAttachments,
    onAttachmentDeleted,
    onAttachmentsUpdated,
    canDelete = false,
    formType,
    formData,
}) => {
    const [attachments, setAttachments] = useState<AttachmentWithCertifiedCopies[]>([])
    const { t } = useTranslation()
    const { permissions } = useUser()

    const [currentAttachment, setCurrentAttachment] = useState<AttachmentWithCertifiedCopies | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Global export permission: allow if in development or if user has DOCUMENT_EXPORT permission.
    const exportAllowed =
        process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
        hasPermission(permissions, Permission.DOCUMENT_EXPORT)

    // Create a combined check for delete permission.
    const deleteAllowed =
        canDelete && hasPermission(permissions, Permission.DOCUMENT_DELETE)

    // State for annotation form dialog.
    const [annotationFormOpen, setAnnotationFormOpen] = useState(false)

    const [ctcFormOpen, setCtcFormOpen] = useState(false)

    // Function to sort attachments by upload date (newest first)
    const sortAttachments = useCallback((items: AttachmentWithCertifiedCopies[]) => {
        return [...items].sort((a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
    }, [])

    // Initialize and update attachments when props change
    useEffect(() => {
        if (initialAttachments && initialAttachments.length > 0) {
            setAttachments(sortAttachments(initialAttachments))
        }
    }, [initialAttachments, sortAttachments])

    // Direct API fetch function to ensure we always get the latest data with relationships
    const fetchAttachments = useCallback(async (): Promise<AttachmentWithCertifiedCopies[]> => {
        if (!formData?.id) {
            console.warn('Cannot fetch attachments: formData or formData.id is missing')
            return []
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/forms/${formData.id}/attachments`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch attachments: ${response.statusText}`)
            }

            const data = await response.json()

            // Verify that certifiedCopies is included in the response
            const hasCertifiedCopies = data.length > 0 && 'certifiedCopies' in data[0]

            if (!hasCertifiedCopies) {
                console.warn('API response missing certifiedCopies relationship, using different endpoint')

                // Try a different approach to get the full data with relationships
                const detailedAttachments = await Promise.all(
                    data.map(async (att: Attachment) => {
                        try {
                            const detailResponse = await fetch(`/api/attachments/${att.id}`)
                            if (detailResponse.ok) {
                                return await detailResponse.json()
                            }
                            return { ...att, certifiedCopies: [] }
                        } catch (error) {
                            console.error(`Error fetching details for attachment ${att.id}:`, error)
                            return { ...att, certifiedCopies: [] }
                        }
                    })
                )

                return detailedAttachments
            }

            return data
        } catch (error) {
            console.error('Error fetching attachments:', error)
            toast.error(t('Failed to refresh attachments'))
            return []
        } finally {
            setIsLoading(false)
        }
    }, [formData?.id, t])

    // Comprehensive refresh function
    const handleAttachmentsRefresh = useCallback(async () => {
        const updatedAttachments = await fetchAttachments()

        if (updatedAttachments.length > 0) {
            const sortedAttachments = sortAttachments(updatedAttachments)
            setAttachments(sortedAttachments)

            // Call parent update handler if provided
            if (onAttachmentsUpdated) {
                onAttachmentsUpdated(sortedAttachments)
            }
        }
    }, [fetchAttachments, onAttachmentsUpdated, sortAttachments])

    // Handler to open the annotation dialog.
    const handleIssueCertificate = useCallback((attachment: AttachmentWithCertifiedCopies) => {
        setCurrentAttachment(attachment)
        setAnnotationFormOpen(true)
    }, [])

    const handleCtc = useCallback((attachment: AttachmentWithCertifiedCopies) => {
        setCurrentAttachment(attachment)
        setCtcFormOpen(true)
    }, [])

    const handleDelete = useCallback(async (attachmentId: string) => {
        try {
            setIsLoading(true)
            const res = await fetch(`/api/attachments/${attachmentId}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                const json = await res.json()
                throw new Error(json.error || t('Failed to delete attachment'))
            }

            toast.success(t('Attachment deleted successfully'))

            // Call parent delete handler
            onAttachmentDeleted?.(attachmentId)

            // Immediately remove the deleted attachment from local state
            setAttachments(prev => prev.filter(att => att.id !== attachmentId))

            // Also refresh from server to ensure consistency
            await fetchAttachments().then(updatedAttachments => {
                const sortedAttachments = sortAttachments(updatedAttachments)
                setAttachments(sortedAttachments)

                // Call parent update handler if provided
                if (onAttachmentsUpdated) {
                    onAttachmentsUpdated(sortedAttachments)
                }
            })
        } catch (error: unknown) {
            console.error('Delete error:', error)
            const errMsg = error instanceof Error ? error.message : t('Failed to delete attachment')
            toast.error(errMsg)
        } finally {
            setIsLoading(false)
        }
    }, [fetchAttachments, onAttachmentDeleted, onAttachmentsUpdated, sortAttachments, t])

    const handleExport = useCallback(async (attachment: AttachmentWithCertifiedCopies) => {
        try {
            // Double-check CTC status by fetching the latest data for this attachment
            const latestAttachmentResponse = await fetch(`/api/attachments/${attachment.id}`)
            let hasCTC = (attachment.certifiedCopies?.length ?? 0) > 0

            if (latestAttachmentResponse.ok) {
                const latestAttachment = await latestAttachmentResponse.json()
                hasCTC = (latestAttachment.certifiedCopies?.length ?? 0) > 0
            }

            if (!hasCTC) {
                toast.error(t('You need to issue a certified true copy (CTC) for export'))
                return
            }

            if (!exportAllowed) {
                toast.error(t('You do not have credentials to export this document'))
                return
            }

            setIsLoading(true)
            // Export logic
            const exportUrl = `/api/attachments/${attachment.id}/export?zip=true`
            const res = await fetch(exportUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/zip',
                    'Cache-Control': 'no-cache'
                }
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => null)
                throw new Error(errorData?.error || t('Failed to export attachment'))
            }

            const blob = await res.blob()

            // Extract the filename from the Content-Disposition header
            const disposition = res.headers.get('Content-Disposition')
            let filename = ''
            if (disposition) {
                const filenameMatch = disposition.match(/filename[^=\n]*=((['"]).*?\2|[^\n]*)/)
                if (filenameMatch && filenameMatch[1]) {
                    // Remove quotes if present
                    filename = filenameMatch[1].replace(/['"]/g, '')
                }
            }

            // Fallback filename with timestamp if header is not present
            if (!filename) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
                const baseFileName = attachment.fileName.replace(/\.[^/.]+$/, '')
                filename = `${baseFileName}-${timestamp}.zip`
            }

            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()

            // Cleanup
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            toast.success(t('Export completed successfully'))
        } catch (error: unknown) {
            console.error('Export error:', error)
            const errMsg = error instanceof Error ? error.message : t('Failed to export attachment')
            toast.error(errMsg)
        } finally {
            setIsLoading(false)
        }
    }, [exportAllowed, t])

    // Initial load of attachments
    useEffect(() => {
        // Only fetch if we have formData (prevents unnecessary fetch on mount)
        if (formData?.id) {
            fetchAttachments().then(fetchedAttachments => {
                const sortedAttachments = sortAttachments(fetchedAttachments)
                setAttachments(sortedAttachments)

                // Call parent update handler if provided
                if (onAttachmentsUpdated) {
                    onAttachmentsUpdated(sortedAttachments)
                }
            })
        } else {
            // If no formData, just use the initialAttachments (sorted)
            setAttachments(sortAttachments(initialAttachments))
        }
        // Handle formData and initialAttachments changing
    }, [fetchAttachments, formData?.id, initialAttachments, onAttachmentsUpdated, sortAttachments])

    return (
        <>
            {isLoading && attachments.length === 0 && (
                <div className="flex justify-center py-4">
                    <Icons.spinner className="h-6 w-6 animate-spin" />
                </div>
            )}

            {!isLoading && attachments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                    {t('No attachments available.')}
                </p>
            ) : (
                <>
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-4 py-2 text-left">{t('File Name')}</TableHead>
                                <TableHead className="px-4 py-2 text-left">{t('Uploaded On')}</TableHead>
                                <TableHead className="px-4 py-2 text-left">{t('CTC Issued')}</TableHead>
                                <TableHead className="px-4 py-2 text-left">
                                    <div className="flex items-center justify-between">
                                        {t('Actions')}
                                        {isLoading && (
                                            <Icons.spinner className="h-4 w-4 animate-spin ml-2" />
                                        )}
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attachments.map((attachment) => {
                                const hasCTC = (attachment.certifiedCopies?.length ?? 0) > 0
                                const disableExport = !exportAllowed || !hasCTC

                                return (
                                    <TableRow key={attachment.id} className="border-b">
                                        <TableCell className="px-4 py-2">
                                            <span className="block truncate max-w-xs" title={attachment.fileName}>
                                                {attachment.fileName}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            {new Date(attachment.uploadedAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            {hasCTC ? (
                                                <span className="text-green-600 font-semibold">{t('Yes')}</span>
                                            ) : (
                                                <span className="text-gray-500">{t('No')}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                {deleteAllowed && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" disabled={isLoading}>
                                                                {t('Delete')}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    {t('Are you absolutely sure?')}
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t(
                                                                        'This action cannot be undone. This will permanently delete the attachment.'
                                                                    )}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>
                                                                    {t('Cancel')}
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(attachment.id)}>
                                                                    {t('Delete')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}

                                                {disableExport ? (
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="outline" size="sm" disabled>
                                                            {t('Export')}
                                                        </Button>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <Icons.infoCircledIcon className="h-4 w-4" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-64">
                                                                <p>
                                                                    {t(
                                                                        'You need to issue a certified true copy (CTC) before you can export this document.'
                                                                    )}
                                                                </p>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleExport(attachment)}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : null}
                                                        {t('Export (ZIP)')}
                                                    </Button>
                                                )}

                                                <Button
                                                    onClick={() => handleCtc(attachment)}
                                                    variant="secondary"
                                                    size="sm"
                                                    disabled={isLoading}
                                                >
                                                    <Icons.files className="mr-2 h-4 w-4" />
                                                    {t('issueCtc')}
                                                </Button>

                                                {hasCTC ? (
                                                    <Button
                                                        onClick={() => handleIssueCertificate(attachment)}
                                                        variant="secondary"
                                                        size="sm"
                                                        disabled={isLoading}
                                                    >
                                                        <Icons.files className="mr-2 h-4 w-4" />
                                                        {t('issueCertificateAno')}
                                                    </Button>
                                                ) : (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                disabled
                                                            >
                                                                <Icons.files className="mr-2 h-4 w-4" />
                                                                {t('issueCertificateAno')}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-64">
                                                            <p>
                                                                {t('You need to issue a Certified True Copy (CTC) before creating an annotation.')}
                                                            </p>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>

                    {formType === 'BIRTH' && (
                        <>
                            {/* for creating ctc */}
                            <BirthCertificateFormCTC
                                formData={formData}
                                open={ctcFormOpen}
                                onOpenChange={(open) => {
                                    setCtcFormOpen(open)
                                    if (!open) {
                                        handleAttachmentsRefresh()
                                    }
                                }}
                                onClose={() => {
                                    setCtcFormOpen(false)
                                    handleAttachmentsRefresh()
                                }}
                                attachment={currentAttachment}
                                onAttachmentUpdated={handleAttachmentsRefresh}
                            />

                            {/* for creating annotation */}
                            {currentAttachment && currentAttachment.certifiedCopies.length > 0 && (
                                <BirthAnnotationForm
                                    open={annotationFormOpen}
                                    onOpenChange={(open) => {
                                        setAnnotationFormOpen(open)
                                        if (!open) {
                                            setTimeout(() => {
                                                handleAttachmentsRefresh()
                                            }, 500)
                                            setCurrentAttachment(null)
                                        }
                                    }}
                                    onCancel={() => {
                                        setAnnotationFormOpen(false)
                                        setCurrentAttachment(null)
                                        handleAttachmentsRefresh()
                                    }}
                                    formData={formData!}
                                    certifiedCopyId={currentAttachment.certifiedCopies[0].id}
                                />
                            )}
                        </>
                    )}
                    {formType === 'DEATH' && (
                        <>
                            <DeathCertificateFormCTC
                                formData={formData}
                                open={ctcFormOpen}
                                onOpenChange={(open) => {
                                    setCtcFormOpen(open)
                                    if (!open) {
                                        handleAttachmentsRefresh()
                                    }
                                }}
                                onClose={() => {
                                    setCtcFormOpen(false)
                                    handleAttachmentsRefresh()
                                }}
                                attachment={currentAttachment}
                                onAttachmentUpdated={handleAttachmentsRefresh}
                            />

                            {/* for creating annotation */}
                            {currentAttachment && currentAttachment.certifiedCopies.length > 0 && (
                                <DeathAnnotationForm
                                    open={annotationFormOpen}
                                    onOpenChange={(open) => {
                                        setAnnotationFormOpen(open)
                                        if (!open) {
                                            setTimeout(() => {
                                                handleAttachmentsRefresh()
                                            }, 500)
                                            setCurrentAttachment(null)
                                        }
                                    }}
                                    onCancel={() => {
                                        setAnnotationFormOpen(false)
                                        setCurrentAttachment(null)
                                        handleAttachmentsRefresh()
                                    }}
                                    formData={formData!}
                                    certifiedCopyId={currentAttachment.certifiedCopies[0].id}
                                />
                            )}
                        </>
                    )}
                    {formType === 'MARRIAGE' && (
                        <>
                            <MarriageCertificateFormCTC formData={formData}
                                open={ctcFormOpen}
                                onOpenChange={(open) => {
                                    setCtcFormOpen(open)
                                    if (!open) {
                                        handleAttachmentsRefresh()
                                    }
                                }}
                                onClose={() => {
                                    setCtcFormOpen(false)
                                    handleAttachmentsRefresh()
                                }}
                                attachment={currentAttachment}
                                onAttachmentUpdated={handleAttachmentsRefresh}
                            />

                            {/* for creating annotation */}
                            {currentAttachment && currentAttachment.certifiedCopies.length > 0 && (
                                <MarriageAnnotationForm
                                    open={annotationFormOpen}
                                    onOpenChange={(open) => {
                                        setAnnotationFormOpen(open)
                                        if (!open) {
                                            setTimeout(() => {
                                                handleAttachmentsRefresh()
                                            }, 500)
                                            setCurrentAttachment(null)
                                        }
                                    }}
                                    onCancel={() => {
                                        setAnnotationFormOpen(false)
                                        setCurrentAttachment(null)
                                        handleAttachmentsRefresh()
                                    }}
                                    formData={formData!}
                                    certifiedCopyId={currentAttachment.certifiedCopies[0].id}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </>
    )
}