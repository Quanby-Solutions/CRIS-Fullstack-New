'use client';

import DatePickerField from '@/components/custom/datepickerfield/date-picker-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCivilRegistrarStaff } from '@/hooks/use-civil-registrar-staff';
import { useEffect } from 'react';
import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form';
import SignatureUploader from './signature-uploader';

// Helper function to convert a File object to a base64 string.
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// Extended interface including an optional isEdit property.
export interface ProcessingCardProps<T extends FieldValues = FieldValues> {
  fieldPrefix: string;
  cardTitle: string;
  hideDate?: boolean;
  showSignature?: boolean;
  showNameInPrint?: boolean;
  showTitleOrPosition?: boolean;
  isEdit?: string | null;
}

function ProcessingDetailsCard<T extends FieldValues = FieldValues>({
  fieldPrefix,
  cardTitle,
  hideDate = false,
  showSignature = true,
  showNameInPrint = true,
  showTitleOrPosition = true,
  isEdit = null,
}: ProcessingCardProps<T>) {
  const {
    control,
    watch,
    setValue,
    formState: { isSubmitted },
  } = useFormContext<T>();

  const { staff, loading } = useCivilRegistrarStaff();
  const selectedName = watch(`${fieldPrefix}.nameInPrint` as Path<T>);
  const titleFieldName = `${fieldPrefix}.titleOrPosition` as Path<T>;
  const signatureFieldName = `${fieldPrefix}.signature` as Path<T>;
  const dateFieldName = `${fieldPrefix}.date` as Path<T>;

  useEffect(() => {
    const selectedStaff = staff.find((s) => s.name === selectedName);
    if (selectedStaff) {
      setValue(
        titleFieldName,
        selectedStaff.title as PathValue<T, Path<T>>,
        {
          shouldValidate: isSubmitted,
          shouldDirty: true,
        }
      );
    }
  }, [selectedName, staff, setValue, isSubmitted, titleFieldName]);

  // Handler to update signature value: converts File to base64 if needed.
  const handleSignatureChange = async (value: File | string) => {
    if (value instanceof File) {
      try {
        const base64 = await toBase64(value);
        setValue(signatureFieldName, base64 as PathValue<T, Path<T>>, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } catch (error) {
        console.error('Error converting file to base64', error);
      }
    } else {
      setValue(signatureFieldName, value as PathValue<T, Path<T>>, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  // Handler to update date value (if necessary).
  const handleDateChange = (value: any) => {
    setValue(dateFieldName, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // If isEdit is provided (not null), hide the signature field.
  const finalShowSignature = isEdit != null ? false : showSignature;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {finalShowSignature && (
            <FormField
              control={control}
              name={signatureFieldName}
              render={({ field, formState: { errors } }) => {
                const existingSignature = watch(signatureFieldName);
                return (
                  <FormItem>
                    <FormLabel>Signature</FormLabel>
                    <FormControl>
                      <SignatureUploader
                        name={signatureFieldName}
                        label="Upload Signature"
                        initialValue={existingSignature} // Preload any existing signature
                        onChange={handleSignatureChange}
                      />
                    </FormControl>
                    <FormMessage>
                      {errors?.[field.name]?.message as string}
                    </FormMessage>
                  </FormItem>
                );
              }}
            />
          )}
          {!hideDate && (
            <FormField
              control={control}
              name={dateFieldName}
              render={({ field }) => (
                <DatePickerField
                  field={{
                    value: field.value || null,
                    onChange: (value) => handleDateChange(value),
                  }}
                  label="Date"
                  placeholder="Select date"
                />
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showNameInPrint && (
            <FormField
              control={control}
              name={`${fieldPrefix}.nameInPrint` as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name in Print</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue
                          placeholder={loading ? 'Loading...' : 'Select staff name'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {showTitleOrPosition && (
            <FormField
              control={control}
              name={titleFieldName}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title or Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Title will auto-fill"
                      {...field}
                      value={field.value || ''}
                      className="h-10"
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PreparedByCard<T extends FieldValues = FieldValues>(
  props: Omit<ProcessingCardProps<T>, 'fieldPrefix' | 'cardTitle'>
) {
  return (
    <ProcessingDetailsCard<T>
      fieldPrefix="preparedBy"
      cardTitle="Prepared By"
      {...props}
    />
  );
}

export function ReceivedByCard<T extends FieldValues = FieldValues>(
  props: Omit<ProcessingCardProps<T>, 'fieldPrefix' | 'cardTitle'>
) {
  return (
    <ProcessingDetailsCard<T>
      fieldPrefix="receivedBy"
      cardTitle="Received By"
      {...props}
    />
  );
}

export function RegisteredAtOfficeCard<T extends FieldValues = FieldValues>(
  props: ProcessingCardProps<T>
) {
  return (
    <ProcessingDetailsCard<T>
      fieldPrefix={props.fieldPrefix}
      cardTitle={props.cardTitle}
      hideDate={props.hideDate}
      showSignature={props.showSignature}
      showNameInPrint={props.showNameInPrint}
      showTitleOrPosition={props.showTitleOrPosition}
      isEdit={props.isEdit}
    />
  );
}
