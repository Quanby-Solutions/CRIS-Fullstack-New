import { z } from 'zod';
import {
  citizenshipSchema,
  cityMunicipalitySchema,
  createDateFieldSchema,
  nameSchema,
  paginationSchema,
  parentInfoSchema,
  placeOfDeathSchema,
  processingDetailsSchema,
  provinceSchema,
  registryNumberSchema,
  religionSchema,
  remarksAnnotationsSchema,
  residenceSchema,
} from './form-certificates-shared-schema';

// --- Deceased Information Schema ---
const deceasedInformationSchema = z.object({
  // Personal Information
  name: nameSchema,
  sex: z
    .preprocess(
      (val) => (val === '' ? undefined : val),
      z.union([z.enum(['Male', 'Female']), z.undefined()])
    )
    .superRefine((val, ctx) => {
      if (val === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sex is required',
        });
      }
    }),
  dateOfDeath: createDateFieldSchema({
    requiredError: 'Date of death is required',
    futureError: 'Date of death cannot be in the future',
  }),
  timeOfDeath: z.preprocess((val) => {
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

  dateOfBirth: createDateFieldSchema({
    requiredError: 'Date of birth is required',
    futureError: 'Date of birth cannot be in the future',
  }),
  ageAtDeath: z.object({
    years: z.string().optional(),
    months: z.string().optional(),
    days: z.string().optional(),
    hours: z.string().optional(),
  }),
  placeOfDeath: placeOfDeathSchema,
  civilStatus: z
    .preprocess(
      (val) => (val === '' ? undefined : val),
      z
        .enum(['Single', 'Married', 'Widow', 'Widower', 'Annulled', 'Divorced'])
        .optional()
    )
    .superRefine((val, ctx) => {
      if (val === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Civil status is required',
        });
      }
    }),

  religion: religionSchema,
  citizenship: citizenshipSchema,
  residence: residenceSchema,
  occupation: z.string().nonempty('Occupation is required'),

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
  }),
});

// --- Medical Certificate Schema ---
const medicalCertificateSchema = z.object({
  // Causes of death – choose infant or standard details.
  // For infant deaths, the object must contain the property "mainDiseaseOfInfant".
  causesOfDeath: z.union([
    // Infant-style cause of death
    z.object({
      mainDiseaseOfInfant: z
        .string()
        .nonempty('Main disease/condition is required'),
      otherDiseasesOfInfant: z.string().optional(),
      mainMaternalDisease: z.string().optional(),
      otherMaternalDisease: z.string().optional(),
      otherRelevantCircumstances: z.string().optional(),
    }),
    // Standard cause of death
    z.object({
      immediate: z.object({
        cause: z.string().nonempty('Immediate cause is required'),
        interval: z.string().nonempty('Interval is required'),
      }),
      antecedent: z.object({
        cause: z.string().optional(),
        interval: z.string().optional(),
      }),
      underlying: z.object({
        cause: z.string().optional(),
        interval: z.string().optional(),
      }),
      otherSignificantConditions: z.string().optional(),
    }),
  ]),

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
  }),

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
        .superRefine((val, ctx) => {
          if (val === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Please select an attendant type',
            });
          }
        }),
      othersSpecify: z.string().optional(),
      duration: z
        .object({
          from: createDateFieldSchema({
            requiredError: 'Start date is required',
            futureError: 'Start date cannot be in the future',
          }),
          to: createDateFieldSchema({
            requiredError: 'End date is required',
            futureError: 'End date cannot be in the future',
          }),
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
          }),),
          name: z.string().nonempty('Attendant name is required'),
          title: z.string().nonempty('Attendant title is required'),
          address: residenceSchema,
          date: createDateFieldSchema({
            requiredError: 'Certification date is required',
            futureError: 'Certification date cannot be in the future',
          }),
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === 'Others' && !data.othersSpecify) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please specify the other attendant type',
          path: ['othersSpecify'],
        });
      }
      if (data.type !== 'None' && data.type !== undefined) {
        if (!data.duration || !data.duration.from || !data.duration.to) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please provide the duration for the selected attendant',
            path: ['duration'],
          });
        }
      }
      if (
        data.duration?.from &&
        data.duration?.to &&
        new Date(data.duration.to) < new Date(data.duration.from)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be after start date',
          path: ['duration', 'to'],
        });
      }
    }),

  autopsy: z.boolean().default(false),
});

// --- Certification of Death Schema ---
const certificationOfDeathSchema = z.object({
  hasAttended: z.boolean(),
  nameInPrint: z.string().nonempty('Name is required'),
  titleOfPosition: z.string().nonempty('Title/Position is required'),
  address: residenceSchema,
  date: createDateFieldSchema({
    requiredError: 'Certification date is required',
    futureError: 'Certification date cannot be in the future',
  }),
  healthOfficerNameInPrint: z
    .string()
    .nonempty('Health officer name is required'),
});

// --- Review Schema ---
const reviewSchema = z.object({
  date: createDateFieldSchema({
    requiredError: 'Review date is required',
    futureError: 'Review date cannot be in the future',
  }),
});

// --- Certificates Schemas ---
const postmortemCertificateSchema = z
  .object({
    causeOfDeath: z.string().nonempty('Cause of death is required'),
    nameInPrint: z.string().nonempty('Name is required'),
    date: createDateFieldSchema({
      requiredError: 'Postmortem date is required',
      futureError: 'Postmortem date cannot be in the future',
    }),
    titleDesignation: z.string().nonempty('Title/Designation is required'),
    address: z.string().nonempty('Address is required'),
  })
  .optional();

const embalmerCertificationSchema = z
  .object({
    nameOfDeceased: z.string().nonempty('Name of deceased is required'),
    nameInPrint: z.string().nonempty('Name is required'),
    address: z.string().nonempty('Address is required'),
    titleDesignation: z.string().nonempty('Title/Designation is required'),
    licenseNo: z.string().nonempty('License number is required'),
    issuedOn: createDateFieldSchema({
      requiredError: 'Date of death is required',
      futureError: 'Date of death cannot be in the future',
    }),
    issuedAt: z.string().nonempty('Issue location is required'),
    expiryDate: createDateFieldSchema({
      requiredError: 'Date of death is required',
      futureError: 'Date of death cannot be in the future',
    }),
  })
  .optional();

// const delayedRegistrationSchema = z.discriminatedUnion('isDelayed', [
//   // Case when registration is NOT delayed – fields are not required.
//   z.object({
//     isDelayed: z.literal(false),
//     // Optionally, you could allow an empty object or minimal fields.
//   }),
//   // Case when registration is delayed – all fields are required.
//   z.object({
//     isDelayed: z.literal(true),
//     affiant: z.object({
//       name: z.string().nonempty('Name is required'),
//       civilStatus: z.enum([
//         'Single',
//         'Married',
//         'Divorced',
//         'Widow',
//         'Widower',
//       ]),
//       residenceAddress: z.string().nonempty('Address is required'),
//       age: z.string().optional(),
//     }),
//     deceased: z.object({
//       name: z.string().nonempty('Name is required'),
//       dateOfDeath: createDateFieldSchema({
//         requiredError: 'Date of death is required',
//         futureError: 'Date of death cannot be in the future',
//       }),
//       placeOfDeath: z.string().nonempty('Place of death is required'),
//       burialInfo: z.object({
//         date: createDateFieldSchema({
//           requiredError: 'Date of burial is required',
//           futureError: 'Date of burial cannot be in the future',
//         }),
//         place: z.string().nonempty('Burial place is required'),
//         method: z.enum(['Buried', 'Cremated']).optional(),
//       }),
//     }),
//     attendance: z.object({
//       wasAttended: z.boolean(),
//       attendedBy: z.string().optional(),
//     }),
//     causeOfDeath: z.string().nonempty('Cause of death is required'),
//     reasonForDelay: z.string().nonempty('Reason for delay is required'),
//     affidavitDate: createDateFieldSchema({
//       requiredError: 'Affidavit date is required',
//       futureError: 'Affidavit date cannot be in the future',
//     }),
//     affidavitDatePlace: z.string().nonempty('Affidavit place is required'),
//     adminOfficer: z.string().nonempty('Position is required'),

//     ctcInfo: z.object({
//       number: z.string().nonempty('CTC number is required'),
//       issuedOn: createDateFieldSchema({
//         requiredError: 'Date issued is required',
//         futureError: 'Date issued cannot be in the future',
//       }),
//       issuedAt: z.string().nonempty('Place issued is required'),
//     }),
//   }),
// ]);

const delayedRegistrationSchema = z.object({
  isDelayed: z.boolean(),
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
}).refine(
  (data) => {
    // If isDelayed is true, validate that all required fields are present
    if (data.isDelayed) {
      return !!(
        data.affiant?.name &&
        data.affiant?.residenceAddress &&
        data.deceased?.name &&
        data.causeOfDeath &&
        data.reasonForDelay &&
        data.affidavitDatePlace &&
        data.adminOfficer &&
        data.ctcInfo?.number &&
        data.ctcInfo?.issuedAt
      );
    }
    return true;
  },
  {
    message: "All required fields must be filled when delayed registration is true",
    path: ["isDelayed"]
  }
);

// --- Disposal Information Schema ---
const disposalInformationSchema = z.object({
  corpseDisposal: z.string().nonempty('Corpse disposal method is required'),
  burialPermit: z.object({
    number: z.string().nonempty('Permit number is required'),
    dateIssued: createDateFieldSchema({
      requiredError: 'Date of death is required',
      futureError: 'Date of death cannot be in the future',
    }),
  }),
  transferPermit: z
    .object({
      number: z.string().optional(),
      dateIssued: createDateFieldSchema({
        requiredError: 'Burial permit date is required',
        futureError: 'Burial permit date cannot be in the future',
      }),
    })
    .optional(),
  cemeteryOrCrematory: z.object({
    name: z.string().nonempty('Name is required'),
    address: residenceSchema,
  }),
});

// --- Informant Schema ---
const informantSchema = z.object({
  nameInPrint: z.string().nonempty('Name is required'),
  relationshipToDeceased: z.string().nonempty('Relationship is required'),
  address: residenceSchema,
  date: createDateFieldSchema({
    requiredError: 'Informant date is required',
    futureError: 'Informant date cannot be in the future',
  }),
});

// --- Section 19a: Causes of Death for Infants ---
export const causesOfDeath19aSchema = z.object({
  mainDiseaseOfInfant: z
    .string()
    .nonempty('Main disease/condition is required'),
  otherDiseasesOfInfant: z.string().optional(),
  mainMaternalDisease: z.string().optional(),
  otherMaternalDisease: z.string().optional(),
  otherRelevantCircumstances: z.string().optional(),
});

// --- Section 19b: Causes of Death (8 days and over) ---
const causesOfDeath19bSchema = z.object({
  immediate: z.object({
    cause: z.string().nonempty('Immediate cause is required'),
    interval: z.string().nonempty('Interval is required'),
  }),
  antecedent: z.object({
    cause: z.string().optional(),
    interval: z.string().optional(),
  }),
  underlying: z.object({
    cause: z.string().optional(),
    interval: z.string().optional(),
  }),
  otherSignificantConditions: z.string().optional(),
});

// --- Main Death Certificate Schema ---
export const deathCertificateFormSchema = z
  .object({

    id: z.string().optional(),
    // Header Information
    registryNumber: registryNumberSchema,
    province: provinceSchema,
    cityMunicipality: cityMunicipalitySchema,

    // Deceased Information
    ...deceasedInformationSchema.shape,

    // Parent Information
    parents: parentInfoSchema,

    //causes of death 19a
    causesOfDeath19a: causesOfDeath19aSchema,

    // Causes of Death 19b
    causesOfDeath19b: causesOfDeath19bSchema,

    // Medical Certificate
    medicalCertificate: medicalCertificateSchema,

    // Certification of Death
    certificationOfDeath: certificationOfDeathSchema,

    // Review
    reviewedBy: reviewSchema,

    // Certificates
    postmortemCertificate: postmortemCertificateSchema,
    embalmerCertification: embalmerCertificationSchema,
    delayedRegistration: delayedRegistrationSchema.optional(),

    // Disposal Information
    ...disposalInformationSchema.shape,

    // Informant
    informant: informantSchema,

    // Processing Information
    preparedBy: processingDetailsSchema.shape.preparedBy,
    receivedBy: processingDetailsSchema.shape.receivedBy,
    registeredByOffice: processingDetailsSchema.shape.registeredBy,

    // Additional Remarks
    remarks: remarksAnnotationsSchema,
    pagination: paginationSchema.optional(),

    // Also include corpseDisposal in the main schema (if not already)
    corpseDisposal: z.string().nonempty('Corpse disposal method is required'),
  })
  .superRefine((data, ctx) => {
    // 1. If the deceased is an infant (ageAtDeath.days ≤ 7),
    // then the infant-style causes (Section 19a) must be provided.
    if (data.ageAtDeath.days && parseInt(data.ageAtDeath.days) <= 7) {
      const causes = data.medicalCertificate.causesOfDeath;
      if (!('mainDiseaseOfInfant' in causes)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Infant cause-of-death details are required for deaths within 7 days of birth',
          path: ['medicalCertificate', 'causesOfDeath'],
        });
      }
    }

    // 2. For females of reproductive age (15-49), maternal condition is required.
    if (data.sex === 'Female' && data.ageAtDeath.years) {
      const age = parseInt(data.ageAtDeath.years);
      if (
        age >= 15 &&
        age <= 49 &&
        !data.medicalCertificate.maternalCondition
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Maternal condition is required for females aged 15-49',
          path: ['medicalCertificate', 'maternalCondition'],
        });
      }
    }

    // 3. If autopsy is performed, a postmortem certificate must be provided.
    if (data.medicalCertificate.autopsy && !data.postmortemCertificate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Postmortem certificate is required when autopsy is performed',
        path: ['postmortemCertificate'],
      });
    }

    // 4. If burial location differs from place of death, a transfer permit is required.
    if (
      data.placeOfDeath.cityMunicipality !==
      data.cemeteryOrCrematory.address.cityMunicipality &&
      !data.transferPermit
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Transfer permit is required when burial location differs from place of death',
        path: ['transferPermit'],
      });
    }

    // 5. **New:** If the corpse disposal method is "Embalming", then the embalmer certification must be provided.
    if (data.corpseDisposal === 'Embalming') {
      if (!data.embalmerCertification) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Embalmer certification is required for embalming',
          path: ['embalmerCertification'],
        });
      } else {
        // You can add further checks for specific required fields.
        const requiredFields: Array<keyof typeof data.embalmerCertification> = [
          'nameInPrint',
          'licenseNo',
          'issuedOn',
          'issuedAt',
          'expiryDate',
        ];
        requiredFields.forEach((field) => {
          if (!data.embalmerCertification![field]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${field} is required for embalmer certification`,
              path: ['embalmerCertification', field],
            });
          }
        });
      }
    }
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
