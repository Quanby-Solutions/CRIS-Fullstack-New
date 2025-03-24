import { z } from 'zod';
import {
  cityMunicipalitySchema,
  createDateFieldSchema,
  nameSchema,
  nameSchemaOptional,
  paginationSchema,
  parentInfoSchema,
  placeOfDeathSchema,
  processingDetailsSchema,
  provinceSchema,
  registryNumberSchema,
  remarksAnnotationsSchema,
  residenceSchemaOptional,
} from './form-certificates-shared-schema';

// --- Deceased Information Schema ---
const deceasedInformationSchema = z.object({
  // Personal Information
  name: nameSchema.optional(),
  sex: z
    .preprocess(
      (val) => (val === '' ? undefined : val),
      z.union([z.enum(['Male', 'Female']), z.undefined()])
    )
    .optional(),
  dateOfDeath: createDateFieldSchema({
    requiredError: 'Date of death is required',
    futureError: 'Date of death cannot be in the future',
  }).optional(),
  timeOfDeath: z.date().optional(),

  dateOfBirth: createDateFieldSchema({
    requiredError: 'Date of birth is required',
    futureError: 'Date of birth cannot be in the future',
  }).optional(),
  ageAtDeath: z.object({
    years: z.string().optional(),
    months: z.string().optional(),
    days: z.string().optional(),
    hours: z.string().optional(),
  }).optional(),
  placeOfDeath: placeOfDeathSchema.optional(),
  civilStatus: z.string().optional(),

  religion: z.string().optional(),
  citizenship: z.string().optional(),
  residence: residenceSchemaOptional.optional(),
  occupation: z.string().optional(),
  nameOfFather: nameSchemaOptional.optional(),
  nameOfMother: nameSchemaOptional.optional(),
  // Birth Information
  birthInformation: z.object({
    ageOfMother: z.string().optional(),
    methodOfDelivery: z
      .string()
      .default('Normal spontaneous vertex')
      .optional(),
    lengthOfPregnancy: z.number().optional(),
    typeOfBirth: z
      .enum(['Single', 'Twin', 'Triplet'])
      .default('Single')
      .optional(),
    birthOrder: z
      .enum(['First', 'Second', 'Third', 'Fourth', 'Fifth'])
      .optional(),
  }).optional(),
});

// --- Medical Certificate Schema ---
const medicalCertificateSchema = z.object({
  // Causes of death – choose infant or standard details.
  // For infant deaths, the object must contain the property "mainDiseaseOfInfant".
  causesOfDeath: z.union([
    // Infant-style cause of death
    z.object({
      mainDiseaseOfInfant: z.string().optional(),
      otherDiseasesOfInfant: z.string().optional(),
      mainMaternalDisease: z.string().optional(),
      otherMaternalDisease: z.string().optional(),
      otherRelevantCircumstances: z.string().optional(),
    }),
    // Standard cause of death
    z.object({
      immediate: z.object({
        cause: z.string().optional(),
        interval: z.string().optional(),
      }).optional(),
      antecedent: z.object({
        cause: z.string().optional(),
        interval: z.string().optional(),
      }).optional(),
      underlying: z.object({
        cause: z.string().optional(),
        interval: z.string().optional(),
      }).optional(),
      otherSignificantConditions: z.string().optional(),
    }),
  ]).optional(),

  // Maternal condition (optional)
  maternalCondition: z
    .object({
      pregnantNotInLabor: z.boolean().optional(),
      pregnantInLabor: z.boolean().optional(),
      lessThan42Days: z.boolean().optional(),
      daysTo1Year: z.boolean().optional(),
      noneOfTheAbove: z.boolean().optional(),
    })
    .optional(),

  // External causes (optional)
  externalCauses: z.object({
    mannerOfDeath: z.string().optional(),
    placeOfOccurrence: z.string().optional(),
  }).optional(),

  // Attendant details (ENUM approach)
  attendant: z
    .object({
      type: z
        .preprocess(
          (val) => (val === '' ? undefined : val),
          z
            .enum([
              'Private physician',
              'Public health officer',
              'Hospital authority',
              'None',
              'Others',
            ])
            .optional()
        )
        .optional(),
      othersSpecify: z.string().optional(),
      duration: z
        .object({
          from: createDateFieldSchema({
            requiredError: 'Start date is required',
            futureError: 'Start date cannot be in the future',
          }).optional(),
          to: createDateFieldSchema({
            requiredError: 'End date is required',
            futureError: 'End date cannot be in the future',
          }).optional(),
        })
        .optional(),
      certification: z
        .object({
          time: z.preprocess((val) => {
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
          }),).optional(),
          name: z.string().optional(),
          title: z.string().optional(),
          address: residenceSchemaOptional.optional(),
          date: createDateFieldSchema({
            requiredError: 'Certification date is required',
            futureError: 'Certification date cannot be in the future',
          }).optional(),
        })
        .optional(),
    })
    .optional(),

  autopsy: z.boolean().default(false).optional(),
});

// --- Certification of Death Schema ---
const certificationOfDeathSchema = z.object({
  hasAttended: z.boolean().optional(),
  nameInPrint: z.string().optional(),
  titleOfPosition: z.string().optional(),
  address: z.string().optional(),
  date: createDateFieldSchema({
    requiredError: 'Certification date is required',
    futureError: 'Certification date cannot be in the future',
  }).optional(),
  reviewedBy: z.object({
    date: createDateFieldSchema({
      requiredError: 'Certification date is required',
      futureError: 'Certification date cannot be in the future',
    }).optional(),
    healthOfficerNameInPrint: z.string().optional(),
  }).optional(),
});

// --- Review Schema ---
const reviewSchema = z.object({
  date: createDateFieldSchema({
    requiredError: 'Review date is required',
    futureError: 'Review date cannot be in the future',
  }).optional(),
});

// --- Certificates Schemas ---
// Simple optional schema for postmortem certificate
const postmortemCertificateSchema = z
  .object({
    causeOfDeath: z.string().optional(),
    nameInPrint: z.string().optional(),
    date: createDateFieldSchema({
      requiredError: 'Postmortem date is required',
      futureError: 'Postmortem date cannot be in the future',
    }).optional(),
    titleDesignation: z.string().optional(),
    address: z.string().optional(),
  })
  .optional();

// Replace the current embalmerCertificationSchema with this:
const embalmerCertificationSchema = z
  .object({
    nameOfDeceased: z.string().optional(),
    nameInPrint: z.string().optional(),
    address: z.string().optional(),
    titleDesignation: z.string().optional(),
    licenseNo: z.string().optional(),
    issuedOn: z.date().optional(),
    issuedAt: z.string().optional(),
    expiryDate: z.date().optional(),
  })
  .optional();

const delayedRegistrationSchema = z.object({
  isDelayed: z.boolean().optional(),
  affiant: z.object({
    name: z.string().optional(),
    civilStatus: z.string().optional(),
    residenceAddress: z.string().optional(),
    age: z.string().optional(),
  }).optional(),
  deceased: z.object({
    name: z.string().optional(),
    dateOfDeath: createDateFieldSchema({
      requiredError: "Date of burial is required",
      futureError: "Date of burial cannot be in the future",
    }).optional(),
    placeOfDeath: z.string().optional(),
    burialInfo: z.object({
      date: createDateFieldSchema({
        requiredError: "Date of burial is required",
        futureError: "Date of burial cannot be in the future",
      }).optional(),
      place: z.string().optional(),
      method: z.string().optional(),
    }).optional(),
  }).optional(),
  attendance: z.object({
    wasAttended: z.boolean().optional(),
    attendedBy: z.string().optional(),
  }).optional(),
  causeOfDeath: z.string().optional(),
  reasonForDelay: z.string().optional(),
  affidavitDate: createDateFieldSchema({
    requiredError: "Date of burial is required",
    futureError: "Date of burial cannot be in the future",
  }).optional(),
  affidavitDatePlace: z.string().optional(),
  adminOfficer: z.string().optional(),
  ctcInfo: z.object({
    number: z.string().optional(),
    issuedOn: createDateFieldSchema({
      requiredError: "Date of burial is required",
      futureError: "Date of burial cannot be in the future",
    }).optional(),
    issuedAt: z.string().optional(),
  }).optional(),
}).optional();

// --- Disposal Information Schema ---
const disposalInformationSchema = z.object({

  corpseDisposal: z.string().optional(),
  burialPermit: z.object({
    number: z.string().optional(),
    dateIssued: createDateFieldSchema({
      requiredError: 'Date of death is required',
      futureError: 'Date of death cannot be in the future',
    }).optional(),
  }).optional(),
  transferPermit: z
    .object({
      number: z.string().optional(),
      dateIssued: createDateFieldSchema({
        requiredError: 'Burial permit date is required',
        futureError: 'Burial permit date cannot be in the future',
      }).optional(),
    })
    .optional(),
  cemeteryOrCrematory: z.object({
    name: z.string().optional(),
    address: residenceSchemaOptional.optional(),
  }).optional(),
});

// --- Informant Schema ---
const informantSchema = z.object({
  nameInPrint: z.string().optional(),
  relationshipToDeceased: z.string().optional(),
  address: z.string().optional(),
  date: createDateFieldSchema({
    requiredError: 'Informant date is required',
    futureError: 'Informant date cannot be in the future',
  }).optional(),
});

// --- Section 19a: Causes of Death for Infants ---
export const causesOfDeath19aSchema = z.object({
  mainDiseaseOfInfant: z.string().optional(),
  otherDiseasesOfInfant: z.string().optional(),
  mainMaternalDisease: z.string().optional(),
  otherMaternalDisease: z.string().optional(),
  otherRelevantCircumstances: z.string().optional(),
});

// --- Section 19b: Causes of Death (8 days and over) ---
const causesOfDeath19bSchema = z.object({
  immediate: z.object({
    cause: z.string().optional(),
    interval: z.string().optional(),
  }).optional(),
  antecedent: z.object({
    cause: z.string().optional(),
    interval: z.string().optional(),
  }).optional(),
  underlying: z.object({
    cause: z.string().optional(),
    interval: z.string().optional(),
  }).optional(),
  otherSignificantConditions: z.string().optional(),
});

// --- Main Death Certificate Schema ---
export const deathCertificateFormSchema = z
  .object({
    id: z.string().optional(),
    // Header Information
    registryNumber: registryNumberSchema.optional(),
    province: provinceSchema.optional(),
    cityMunicipality: cityMunicipalitySchema.optional(),

    // Deceased Information
    ...deceasedInformationSchema.shape,

    // Parent Information
    parents: parentInfoSchema.optional(),

    // Causes of death 19a
    causesOfDeath19a: causesOfDeath19aSchema.optional(),

    // Causes of Death 19b
    causesOfDeath19b: causesOfDeath19bSchema.optional(),

    // Medical Certificate
    medicalCertificate: medicalCertificateSchema.optional(),

    // Certification of Death
    certificationOfDeath: certificationOfDeathSchema.optional(),

    // Review
    reviewedBy: reviewSchema.optional(),

    // Certificates
    postmortemCertificate: postmortemCertificateSchema.optional(),
    embalmerCertification: embalmerCertificationSchema.optional(),
    delayedRegistration: delayedRegistrationSchema.optional(),

    // Disposal Information
    ...disposalInformationSchema.shape,

    // Informant
    informant: informantSchema.optional(),

    // Processing Information
    preparedBy: processingDetailsSchema.shape.preparedBy.optional(),
    receivedBy: processingDetailsSchema.shape.receivedBy.optional(),
    registeredByOffice: processingDetailsSchema.shape.registeredBy.optional(),

    // Additional Remarks
    remarks: remarksAnnotationsSchema.optional(),
    pagination: paginationSchema.optional(),

    // Also include corpseDisposal in the main schema (if not already)
    corpseDisposal: z
      .preprocess(
        (val) => (val === '' ? undefined : val),
        z.union([z.enum(['Burial', 'Cremation', 'Embalming']), z.undefined()])
      )
      .optional(),
  });

// Export the Type
export type DeathCertificateFormValues = z.infer<
  typeof deathCertificateFormSchema
>;

// Props interface (optional)
export interface DeathCertificateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}