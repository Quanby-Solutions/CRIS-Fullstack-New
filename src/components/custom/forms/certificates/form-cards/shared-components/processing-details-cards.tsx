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
import { FieldValues, Path, useFormContext } from 'react-hook-form';

export interface ProcessingCardProps<T extends FieldValues = FieldValues> {
  fieldPrefix: string;
  cardTitle: React.ReactNode;
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
  showNameInPrint = true,
  showTitleOrPosition = true,
}: ProcessingCardProps<T>) {
  const { control } = useFormContext<T>();

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
                  <FormControl>
                    <Input
                      placeholder='Enter staff name'
                      {...field}
                      value={field.value || ''}
                      className='h-10'
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
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
              name={`${fieldPrefix}.titleOrPosition` as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title or Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter title or position'
                      {...field}
                      value={field.value || ''}
                      className='h-10'
                      onChange={(e) => field.onChange(e.target.value)}
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
  props: Omit<ProcessingCardProps<T>, 'fieldPrefix'>
) {
  return (
    <ProcessingDetailsCard<T>
      fieldPrefix="preparedBy"
      {...props}
    />
  );
}

export function ReceivedByCard<T extends FieldValues = FieldValues>(
  props: Omit<ProcessingCardProps<T>, 'fieldPrefix'>
) {
  return (
    <ProcessingDetailsCard<T>
      fieldPrefix='receivedBy'
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
      isEdit={props.isEdit}
    />
  );
}
