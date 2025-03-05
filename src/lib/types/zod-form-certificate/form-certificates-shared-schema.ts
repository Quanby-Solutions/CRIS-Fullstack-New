// lib/types/zod-form-certificate/form-certificates-shared-schema.ts

import { mainReligions } from '@/lib/constants/religions';
import { z } from 'zod';

// 1. Registry Number (Enforces "YYYY-numbers" and validates the year range)
export const registryNumberSchema = z
  .string()
  .regex(/^\d{4}-\d+$/, 'Registry number must be in format: YYYY-numbers')
  .refine(
    (value) => {
      const year = parseInt(value.split('-')[0], 10);
      const currentYear = new Date().getFullYear();
      return year >= 1945 && year <= currentYear;
    },
    {
      message: 'The year must be between 1945 and the current year.',
    }
  );

// 2. Province (Non-empty string)
export const provinceSchema = z.string().nonempty('Province is required');

// 3. City/Municipality (Non-empty string)
export const cityMunicipalitySchema = z
  .string()
  .nonempty('City/Municipality is required');

export const createDateFieldSchema = (options?: {
  requiredError?: string;
  futureError?: string;
}) => {
  const requiredError = options?.requiredError || 'This date is required';
  const futureError = options?.futureError || 'Date cannot be in the future';

  return z.preprocess(
    (val) => {
      if (val == null || val === '') return undefined; // Convert null/empty → undefined
      if (typeof val === 'string') {
        const date = new Date(val);
        return isNaN(date.getTime()) ? undefined : date;
      }
      return val; // Use the value if it's already a Date
    },
    z
      .date({ required_error: requiredError })
      .refine((d) => d <= new Date(), { message: futureError })
      .optional() // This makes the schema accept undefined values
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// PROCESSING DETAILS: "Prepared By", "Received By", "Registered By"
// Each has Signature, Name in Print, Title/Position, and Date
// ─────────────────────────────────────────────────────────────────────────────
export const signatureSchema = z.union([
  z.custom<File | string | any>(
    (val) => {
      // Check if we're in browser and it's a File
      if (
        typeof window !== 'undefined' &&
        typeof File !== 'undefined' &&
        val instanceof File
      ) {
        return true;
      }
      // On server, accept something that resembles file-like object
      if (val && typeof val === 'object' && 'size' in val && 'type' in val) {
        return true;
      }
      // Also accept string (for base64)
      return typeof val === 'string' && val.length > 0;
    },
    { message: 'Invalid signature format' }
  ),
  z.string().min(1, 'A signature is required'),
]);

export const signatoryDetailsSchema = z.object({
  // signature: signatureSchema,
  nameInPrint: z.string().optional(),
  titleOrPosition: z.string().nonempty('Title or position is required'),
  date: createDateFieldSchema({
    requiredError: 'Date is required',
    futureError: 'Date cannot be in the future',
  }),
});

// Use the same schema for each of the three sets.
export const processingDetailsSchema = z.object({
  preparedBy: signatoryDetailsSchema,
  receivedBy: signatoryDetailsSchema,
  registeredBy: signatoryDetailsSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// COMMON PERSONAL DATA FIELDS
// ─────────────────────────────────────────────────────────────────────────────

// Name (First, Middle, Last)
export const nameSchema = z.object({
  first: z.string().nonempty('First name is required'),
  middle: z.string().optional(), // Middle name can be optional
  last: z.string().nonempty('Last name is required'),
});

// Citizenship
export const citizenshipSchema = z.string().nonempty('Citizenship is required');

// Religion/Religious Sect
export const religionSchema = z
  .preprocess(
    (val) => (val === '' ? undefined : val), // Convert empty string to undefined
    z
      .union([
        z.enum(mainReligions),
        z.string().min(1, 'Please specify your religion').optional(), // For new or custom religions
      ])
      .optional()
  )
  .refine((val) => val !== undefined, {
    message: 'Religion is required',
  });

// Residence (House No., Street, Barangay, City/Municipality, Province, Country)
export const residenceSchema = z.object({
  houseNo: z.string().optional(),
  st: z.string().optional(),
  barangay: z.string().optional(),
  cityMunicipality: cityMunicipalitySchema, // Reuse shared city/municipality schema
  province: provinceSchema, // Reuse shared province schema
  country: z.string().nonempty('Country is required'),
});

// ─────────────────────────────────────────────────────────────────────────────
// PARENT INFORMATION
// (Father's Name, Mother's Name) - Both are nameSchema
// ─────────────────────────────────────────────────────────────────────────────
export const parentInfoSchema = z.object({
  fatherName: nameSchema,
  motherName: nameSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMINISTRATIVE
// Remarks/Annotations, Late Registration Option, Document Status
// ─────────────────────────────────────────────────────────────────────────────

// Remarks/Annotations (optional text)
export const remarksAnnotationsSchema = z.string().optional();

// Late Registration Option (could be a boolean or an enum/string depending on your UI)
export const lateRegistrationOptionSchema = z.boolean().optional();

// Document Status (e.g., 'Draft', 'Final', 'Archived'—adjust as needed)
export const documentStatusSchema = z
  .string()
  .nonempty('Document status is required');

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION INFORMATION
// ─────────────────────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  pageNumber: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Skip validation if not provided.
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0;
      },
      { message: 'Page number must be a valid positive number' }
    ),
  bookNumber: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Skip validation if not provided.
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0;
      },
      { message: 'Book number must be a valid positive number' }
    ),
});

export const placeOfDeathSchema = z.object({
  // Name of Hospital/Clinic/Institution
  hospitalInstitution: z.string().optional(),

  // Address fields
  houseNo: z.string().optional(),
  st: z.string().optional(),
  barangay: z.string().optional(),
  cityMunicipality: cityMunicipalitySchema, // Reuse shared city/municipality schema
  province: provinceSchema, // Reuse shared province schema
});
