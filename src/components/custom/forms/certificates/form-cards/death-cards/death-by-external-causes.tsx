'use client';

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
import { DeathCertificateFormValues } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { useFormContext } from 'react-hook-form';

const ExternalCausesCard: React.FC = () => {
  const { control } = useFormContext<DeathCertificateFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Death by External Causes</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* External Causes Section */}
        <div className='gap-4 grid md:grid-cols-3 grid-cols-1 items-center'>
          <FormField
            control={control}
            name='medicalCertificate.externalCauses.mannerOfDeath'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='line-clamp-1'>
                  19d. (a) Manner of death (Homicide, Suicide, Accident, Legal
                  Intervention, etc.)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Enter manner of death'
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='medicalCertificate.externalCauses.placeOfOccurrence'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='line-clamp-1'>
                  (b) Place of Occurrence of External Cause (e.g. home, farm,
                  factory, street, sea, etc.)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Enter place of occurrence'
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='medicalCertificate.autopsy'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>20. Autopsy (Yes/No)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'yes')}
                  value={field.value ? 'yes' : 'no'}
                >
                  <FormControl>
                    <SelectTrigger ref={field.ref} className='h-8.5'>
                      <SelectValue placeholder='Select autopsy status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='yes'>Yes</SelectItem>
                    <SelectItem value='no'>No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExternalCausesCard;
