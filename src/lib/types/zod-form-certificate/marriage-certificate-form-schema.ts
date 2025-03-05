import { string, z } from 'zod'
import {
  citizenshipSchema,
  cityMunicipalitySchema,
  createDateFieldSchema,
  nameSchema,
  paginationSchema,
  processingDetailsSchema,
  provinceSchema,
  registryNumberSchema,
  signatureSchema,
} from './form-certificates-shared-schema'

/**
 * Helper schemas for common fields
 */
const locationSchema = z.object({
  houseNo: z.string().optional(),
  street: z.string().optional(),
  barangay: z.string().optional(),
  cityMunicipality: z.string(),
  province: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
})


const residenceSchemas = z.object({
  st: z.string().optional(),
  barangay: z.string().optional(),
  cityMunicipality: z.string().optional(), // Reuse shared city/municipality schema
  province: z.string().optional(), // Reuse shared province schema
  country: z.string().optional(),
  region: z.string().optional(),
})


//*****BACK PAGE ***************************************** //
//*****BACK PAGE ***************************************** //
const affidavitOfSolemnizingOfficerSchema = z.object({

  a: z.object({
    nameOfHusband: nameSchema,
    nameOfWife: nameSchema
  }),
  b: z.object({
    a: z.boolean().default(false),
    b: z.boolean().default(false),
    c: z.boolean().default(false),
    d: z.boolean().default(false),
    e: z.boolean().default(false),
  }),
  c: z.string().optional(),
  d: z.object({
    dayOf: createDateFieldSchema({
      requiredError: 'Start date is required',
      futureError: 'Start date cannot be in the future',
    }),
    atPlaceExecute: residenceSchemas,
  }),
  dateSworn: z.object({
    dayOf: createDateFieldSchema({
      requiredError: 'Start date is required',
      futureError: 'Start date cannot be in the future',
    }),
    atPlaceOfSworn: residenceSchemas,
    ctcInfo: z.object({
      number: z.string().min(1, 'CTC number is required'),
      dateIssued: createDateFieldSchema({
        requiredError: 'Start date is required',
        futureError: 'Start date cannot be in the future',
      }),
      placeIssued: z.string().min(1, 'Place issued is required'),
    }),
  }),
  solemnizingOfficerInformation: z.object({
    officerName: z.object({
      first: z.string().optional(),
      middle: z.string().optional(), // Middle name can be optional
      last: z.string().optional(),
    }),
    officeName: z.string().min(1, 'Office name is required'),
    // Signature removed
    address: z.string().min(1, 'Address is required'),
  }),
  administeringOfficerInformation: z.object({
    adminName: z.object({
      first: z.string().optional(),
      middle: z.string().optional(), // Middle name can be optional
      last: z.string().optional(),
    }),
    // Signature removed
    address: z.string().min(1, 'Address is required'),
    position: z.string().min(1, 'Position/Title/Designation is required'),
  })
})

const affidavitForDelayedSchema = z.object({
  delayedRegistration: z.enum(['Yes', 'No']).default('No'),

  administeringInformation: z.object({
    adminName: z.string().optional(),
    // Admin signature removed
    position: z.string().optional(),
    adminAddress: z.string().optional(),
  }).optional(), // Make this entire section optional

  applicantInformation: z.object({
    // Signature of applicant removed
    nameOfApplicant: z.string().optional(),
    applicantAddress: residenceSchemas.optional(), // Make the address optional
    postalCode: z
      .string()
      .min(4, 'Postal code must be at least 4 digits')
      .max(6, 'Postal code must be at most 6 digits')
      .regex(/^\d+$/, 'Postal code must contain only numbers')
      .optional(), // Make postal code optional
  }).optional(),

  a: z
    .object({
      a: z.object({
        agreement: z.boolean().default(false).optional(),
        nameOfPartner: z
          .object({
            first: z.string().optional(),
            middle: z.string().optional(),
            last: z.string().optional(),
          })
          .optional(),
        placeOfMarriage: z.string().optional(),
        dateOfMarriage: createDateFieldSchema({
          requiredError: 'Start date is required',
          futureError: 'Start date cannot be in the future',
        }).optional(),
      }).optional(),

      b: z.object({
        agreement: z.boolean().default(false).optional(),
        nameOfHusband: z
          .object({
            first: z.string().optional(),
            middle: z.string().optional(),
            last: z.string().optional(),
          })
          .optional(),
        nameOfWife: z
          .object({
            first: z.string().optional(),
            middle: z.string().optional(),
            last: z.string().optional(),
          })
          .optional(),
        placeOfMarriage: z.string().optional(),
        dateOfMarriage: createDateFieldSchema({
          requiredError: 'Start date is required',
          futureError: 'Start date cannot be in the future',
        }).optional(),
      }).optional(),
    }).optional(),

  b: z.object({
    solemnizedBy: z.string().min(1, 'Name of officer is required').optional(), // Make required fields optional
    sector: z.enum([
      'religious-ceremony',
      'civil-ceremony',
      'Muslim-rites',
      'tribal-rites',
    ]).optional(), // Make required fields optional
  }).optional(),

  c: z.object({
    a: z.object({
      licenseNo: z.string().min(1, 'License number is required').optional(), // Make required fields optional
      dateIssued: createDateFieldSchema({
        requiredError: 'Start date is required',
        futureError: 'Start date cannot be in the future',
      }).optional(),
      placeOfSolemnizedMarriage: z.string().min(1, 'Place of Solemnized marriage').optional(), // Make required fields optional
    }).optional(),
    b: z.object({
      underArticle: z.string().optional(),
    }).optional(),
  }).optional(),

  d: z.object({
    husbandCitizenship: citizenshipSchema.optional(), // Make required fields optional
    wifeCitizenship: citizenshipSchema.optional(), // Make required fields optional
  }).optional(),

  e: z.string().nonempty('Add valid reason').optional(), // Make required fields optional

  f: z.object({
    date: createDateFieldSchema({
      requiredError: 'Start date is required',
      futureError: 'Start date cannot be in the future',
    }).optional(), // Make required fields optional
    place: residenceSchemas.optional(), // Make required fields optional
  }).optional(),

  dateSworn: z.object({
    dayOf: createDateFieldSchema({
      requiredError: 'Start date is required',
      futureError: 'Start date cannot be in the future',
    }).optional(),
    atPlaceOfSworn: residenceSchemas.optional(), // Make required fields optional
    ctcInfo: z.object({
      number: z.string().min(1, 'CTC number is required').optional(), // Make required fields optional
      dateIssued: createDateFieldSchema({
        requiredError: 'Start date is required',
        futureError: 'Start date cannot be in the future',
      }).optional(),
      placeIssued: z.string().optional(),
    }).optional(),
  }).optional(),
}).optional(); // Make the entire affidavit section optional

/**
 * Main Marriage Certificate Schema
 */
export const marriageCertificateSchema = z.object({
  // Registry Information
  // Registry Information
  registryNumber: registryNumberSchema,
  province: provinceSchema,
  cityMunicipality: cityMunicipalitySchema,
  contractDay: createDateFieldSchema({
    requiredError: 'Start date is required',
    futureError: 'Start date cannot be in the future',
  }),

  // Husband Information
  husbandName: nameSchema,
  husbandAge: z.number().int(),
  husbandBirth: createDateFieldSchema({
    requiredError: 'Start date is required',
    futureError: 'Start date cannot be in the future',
  }),
  husbandPlaceOfBirth: locationSchema,
  husbandSex: z.enum(['Male', 'Female']),
  husbandCitizenship: z.string(),
  husbandResidence: z.string(),
  husbandReligion: z.string(),
  husbandCivilStatus: z.enum(['Single', 'Widowed', 'Divorced']),
  husbandConsentPerson: z.object({
    name: nameSchema,
    relationship: z.string(),
    residence: locationSchema
  }),
  husbandParents: z.object({
    fatherName: nameSchema,
    fatherCitizenship: z.string(),
    motherName: nameSchema,
    motherCitizenship: z.string()
  }),

  // Wife Information
  wifeName: nameSchema,
  wifeAge: z.number().int(),
  wifeBirth: createDateFieldSchema({
    requiredError: 'Start date is required',
    futureError: 'Start date cannot be in the future',
  }),
  wifePlaceOfBirth: locationSchema,
  wifeSex: z.enum(['Female']),
  wifeCitizenship: z.string(),
  wifeResidence: z.string(),
  wifeReligion: z.string(),
  wifeCivilStatus: z.enum(['Single', 'Widowed', 'Divorced']),
  wifeConsentPerson: z.object({
    name: nameSchema,
    relationship: z.string(),
    residence: locationSchema
  }),
  wifeParents: z.object({
    fatherName: nameSchema,
    fatherCitizenship: z.string(),
    motherName: nameSchema,
    motherCitizenship: z.string()
  }),

  // Marriage Details
  placeOfMarriage: z.object({
    ...locationSchema.shape
  }),
  dateOfMarriage: createDateFieldSchema({
    requiredError: 'Start date is required',
    futureError: 'Start date cannot be in the future',
  }),
  timeOfMarriage: z.preprocess((val) => {
    if (val instanceof Date) {
      // If it's already a Date object, return it directly
      return val
    }

    if (typeof val === 'string' && val.trim() !== '') {
      const [hours, minutes] = val.split(':')
      const date = new Date() // Use current date
      date.setHours(Number(hours), Number(minutes), 0, 0)
      return date
    }

    // If no valid input, return current timestamp
    return new Date()
  }, createDateFieldSchema({
    requiredError: 'Start date is required',
    futureError: 'Start date cannot be in the future',
  }),),

  // Witnesses
  husbandWitnesses: z.array(z.object({
    name: z.string(),
    // Signature removed
  })),
  wifeWitnesses: z.array(z.object({
    name: z.string(),
    // Signature removed
  })),

  // Contracting Parties
  husbandContractParty: z.object({
    // Signature removed
    agreement: z.boolean().optional()
  }),

  wifeContractParty: z.object({
    // Signature removed
    agreement: z.boolean().optional()
  }),
  

  // Marriage License Details
  marriageLicenseDetails: z.object({
    licenseNumber: z.string(),
    dateIssued: createDateFieldSchema({
      requiredError: 'Start date is required',
      futureError: 'Start date cannot be in the future',
    }),
    placeIssued: z.string(),
    marriageAgreement: z.boolean()
  }),

  // Marriage Article
  marriageArticle: z.object({
    article: z.string(),
    marriageArticle: z.boolean()
  }),

  // Marriage Settlement
  marriageSettlement: z.boolean(),
  executiveOrderApplied: z.boolean().optional(),
  // Solemnizing Officer
  solemnizingOfficer: z.object({
    name: z.string(),
    position: z.string(),
    // Signature removed
    registryNoExpiryDate: z.string()
  }),

  // Registered at Civil Registrar
  preparedBy: processingDetailsSchema.shape.preparedBy,
  receivedBy: processingDetailsSchema.shape.receivedBy,
  registeredByOffice: processingDetailsSchema.shape.registeredBy,

  pagination: paginationSchema.optional(),

  // Optional Sections
  remarks: z.string().optional(),

  //*****BACK PAGE ***************************************** //
  affidavitOfSolemnizingOfficer: affidavitOfSolemnizingOfficerSchema,

  affidavitForDelayed: affidavitForDelayedSchema.optional(),


})

// Export the TypeScript type for the form values
export type MarriageCertificateFormValues = z.infer<
  typeof marriageCertificateSchema
>


export interface MarriageCertificateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
}