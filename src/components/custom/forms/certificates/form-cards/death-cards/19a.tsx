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
import { DeathCertificateFormValues } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { useFormContext } from 'react-hook-form';

const CausesOfDeath19aCard: React.FC = () => {
  const { control } = useFormContext<DeathCertificateFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>19a. Causes of Death (Infant)</CardTitle>
        <p className='text-sm text-muted-foreground'>
          For infants (deaths within 7 days of birth)
        </p>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Main Disease/Condition */}
          <FormField
            control={control}
            name='causesOfDeath19a.mainDiseaseOfInfant'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Disease/Condition</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder='Enter main disease/condition'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Other Diseases/Conditions */}
          <FormField
            control={control}
            name='causesOfDeath19a.otherDiseasesOfInfant'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Diseases/Conditions</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder='Enter other diseases/conditions (optional)'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Main Maternal Disease */}
          <FormField
            control={control}
            name='causesOfDeath19a.mainMaternalDisease'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Maternal Disease</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder='Enter main maternal disease (if applicable)'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Other Maternal Disease */}
          <FormField
            control={control}
            name='causesOfDeath19a.otherMaternalDisease'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Maternal Disease</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder='Enter other maternal disease (if applicable)'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Other Relevant Circumstances */}
          <FormField
            control={control}
            name='causesOfDeath19a.otherRelevantCircumstances'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Relevant Circumstances</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder='Enter any other relevant circumstances'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CausesOfDeath19aCard;
