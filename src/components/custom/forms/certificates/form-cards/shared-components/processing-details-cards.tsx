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

export interface ProcessingCardProps<T extends FieldValues = FieldValues> {
  fieldPrefix: string;
  cardTitle: string;
  hideDate?: boolean;
  showSignature?: boolean;
  showNameInPrint?: boolean;
  showTitleOrPosition?: boolean;
}

function ProcessingDetailsCard<T extends FieldValues = FieldValues>({
  fieldPrefix,
  cardTitle,
  hideDate = false,
  showSignature = true,
  showNameInPrint = true,
  showTitleOrPosition = true,
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

  useEffect(() => {
    const selectedStaff = staff.find((s) => s.name === selectedName);
    if (selectedStaff) {
      setValue(titleFieldName, selectedStaff.title as PathValue<T, Path<T>>, {
        shouldValidate: isSubmitted,
        shouldDirty: true,
      });
    }
  }, [selectedName, staff, setValue, isSubmitted, titleFieldName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                      <SelectTrigger className='h-10'>
                        <SelectValue
                          placeholder={
                            loading ? 'Loading...' : 'Select staff name'
                          }
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
          {!hideDate && (
            <FormField
              control={control}
              name={`${fieldPrefix}.date` as Path<T>}
              render={({ field }) => (
                <DatePickerField
                  field={{
                    value: field.value || null,
                    onChange: field.onChange,
                  }}
                  label='Date'
                  placeholder='Select date'
                />
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
                      placeholder='Title will auto-fill'
                      {...field}
                      value={field.value || ''}
                      className='h-10'
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
      fieldPrefix='preparedBy'
      cardTitle='Prepared By'
      {...props}
    />
  );
}

export function ReceivedByCard<T extends FieldValues = FieldValues>(
  props: Omit<ProcessingCardProps<T>, 'fieldPrefix' | 'cardTitle'>
) {
  return (
    <ProcessingDetailsCard<T>
      fieldPrefix='receivedBy'
      cardTitle='Received By'
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

      showNameInPrint={props.showNameInPrint}
      showTitleOrPosition={props.showTitleOrPosition}
    />
  );
}
