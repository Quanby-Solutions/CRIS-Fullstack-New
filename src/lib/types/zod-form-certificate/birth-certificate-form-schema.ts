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

// Helper: Preprocess any string (or Date) into a Date object, but make it optional
const datePreprocessor = z.preprocess(
  (arg) =>
    typeof arg === 'string' || arg instanceof Date ? new Date(arg) : arg,
  z.date().optional()
);

// Helper: Wraps an existing date field schema with preprocessing, but makes it optional
const createOptionalDateFieldSchemaWithPreprocess = () =>
  z.preprocess(
    (arg) =>
      typeof arg === 'string' || arg instanceof Date ? new Date(arg) : arg,
    z.date().optional()
  );

// Child Information Schema
const childInformationSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  sex: z.enum(['Male', 'Female']).optional(),
  dateOfBirth: createOptionalDateFieldSchemaWithPreprocess(),
  placeOfBirth: z.object({
    hospital: z.string().optional(),
    cityMunicipality: z.string().optional(),
    province: z.string().optional(),
  }).optional(),
  typeOfBirth: z.string().optional(),
  multipleBirthOrder: z.string().optional(),
  birthOrder: z.string().optional(),
  weightAtBirth: z.string().optional(),
}).optional();

// Mother Information Schema
const motherInformationSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  citizenship: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  age: z.string().optional(),
  totalChildrenBornAlive: z.string().optional(),
  childrenStillLiving: z.string().optional(),
  childrenNowDead: z.string().optional(),
  residence: z.object({
    houseNo: z.string().optional(),
    st: z.string().optional(),
    barangay: z.string().optional(),
    cityMunicipality: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    internationalAddress: z.string().optional(),
  }).optional(),
}).optional();

// Father Information Schema
const fatherInformationSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  citizenship: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  age: z.string().optional(),
  residence: z.object({
    houseNo: z.string().optional(),
    st: z.string().optional(),
    barangay: z.string().optional(),
    cityMunicipality: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    internationalAddress: z.string().optional(),
  }).optional(),
}).optional();

// Marriage Information Schema
const marriageDateSchema = z.union([
  createOptionalDateFieldSchemaWithPreprocess(),
  z.literal("Not Married").optional(),
  z.literal("Don't Know").optional(),
  z.literal("Forgotten").optional()
]).optional();

const marriageInformationSchema = z.object({
  date: marriageDateSchema,
  place: z.object({
    houseNo: z.string().optional(),
    st: z.string().optional(),
    barangay: z.string().optional(),
    cityMunicipality: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    internationalAddress: z.string().optional(),
  }).optional(),
}).optional();

// Attendant Information Schema
const attendantInformationSchema = z.object({
  type: z.union([
    z.enum(['Physician', 'Nurse', 'Midwife', 'Hilot']),
    z.string()
  ]).optional(),
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
    }, z.date().optional()),
    name: z.string().optional(),
    title: z.string().optional(),
    signature: z.any().optional(),
    address: z.object({
      houseNo: z.string().optional(),
      st: z.string().optional(),
      barangay: z.string().optional(),
      cityMunicipality: z.string().optional(),
      province: z.string().optional(),
      country: z.string().optional(),
      internationalAddress: z.string().optional(),
    }).optional(),
    date: createOptionalDateFieldSchemaWithPreprocess(),
  }).optional(),
}).optional();

// Informant Schema
const informantSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  signature: z.any().optional(),
  address: z.object({
    houseNo: z.string().optional(),
    st: z.string().optional(),
    barangay: z.string().optional(),
    cityMunicipality: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    internationalAddress: z.string().optional(),
  }).optional(),
  date: createOptionalDateFieldSchemaWithPreprocess(),
}).optional();

// Affidavit of Paternity Schema
const affidavitOfPaternitySchema = z.object({
  father: z.object({
    name: z.string().optional(),
  }).optional(),
  mother: z.object({
    name: z.string().optional(),
  }).optional(),
  dateSworn: createOptionalDateFieldSchemaWithPreprocess(),
  adminOfficer: z.object({
    nameInPrint: z.string().optional(),
    titleOrPosition: z.string().optional(),
    address: z.object({
      houseNo: z.string().optional(),
      st: z.string().optional(),
      barangay: z.string().optional(),
      cityMunicipality: z.string().optional(),
      province: z.string().optional(),
      country: z.string().optional(),
      internationalAddress: z.string().optional(),
    }).optional(),
  }).optional(),
  ctcInfo: z.object({
    number: z.string().optional(),
    dateIssued: createOptionalDateFieldSchemaWithPreprocess(),
    placeIssued: z.string().optional(),
  }).optional(),
}).nullable().optional();

// Delayed Registration Affidavit Schema
const delayedRegistrationAffidavitSchema = z.object({
  affiant: z.object({
    name: z.string().optional(),
    address: z.object({
      houseNo: z.string().optional(),
      st: z.string().optional(),
      barangay: z.string().optional(),
      cityMunicipality: z.string().optional(),
      province: z.string().optional(),
      country: z.string().optional(),
      internationalAddress: z.string().optional(),
    }).optional(),
    civilStatus: z.string().optional(),
    citizenship: z.string().optional(),
  }).optional(),
  registrationType: z.enum(['SELF', 'OTHER']).optional(),
  reasonForDelay: z.string().optional(),
  dateSworn: createOptionalDateFieldSchemaWithPreprocess(),
  adminOfficer: z.object({
    nameInPrint: z.string().optional(),
    titleOrPosition: z.string().optional(),
    address: z.object({
      houseNo: z.string().optional(),
      st: z.string().optional(),
      barangay: z.string().optional(),
      cityMunicipality: z.string().optional(),
      province: z.string().optional(),
      country: z.string().optional(),
      internationalAddress: z.string().optional(),
    }).optional(),
  }).optional(),
  ctcInfo: z.object({
    number: z.string().optional(),
    dateIssued: createOptionalDateFieldSchemaWithPreprocess(),
    placeIssued: z.string().optional(),
  }).optional(),
  parentMaritalStatus: z.enum(['MARRIED', 'NOT_MARRIED', "Don't Know"]).optional(),
}).nullable().optional();

// Main Birth Certificate Schema
export const birthCertificateFormSchema = z.object({
  registryNumber: z.string().optional(),
  province: z.string().optional(),
  cityMunicipality: z.string().optional(),
  childInfo: childInformationSchema,
  motherInfo: motherInformationSchema,
  fatherInfo: fatherInformationSchema,
  parentMarriage: marriageInformationSchema,
  attendant: attendantInformationSchema,
  informant: informantSchema,
  preparedBy: z.object({
    nameInPrint: z.string().optional(),
    titleOrPosition: z.string().optional(),
    date: datePreprocessor,
  }).optional(),
  receivedBy: z.object({
    nameInPrint: z.string().optional(),
    titleOrPosition: z.string().optional(),
    date: datePreprocessor,
  }).optional(),
  registeredByOffice: z.object({
    nameInPrint: z.string().optional(),
    titleOrPosition: z.string().optional(),
    date: datePreprocessor,
  }).optional(),
  hasAffidavitOfPaternity: z.boolean().default(false).optional(),
  affidavitOfPaternityDetails: affidavitOfPaternitySchema,
  isDelayedRegistration: z.boolean().default(false).optional(),
  affidavitOfDelayedRegistration: delayedRegistrationAffidavitSchema,
  remarks: z.string().optional(),
  pagination: z.object({
    bookNumber: z.string().optional(),
    pageNumber: z.string().optional(),
  }).optional(),
});

export type BirthCertificateFormValues = z.infer<typeof birthCertificateFormSchema>;

export interface BirthCertificateFormProps {
  open: boolean;
  onOpenChangeAction: () => Promise<void>;
  onCancelAction: () => Promise<void>;
}