'use client'

import React from 'react'
import { Row } from '@tanstack/react-table'
import { hasPermission } from '@/types/auth'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'
import { Feedback, Permission } from '@prisma/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DeleteFeedbackDialog } from './components/delete-feedback-dialog'
import { FeedbackDetailsDialog } from './components/feedback-details-dialog'
import { useRouter } from 'next/navigation'

type FeedbackRow = Feedback & {
  user: {
    name: string
    email: string
    image: string | null
  } | null
}

interface DataTableRowActionsProps {
  row: Row<FeedbackRow>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const feedback = row.original
  const [viewDetailsOpen, setViewDetailsOpen] = React.useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)
  const { permissions } = useUser()
  const router = useRouter()

  const canDelete = hasPermission(permissions, Permission.FEEDBACK_DELETE)
  const canViewDetails = hasPermission(permissions, Permission.FEEDBACK_READ)

  // Delete success: refresh the table data via Next.js router refresh.
  const handleDeleteSuccess = () => {
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <Icons.more className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canViewDetails && (
            <DropdownMenuItem onClick={() => setViewDetailsOpen(true)}>
              <Icons.view className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              onClick={() => setConfirmDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Icons.trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canViewDetails && (
        <FeedbackDetailsDialog
          open={viewDetailsOpen}
          onOpenChangeAction={setViewDetailsOpen}
          feedback={feedback}
        />
      )}

      {canDelete && (
        <DeleteFeedbackDialog
          open={confirmDeleteOpen}
          onOpenChangeAction={setConfirmDeleteOpen}
          feedback={feedback}
          onDeleteSuccessAction={handleDeleteSuccess}
        />
      )}
    </>
  )
}
