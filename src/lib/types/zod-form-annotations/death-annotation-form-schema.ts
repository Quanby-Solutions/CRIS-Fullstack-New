// src\lib\types\zod-form-annotations\death-annotation-form-schema.ts
import { z } from 'zod'

export const DeathAnnotationFormSchema = z.object({
  pageNumber: z.string().min(1, 'Page number is required'),
  bookNumber: z.string().min(1, 'Book number is required'),
  registryNumber: z.string().min(1, 'Registry number is required'),
  dateOfRegistration: z.string().min(1, 'Date of registration is required'),
  nameOfDeceased: z.string().min(1, 'Name of deceased is required'),
  sex: z.enum(['Male', 'Female', 'Other'], { required_error: 'Sex is required' }).optional(),
  age: z.coerce.number().min(0, 'Age must be a positive number'),
  civilStatus: z.string().min(1, 'Civil status is required'),
  citizenship: z.string().min(1, 'Citizenship is required'),
  dateOfDeath: z.string().min(1, 'Date of death is required'),
  placeOfDeath: z.string().min(1, 'Place of death is required'),
  causeOfDeath: z.string().min(1, 'Cause of death is required'),
  issuedTo: z.string().min(1, 'Issued to is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  remarks: z.string().optional(),
  preparedByName: z.string().min(1, 'Prepared by name is required'),
  preparedByPosition: z.string().min(1, 'Prepared by position is required'),
  verifiedByName: z.string().min(1, 'Verified by name is required'),
  verifiedByPosition: z.string().min(1, 'Verified by position is required'),
  civilRegistrar: z.string().min(1, 'Civil registrar is required'),
  civilRegistrarPosition: z.string().min(1, 'Civil registrar position is required'),
  amountPaid: z.coerce.number().nullable().optional(),
  orNumber: z.string().optional(),
  datePaid: z.string().min(1, 'Date paid is required').optional(),
})

export type DeathAnnotationFormValues = z.infer<typeof DeathAnnotationFormSchema>