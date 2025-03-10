'use client';

import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MarriageCertificateFormValues } from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
import DatePickerField from '@/components/custom/datepickerfield/date-picker-field';
import { useEffect, useState } from 'react';
import NCRModeSwitch from '../shared-components/ncr-mode-switch';
import LocationSelector from '../shared-components/location-selector';

interface RegistryInformationCardForEditProps {

    className?: string;
}

export const RegistryInformationCardForEdit: React.FC<
    RegistryInformationCardForEditProps
> = ({ className }) => {
    const { control, setValue, getValues } = useFormContext<MarriageCertificateFormValues>();

    const [ncrMode, setNcrMode] = useState(false);


    useEffect(() => {
        // Detect NCR mode from fetched data on component mount
        const province = getValues('province');
        if (province === 'Metro Manila' || province === 'NCR') {
            setNcrMode(true);
        }
    }, [getValues]);

    useEffect(() => {
        if (ncrMode === true) {
            setValue('province', 'Metro Manila')
        }
    })

    return (
        <Card  className={` ${className}`}>
            <CardHeader>
                <CardTitle>Marriage Registry Information</CardTitle>
            </CardHeader>
            <CardContent>
                <Card>
                    <CardContent className='p-6 flex flex-col gap-4'>
                        <NCRModeSwitch isNCRMode={ncrMode} setIsNCRMode={setNcrMode} />

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>

                            <FormField
                                name='registryNumber'
                                render={({ field }) => (
                                    <FormItem className="">
                                        <FormLabel>Registry Number <span className='text-destructive'>(edit is forbidden)</span></FormLabel>
                                        <FormControl className="">
                                            <Input
                                                {...field}
                                                value={field.value ?? ''}
                                                className='h-10'
                                                placeholder='Enter Registry number'
                                                inputMode='numeric'
                                                disabled={true}
                                                name='registryNumber'
                                            />

                                        </FormControl>
                                        <FormDescription>Format: YYYY-numbers (e.g., 2025-123456)</FormDescription>
                                    </FormItem>
                                )}
                            />


                            {/* The LocationSelector now ensures that province is required before municipality */}
                            <LocationSelector
                                isNCRMode={ncrMode}

                                provinceFieldName='province'
                                municipalityFieldName='cityMunicipality'

                                provinceLabel='Province'
                                municipalityLabel='City/Municipality'



                                provincePlaceholder='Select province'
                                municipalityPlaceholder='Select city/municipality'

                            />
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
};

export default RegistryInformationCardForEditProps;
