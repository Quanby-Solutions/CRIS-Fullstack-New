'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { FormType } from '@prisma/client';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import LocationSelector from './location-selector';
import NCRModeSwitch from './ncr-mode-switch';
import { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema';

interface RegistryInformationCardProps {
  formType: FormType;
  title?: string;
  forms?: any;
}

const RegistryInformationCard: React.FC<RegistryInformationCardProps> = ({
  forms,
  formType,
  title = 'Registry Information',
}) => {
  const { control, setValue, setError, clearErrors, getValues } =
    useFormContext();

  // Initialize local state from RHF default value.
  const initialRegistryNumber = getValues('registryNumber') || '';
  const [registryNumber, setRegistryNumber] = useState(initialRegistryNumber);
  const [debouncedRegistryNumber] = useDebounce(registryNumber, 500);
  const [isChecking, setIsChecking] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    exists: boolean | null;
    error: string | null;
  }>({ exists: null, error: null });
  const [animationKey, setAnimationKey] = useState(0);
  const [ncrMode, setNcrMode] = useState(false);
    const { watch } = useFormContext<typeof forms>()

  const minLength = 6;
  const maxLength = 20;


  const province = watch('province');

  // Helper: Extract the province string from either a string or object shape
  const getProvinceString = (provinceValue: any): string => {
    if (typeof provinceValue === 'string') {
      return provinceValue;
    } else if (provinceValue && typeof provinceValue === 'object' && provinceValue.label) {
      return provinceValue.label;
    }
    return '';
  };

  // When the province changes, update the NCR mode accordingly.
  useEffect(() => {
    const provinceString = getProvinceString(province);
    const shouldBeNCR = provinceString.trim().toLowerCase() === 'metro manila';
    setNcrMode(shouldBeNCR);
  }, []);




  const generateRegistryNumber = () => {
    const year = new Date().getFullYear();
    return `${year}-${Math.floor(Math.random() * 1000000)}`;
  };


  const validateRegistryNumber = useCallback(
    (value: string): string => {
      if (!value) return '';

      const formatRegex = /^\d{4}-\d+$/;
      if (!value.match(formatRegex)) {
        if (value.length < minLength) return '';
        return 'Registry number must be in format: YYYY-numbers (e.g., 2024-1)';
      }

      const year = parseInt(value.split('-')[0]);
      const currentYear = new Date().getFullYear();
      if (year < 1945 || year > currentYear) {
        return 'Registration year must be between 1945 and current year';
      }

      return '';
    },
    [minLength]
  );


  const checkRegistryNumber = useCallback(
    async (value: string) => {
      try {
        setIsChecking(true);
        const response = await fetch('/api/check-registry-number', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registryNumber: value, formType }),
        });

        if (!response.ok) {
          throw new Error('Failed to validate registry number');
        }

        const { exists } = await response.json();

        if (exists) {
          setError('registryNumber', {
            type: 'manual',
            message: 'This registry number is already in use.',
          });
          setValidationResult({ exists: true, error: null });
        } else {
          clearErrors('registryNumber');
          setValidationResult({ exists: false, error: null });
        }
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({
          exists: null,
          error: 'Failed to validate registry number. Please try again.',
        });
      } finally {
        setIsChecking(false);
      }
    },
    [setError, clearErrors, formType, setValue]
  );

  useEffect(() => {
    if (debouncedRegistryNumber.length >= minLength) {
      const error = validateRegistryNumber(debouncedRegistryNumber);
      if (!error) {
        checkRegistryNumber(debouncedRegistryNumber);
      }
    } else {
      clearErrors('registryNumber');
      setValidationResult({ exists: null, error: null });
    }
  }, [
    debouncedRegistryNumber,
    checkRegistryNumber,
    clearErrors,
    validateRegistryNumber,
    minLength,
  ]);

  const handleRegistryNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Removed the early return so user input always works
    let value = event.target.value.replace(/[^\d-]/g, '');
    if (value.length >= 4 && !value.includes('-')) {
      value = value.slice(0, 4) + '-' + value.slice(4);
    }

    const error = validateRegistryNumber(value);
    if (error) {
      setError('registryNumber', {
        type: 'manual',
        message: error,
      });
    } else {
      clearErrors('registryNumber');
    }

    setRegistryNumber(value);
    setValue('registryNumber', value);
  };

  const refreshIconVariants = {
    initial: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 1, ease: 'easeInOut' } },
    whileTap: { scale: 0.8 },
  };

  const handleGenerateRegistryNumber = () => {
    // Removed the early return so the generate button always works
    const generatedNumber = generateRegistryNumber();
    setRegistryNumber(generatedNumber);
    setValue('registryNumber', generatedNumber);
    clearErrors('registryNumber');
    setAnimationKey((prevKey) => prevKey + 1);
  };

  const getValidationIcon = () => {
    // Use the current registryNumber instead of initialRegistryNumber for UX feedback
    if (!registryNumber) return null;

    if (isChecking) {
      return <Loader2 className='h-4 w-4 animate-spin text-yellow-500' />;
    }
    if (validationResult.error) {
      return <AlertCircle className='h-4 w-4 text-red-500' />;
    }
    if (validationResult.exists === false) {
      return <CheckCircle2 className='h-4 w-4 text-green-500' />;
    }
    if (validationResult.exists === true) {
      return <AlertCircle className='h-4 w-4 text-red-500' />;
    }
    return null;
  };

  const placeholder = 'YYYY-numbers';
  const description = 'Format: YYYY-numbers (e.g., 2025-123456)';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Card>
          <CardContent className='p-6'>
            <NCRModeSwitch isNCRMode={ncrMode} setIsNCRMode={setNcrMode} />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={control}
                name='registryNumber'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Registry Number</FormLabel>
                    <div className='relative flex items-center'>
                      <Button
                        type='button'
                        onClick={handleGenerateRegistryNumber}
                        className='sm:btn sm:btn-primary absolute left-1 z-10'
                        size={'sm'}
                        variant={'default'}
                      >
                        <motion.div
                          key={animationKey}
                          variants={refreshIconVariants}
                          initial='initial'
                          animate='animate'
                          whileTap='whileTap'
                        >
                          <Icons.refresh className='h-3 w-3' />
                        </motion.div>
                      </Button>
                      <FormControl>
                        <Input
                          className='h-10 pl-14'
                          placeholder={placeholder}
                          onChange={handleRegistryNumberChange}
                          value={registryNumber}
                          maxLength={maxLength}
                          inputMode='numeric'
                          disabled={false}
                        />
                      </FormControl>
                      <div className='absolute right-2 top-[10px]'>
                        {getValidationIcon()}
                      </div>
                    </div>
                    <FormDescription>{description}</FormDescription>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              {/* The LocationSelector now ensures that province is required before municipality */}
              <LocationSelector isNCRMode={ncrMode} className='col-span-2' />
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default RegistryInformationCard;
