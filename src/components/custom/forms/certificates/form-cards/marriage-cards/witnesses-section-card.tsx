'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MarriageCertificateFormValues } from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
import { useFieldArray, useFormContext } from 'react-hook-form';
;

interface WitnessesCardProps {
  className?: string;
}

export const WitnessesCard: React.FC<WitnessesCardProps> = ({ className }) => {
  const { control } = useFormContext<MarriageCertificateFormValues>();
  // Setup field array for husband witnesses
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'husbandWitnesses', // this matches the Zod field
  });

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`husbandWitnesses.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Witness Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter witness name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`husbandWitnesses.${index}.signature`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signature</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter signature" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* You can add additional fields (e.g. name2, signature2) similarly */}
          <button type="button" onClick={() => remove(index)}>
            Remove Witness
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', signature: '' })}>
        Add Witness
      </button>
    </div>
  );
};

export default WitnessesCard;
