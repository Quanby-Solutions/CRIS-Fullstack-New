import { string, z } from 'zod';
import {
  citizenshipSchema,
  cityMunicipalitySchema,
  nameSchema,
  paginationSchema,
  processingDetailsSchema,
  provinceSchema, // Factory function: provinceSchema(isOptional: boolean)
  registryNumberSchema,
  residenceSchema,
} from './form-certificates-shared-schema';

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
});

//signature
const signatureSchema = z.object({
  signature: z.any(),
  name: nameSchema.optional(),
  name2: z.string().optional(),
  position: z.any().optional()
});



const residenceSchemas = z.object({
  st: z.string().optional(),
  barangay: z.string().optional(),
  cityMunicipality: cityMunicipalitySchema, // Reuse shared city/municipality schema
  province: provinceSchema, // Reuse shared province schema
  country: z.string().nonempty('Country is required').optional(),
});


//*****BACK PAGE ***************************************** //
//*****BACK PAGE ***************************************** //
const affidavitOfSolemnizingOfficerSchema = z.object({
  administeringInformation: z.object({
    nameOfOfficer: z.string().min(1, 'Name of officer is required'),
    signatureOfOfficer: z.any().optional(),
    position: z.string().min(1, 'Position/Title/Designation is required'),
    addressOfOffice: residenceSchemas
  }),
  nameOfPlace: z.string().min(1, 'Name of place is required'),
  addressAt: z.string().min(1, 'Address at is required'),
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
    dayOf: z.date(),
    atPlaceOfMarriage: residenceSchemas,
  }),
  dateSworn: z.object({
    dayOf: z.date(),
    atPlaceOfSworn: residenceSchemas,
    ctcInfo: z.object({
      number: z.string().min(1, 'CTC number is required'),
      dateIssued: z.date(),
      placeIssued: z.string().min(1, 'Place issued is required'),
    }),
  }),
  nameOfAdmin: z.object({
    signature: signatureSchema,
    address: z.string().min(1, 'Address is required')
  })
})

const affidavitForDelayedSchema = z.object({
  delayedRegistration: z.enum(['Yes', 'No',]).default('No'),
  administeringInformation: z.object({
    nameOfOfficer: z.string().optional(),
    signatureOfAdmin: z.any().optional(),
    position: z.string().min(1, 'Position/Title/Designation is required'),
    addressOfOfficer: residenceSchemas
  }),
  applicantInformation: z.object({
    signatureOfApplicant: z.any().optional(),
    nameOfApplicant: z.string().optional(),
    applicantAddress: residenceSchemas,
    postalCode: z
      .string()
      .min(4, 'Postal code must be at least 4 digits')
      .max(6, 'Postal code must be at most 6 digits')
      .regex(/^\d+$/, 'Postal code must contain only numbers')
  }),

  a: z.object({
    a: z.object({
      agreement: z.boolean().default(false),
      nameOfPartner: z.object({
        first: z.string().optional(),
        middle: z.string().optional(), // Middle name can be optional
        last: z.string().optional(),
      }),
      placeOfMarriage: z.string().min(1, 'Place of marriage is required').optional(),
      dateOfMarriage: z.date().optional(),
    }),
    b: z.object({
      agreement: z.boolean().default(false),
      nameOfHusband: z.object({
        first: z.string().optional(),
        middle: z.string().optional(), // Middle name can be optional
        last: z.string().optional(),
      }),
      nameOfWife: z.object({
        first: z.string().optional(),
        middle: z.string().optional(), // Middle name can be optional
        last: z.string().optional(),
      }),
      placeOfMarriage: z.string().min(1, 'Place of marriage is required').optional(),
      dateOfMarriage: z.date().optional(),
    }),
  }).refine((data) => {
    // Ensure only one agreement is true at a time
    return data.a.agreement !== data.b.agreement;
  }, 'You can only select one option (either a or b)'),

  b: z.object({
    solemnizedBy: z.string().min(1, 'Name of officer is required'),
    sector: z.enum([
      'religious-ceremony',
      'civil-ceremony',
      'Muslim-rites',
      'tribal-rites',
    ]),
  }),
  c: z.object({
    a: z.object({
      licenseNo: z.string().min(1, 'License number is required'),
      dateIssued: z.date(),
      placeOfSolemnizedMarriage: z.string().min(1, 'Place of Solemnized marriage'),
    }),
    b: z.object({
      underArticle: z.string().optional()
    })
  }),
  d: z.object({
    husbandCitizenship: citizenshipSchema,
    wifeCitizenship: citizenshipSchema
  }),
  e: z.string().nonempty('Add valid reason'),
  f: z.object({
    date: z.date().optional(),
    place: residenceSchemas
  }),
  dateSworn: z.object({
    dayOf: z.date(),
    atPlaceOfSworn: residenceSchemas,
    ctcInfo: z.object({
      number: z.string().min(1, 'CTC number is required'),
      dateIssued: z.date(),
      placeIssued: z.string().min(1, 'Place issued is required'),
    }),
  }),
})

/**
 * Main Marriage Certificate Schema
 */
export const marriageCertificateSchema = z.object({
  // Registry Information
  // Registry Information
  registryNumber: registryNumberSchema,
  province: provinceSchema,
  cityMunicipality: cityMunicipalitySchema,
  contractDay: z.date(),

  // Husband Information
  husbandName: nameSchema,
  husbandAge: z.number().int(),
  husbandBirth: z.date(),
  husbandPlaceOfBirth: locationSchema,
  husbandSex: z.enum(['Male', 'Female']),
  husbandCitizenship: z.string(),
  husbandResidence: z.string(),
  husbandReligion: z.string(),
  husbandCivilStatus: z.enum(['Single', 'Widowed', 'Divorced']),
  husbandConsentPerson: z.object({
    name: nameSchema,
    relationship: z.string(),
    residence: z.string()
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
  wifeBirth: z.date(),
  wifePlaceOfBirth: locationSchema,
  wifeSex: z.enum(['Female']),
  wifeCitizenship: z.string(),
  wifeResidence: z.string(),
  wifeReligion: z.string(),
  wifeCivilStatus: z.enum(['Single', 'Widowed', 'Divorced']),
  wifeConsentPerson: z.object({
    name: nameSchema,
    relationship: z.string(),
    residence: z.string()
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
  dateOfMarriage: z.date(),
  timeOfMarriage: z.preprocess((val) => {
    if (val instanceof Date) {
      // If it's already a Date object, return it directly
      return val;
    }

    if (typeof val === 'string' && val.trim() !== '') {
      const [hours, minutes] = val.split(':');
      const date = new Date(); // Use current date
      date.setHours(Number(hours), Number(minutes), 0, 0);
      return date;
    }

    // If no valid input, return current timestamp
    return new Date();
  }, z.date({ required_error: 'Time of marriage is required' })),

  // Witnesses
  husbandWitnesses: z.array(z.object({
    name: z.string(),
    signature: z.any()
  })),
  wifeWitnesses: z.array(z.object({
    name: z.string(),
    signature: z.any()
  })),

  // Contracting Parties
  husbandContractParty: z.object({
    signature: z.any(),
    agreement: z.boolean()
  }),

  wifeContractParty: z.object({
    signature: z.any(),
    agreement: z.boolean()
  }),

  // Marriage License Details
  marriageLicenseDetails: z.object({
    licensenumber: z.string(),
    dateIssued: z.date(),
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
    signature: z.any(),
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


});

// Export the TypeScript type for the form values
export type MarriageCertificateFormValues = z.infer<
  typeof marriageCertificateSchema
>;


export interface MarriageCertificateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}
