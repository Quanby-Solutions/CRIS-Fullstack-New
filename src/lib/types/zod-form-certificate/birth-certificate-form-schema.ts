import { z } from 'zod';
import {
  citizenshipSchema,
  cityMunicipalitySchema,
  createDateFieldSchema,
  nameSchema,
  paginationSchema,
  processingDetailsSchema,
  provinceSchema,
  registryNumberSchema,
  religionSchema,
  remarksAnnotationsSchema,
  residenceSchema,
} from './form-certificates-shared-schema';

// Helper: Preprocess any string (or Date) into a Date object.
const datePreprocessor = z.preprocess(
  (arg) =>
    typeof arg === 'string' || arg instanceof Date ? new Date(arg) : arg,
  z.date({ required_error: 'Date is required' })
);

// Helper: Wraps an existing date field schema with preprocessing.
const createDateFieldSchemaWithPreprocess = (options: {
  requiredError: string;
  futureError: string;
}) =>
  z.preprocess(
    (arg) =>
      typeof arg === 'string' || arg instanceof Date ? new Date(arg) : arg,
    createDateFieldSchema(options)
  );

// Child Information Schema
const childInformationSchema = z
  .object({
    firstName: nameSchema.shape.first,
    middleName: nameSchema.shape.middle,
    lastName: nameSchema.shape.last,
    sex: z
      .preprocess((val) => (val === '' ? undefined : val), z.enum(['Male', 'Female']).optional())
      .refine((val) => val !== undefined, { message: 'Sex is required' }),
    dateOfBirth: createDateFieldSchemaWithPreprocess({
      requiredError: 'Date of birth is required',
      futureError: 'Birth date cannot be in the future',
    }),
    placeOfBirth: z.object({
      hospital: z.string().min(1, 'Hospital/Clinic/Institution name is required'),
      cityMunicipality: cityMunicipalitySchema,
      province: provinceSchema,
    }),
    typeOfBirth: z.string().optional(),
    multipleBirthOrder: z.string().optional(),
    birthOrder: z.string().min(1, 'Birth order is required'),
    weightAtBirth: z
      .string()
      .min(1, 'Weight at birth is required')
      .superRefine((weight, ctx) => {
        const num = parseFloat(weight);
        if (isNaN(num) || num <= 0 || num >= 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Weight must be a valid number between 0-10 kg',
          });
        }
      }),
  })
  .superRefine((data, ctx) => {
    if (data.typeOfBirth !== 'Single' && !data.multipleBirthOrder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Birth order is required for multiple births',
        path: ['multipleBirthOrder'],
      });
    }
  });

// Mother Information Schema
const motherInformationSchema = z
  .object({
    firstName: nameSchema.shape.first,
    middleName: nameSchema.shape.middle,
    lastName: nameSchema.shape.last,
    citizenship: citizenshipSchema,
    religion: religionSchema,
    occupation: z.string().min(1, 'Occupation is required'),
    age: z
      .string()
      .min(1, 'Age is required')
      .superRefine((age, ctx) => {
        const num = parseInt(age);
        if (isNaN(num) || num < 12 || num > 65) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mother's age must be between 12 and 65 years",
          });
        }
      }),
    totalChildrenBornAlive: z
      .string()
      .min(1, 'Required')
      .refine((val) => !isNaN(Number(val)), 'Must be a valid number')
      .refine((val) => Number(val) >= 0, 'Cannot be negative'),
    childrenStillLiving: z
      .string()
      .min(1, 'Required')
      .refine((val) => !isNaN(Number(val)), 'Must be a valid number')
      .refine((val) => Number(val) >= 0, 'Cannot be negative'),
    childrenNowDead: z
      .string()
      .min(1, 'Required')
      .refine((val) => !isNaN(Number(val)), 'Must be a valid number')
      .refine((val) => Number(val) >= 0, 'Cannot be negative'),
    residence: residenceSchema,
  })
  .superRefine((data, ctx) => {
    if (
      data.totalChildrenBornAlive.trim() !== '' &&
      data.childrenStillLiving.trim() !== '' &&
      data.childrenNowDead.trim() !== ''
    ) {
      const total = Number(data.totalChildrenBornAlive);
      const living = Number(data.childrenStillLiving);
      const dead = Number(data.childrenNowDead);
      if (total !== living + dead) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Total children born alive must equal sum of living and deceased children',
          path: ['totalChildrenBornAlive'],
        });
      }
    }
  });

// Father Information Schema
const fatherInformationSchema = z
  .object({
    firstName: nameSchema.shape.first,
    middleName: nameSchema.shape.middle,
    lastName: nameSchema.shape.last,
    citizenship: citizenshipSchema,
    religion: religionSchema,
    occupation: z.string().min(1, 'Occupation is required'),
    age: z
      .string()
      .min(1, 'Age is required')
      .superRefine((age, ctx) => {
        const num = parseInt(age);
        if (isNaN(num) || num < 12 || num > 95) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Father's age must be between 12 and 95 years",
          });
        }
      }),
    residence: residenceSchema,
  })
  .optional();

// Marriage Information Schema
const marriageDateSchema = z.union([
  createDateFieldSchemaWithPreprocess({
    requiredError: 'Marriage date is required',
    futureError: 'Marriage date cannot be in the future',
  }),
  z.literal("Not Married"),
  z.literal("Forgotten")
]);



const marriageInformationSchema = z
  .object({
    date: marriageDateSchema,
    place: residenceSchema,
  })
  .optional();


// Attendant Information Schema
const attendantInformationSchema = z.object({
  type: z
    .union([
      z.enum(['Physician', 'Nurse', 'Midwife', 'Hilot']),
      z.string().min(1, 'Custom attendant type is required'),
    ])
    .refine((val) => val !== undefined, { message: 'Attendant type is required' }),
  certification: z.object({
    time: z.preprocess((val) => {
      if (val == null || val === '') return undefined;
      if (typeof val === 'string') {
        // Assume time string is in HH:MM format.
        const [hours, minutes] = val.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes), 0, 0);
        return date;
      }
      return val;
    }, z.date({ required_error: 'Time is required' })),
    name: z.string().min(1, 'Name is required'),
    title: z.string().min(1, 'Title is required'),
    address: residenceSchema,
    date: createDateFieldSchemaWithPreprocess({
      requiredError: 'Certification date is required',
      futureError: 'Certification date cannot be in the future',
    }),
  }),
});

// Informant Schema
const informantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  address: residenceSchema,
  date: createDateFieldSchemaWithPreprocess({
    requiredError: 'Date is required',
    futureError: 'Informant date cannot be in the future',
  }),
});

// Affidavit of Paternity Schema
const affidavitOfPaternitySchema = z.object({
  father: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
  mother: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
  dateSworn: createDateFieldSchemaWithPreprocess({
    requiredError: 'Date sworn is required',
    futureError: 'Date cannot be in the future',
  }),
  adminOfficer: z.object({
    nameInPrint: z.string().min(1, 'Officer name is required'),
    titleOrPosition: z.string().min(1, 'Position is required'),
    address: residenceSchema,
  }),
  ctcInfo: z.object({
    number: z.string().min(1, 'CTC number is required'),
    dateIssued: createDateFieldSchemaWithPreprocess({
      requiredError: 'Date issued is required',
      futureError: 'Date cannot be in the future',
    }),
    placeIssued: z.string().min(1, 'Place issued is required'),
  }),
});

// Delayed Registration Affidavit Schema
const delayedRegistrationAffidavitSchema = z.object({
  affiant: z.object({
    name: z.string().min(1, 'Affiant name is required'),
    address: residenceSchema,
    civilStatus: z.string().min(1, 'Civil status is required'),
    citizenship: citizenshipSchema,
  }),
  registrationType: z.enum(['SELF', 'OTHER']),
  reasonForDelay: z.string().min(1, 'Reason for delay is required'),
  dateSworn: createDateFieldSchemaWithPreprocess({
    requiredError: 'Date sworn is required',
    futureError: 'Date cannot be in the future',
  }),
  adminOfficer: z.object({
    nameInPrint: z.string().min(1, 'Officer name is required'),
    titleOrPosition: z.string().min(1, 'Position is required'),
    address: residenceSchema,
  }),
  ctcInfo: z.object({
    number: z.string().min(1, 'CTC number is required'),
    dateIssued: createDateFieldSchemaWithPreprocess({
      requiredError: 'Date issued is required',
      futureError: 'Date cannot be in the future',
    }),
    placeIssued: z.string().min(1, 'Place issued is required'),
  }),
  parentMaritalStatus: z.enum(['MARRIED', 'NOT_MARRIED']).optional(),
});

// Main Birth Certificate Schema
export const birthCertificateFormSchema = z
  .object({
    registryNumber: registryNumberSchema,
    province: provinceSchema,
    cityMunicipality: cityMunicipalitySchema,
    childInfo: childInformationSchema,
    motherInfo: motherInformationSchema,
    fatherInfo: fatherInformationSchema,
    parentMarriage: marriageInformationSchema,
    attendant: attendantInformationSchema,
    informant: informantSchema,
    // Use the shared schema for preparedBy
    preparedBy: processingDetailsSchema.shape.preparedBy,
    // Override receivedBy and registeredByOffice with our date preprocessor.
    receivedBy: z.object({
      nameInPrint: processingDetailsSchema.shape.receivedBy.shape.nameInPrint,
      titleOrPosition: processingDetailsSchema.shape.receivedBy.shape.titleOrPosition,
      date: datePreprocessor,
    }),
    registeredByOffice: z.object({
      nameInPrint: processingDetailsSchema.shape.registeredBy.shape.nameInPrint,
      titleOrPosition: processingDetailsSchema.shape.registeredBy.shape.titleOrPosition,
      date: datePreprocessor,
    }),
    hasAffidavitOfPaternity: z.boolean().default(false),
    affidavitOfPaternityDetails: affidavitOfPaternitySchema.nullable().optional(),
    isDelayedRegistration: z.boolean().default(false),
    affidavitOfDelayedRegistration: delayedRegistrationAffidavitSchema.nullable().optional(),
    remarks: remarksAnnotationsSchema,
    pagination: paginationSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasAffidavitOfPaternity && !data.affidavitOfPaternityDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Affidavit details are required when including paternity affidavit',
        path: ['affidavitOfPaternityDetails'],
      });
    }
    if (data.isDelayedRegistration && !data.affidavitOfDelayedRegistration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Delayed registration affidavit is required for delayed registration',
        path: ['affidavitOfDelayedRegistration'],
      });
    }
  });

export type BirthCertificateFormValues = z.infer<typeof birthCertificateFormSchema>;

export interface BirthCertificateFormProps {
  open: boolean;
  onOpenChangeAction: () => Promise<void>;
  onCancelAction: () => Promise<void>;
}
