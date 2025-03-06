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
import { DeathCertificateFormValues } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { useFormContext } from 'react-hook-form';
import SignatureUploader from '../shared-components/signature-uploader';

const PostmortemCertificateCard: React.FC = () => {
  const { control, watch } = useFormContext<DeathCertificateFormValues>();

  // Only show if autopsy is performed
  const isAutopsyPerformed = watch('medicalCertificate.autopsy');
  if (!isAutopsyPerformed) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Postmortem Certificate of Death</CardTitle>
        <p className='text-sm text-muted-foreground'>
          I HEREBY CERTIFY that I have performed an autopsy upon the body of the
          deceased and that the cause of death was:
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Cause of Death */}
        <FormField
          control={control}
          name='postmortemCertificate.causeOfDeath'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cause of Death</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='Enter cause of death'
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Signature */}
        {/* <FormField
          control={control}
          name='postmortemCertificate.signature'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Signature</FormLabel>
              <FormControl>
                <SignatureUploader
                  name='postmortemCertificate.signature'
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Name in Print */}
        <FormField
          control={control}
          name='postmortemCertificate.nameInPrint'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name in Print</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='Enter name in print'
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={control}
          name='postmortemCertificate.date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <DatePickerField
                  field={{
                    value: field.value ?? '',
                    onChange: field.onChange,
                  }}
                  label='Postmortem Date'
                  placeholder='Select date'
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title/Designation */}
        <FormField
          control={control}
          name='postmortemCertificate.titleDesignation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title/Designation</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='e.g., Pathologist, Medical Examiner'
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={control}
          name='postmortemCertificate.address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='Enter address'
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default PostmortemCertificateCard;
