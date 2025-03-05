'use client'

import NCRModeSwitch from '../shared-components/ncr-mode-switch'
import LocationSelector from '../shared-components/location-selector'

import { cn } from '@/lib/utils'
import { FC, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useFormContext, useWatch } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DatePickerField from '@/components/custom/datepickerfield/date-picker-field'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarriageCertificateFormValues } from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema'

interface AffidavitForDelayedMarriageRegistrationProps {
    className?: string
}

export const AffidavitForDelayedMarriageRegistration: FC<
    AffidavitForDelayedMarriageRegistrationProps
> = ({ className }) => {
    const { control, getValues, setValue } = useFormContext<MarriageCertificateFormValues>()


    const isDelayed = useWatch({ control, name: 'affidavitForDelayed.delayedRegistration' })

    // NCR
    const [affiant, setAffiant] = useState(false)
    const [execution, setExecution] = useState(false)
    const [ncrModeSwornDelayedOfficer, setNcrModeSwornOfficer] = useState(false)

    const agreementA = useWatch({ control, name: 'affidavitForDelayed.a.a.agreement' });
    const agreementB = useWatch({ control, name: 'affidavitForDelayed.a.b.agreement' });


    useEffect(() => {
        // Detect NCR mode from fetched data on component mount
        const province = getValues('affidavitForDelayed.applicantInformation.applicantAddress.province');
        if (province === 'Metro Manila' || province === 'NCR') {
            setAffiant(true);
        }
    }, [getValues]);

    useEffect(() => {
        // Detect NCR mode from fetched data on component mount
        const province = getValues('affidavitForDelayed.f.place.province');
        if (province === 'Metro Manila' || province === 'NCR') {
            setExecution(true);
        }
    }, [getValues]);

    useEffect(() => {
        // Detect NCR mode from fetched data on component mount
        const province = getValues('affidavitForDelayed.dateSworn.atPlaceOfSworn.province');
        if (province === 'Metro Manila' || province === 'NCR') {
            setNcrModeSwornOfficer(true);
        }
    }, [getValues]);

    useEffect(() => {
        if(affiant && execution && ncrModeSwornDelayedOfficer === true) {
            setValue('affidavitForDelayed.applicantInformation.applicantAddress.province', 'Metro Manila')
            setValue('affidavitForDelayed.f.place.province', 'Metro Manila')
            setValue('affidavitForDelayed.dateSworn.atPlaceOfSworn.province', 'Metro Manila')
        }
    })


    // Reset the entire AffidavitForDelayed object
    useEffect(() => {
        if (isDelayed === 'No') {
            setValue('affidavitForDelayed', undefined)
        }
    }, [isDelayed, setValue])

    return (
        <Card className={cn('border dark:border-border', className)}>
            <CardHeader className='flex flex-col items-start justify-between gap-2'>
                <CardTitle>Affidavit for Delayed Marriage Registration</CardTitle>
                <div className="flex items-center space-x-2">
                    <FormField
                        control={control}
                        name='affidavitForDelayed.delayedRegistration'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Is the registration delayed? </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ''}
                                >
                                    <FormControl>
                                        <SelectTrigger
                                            ref={field.ref}
                                            className='h-10 px-3 text-base md:text-sm'
                                        >
                                            <SelectValue placeholder='Select sector' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='Yes'>Yes</SelectItem>
                                        <SelectItem value='No'>No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardHeader>
            {isDelayed === 'Yes' && (
                <CardContent className='p-6'>

                    <div className='space-y-4'>
                        {/* Affiant information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Affiant Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <NCRModeSwitch
                                    isNCRMode={affiant}
                                    setIsNCRMode={setAffiant}
                                />
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 '>
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.applicantInformation.nameOfApplicant'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-foreground'>
                                                    Name of Affiant
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={field.value || ''}
                                                        className='h-10'
                                                        placeholder='Enter officer name'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <LocationSelector
                                        provinceFieldName='affidavitForDelayed.applicantInformation.applicantAddress.province'
                                        municipalityFieldName='affidavitForDelayed.applicantInformation.applicantAddress.cityMunicipality'
                                        barangayFieldName='affidavitForDelayed.applicantInformation.applicantAddress.barangay'
                                        provinceLabel='Province'
                                        municipalityLabel='City/Municipality'
                                        barangayLabel='Barangay'
                                        isNCRMode={affiant}
                                        showBarangay={true}
                                        provincePlaceholder='Select province'
                                        municipalityPlaceholder='Select city/municipality'
                                        barangayPlaceholder='Select barangay'
                                    />
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.applicantInformation.applicantAddress.st'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Street</FormLabel>
                                                <FormControl>
                                                    <Input type='text' className='h-10' placeholder='Enter complete address' {...field}
                                                        value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/*Country */}
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.applicantInformation.applicantAddress.country'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input type='text' className='h-10' placeholder='Enter complete address' {...field}
                                                        value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Postal Code */}
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.applicantInformation.postalCode'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Postal Code</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type='text' className='h-10' placeholder='Enter complete address'
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        maxLength={6}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Applicant for the delayed registration</CardTitle>
                            </CardHeader>
                            <CardContent className='p-6 space-y-6'>

                                <FormField
                                    control={control}
                                    name="affidavitForDelayed.a.a.agreement" // Name of agreementA
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Affiant Information</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    // Convert the string value to a boolean
                                                    const isAffiantHusbandOrWife = value === "true";

                                                    // Update both fields in one operation with boolean values
                                                    setValue('affidavitForDelayed.a.a.agreement', isAffiantHusbandOrWife, { shouldValidate: true });
                                                    setValue('affidavitForDelayed.a.b.agreement', !isAffiantHusbandOrWife, { shouldValidate: true });

                                                    // Important: Trigger the field's onChange with a boolean value, not the string
                                                    field.onChange(isAffiantHusbandOrWife);
                                                }}
                                                value={field.value === true ? "true" : "false"}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue placeholder="Select affiant type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="true">a. (the affiant is the husband or wife)</SelectItem>
                                                    <SelectItem value="false">a. (the affiant is <span className="text-red-500">not</span> the husband or wife)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {agreementA && (
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 '>
                                        <FormField
                                            control={control}
                                            name='affidavitForDelayed.a.a.nameOfPartner.first'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-foreground'>
                                                        Partner's (first)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ''}
                                                            className='h-10'
                                                            placeholder='Enter officer name'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name='affidavitForDelayed.a.a.nameOfPartner.middle'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-foreground'>
                                                        Partner's (middle)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ''}
                                                            className='h-10'
                                                            placeholder='Enter officer name'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name='affidavitForDelayed.a.a.nameOfPartner.last'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-foreground'>
                                                        Partner's (last)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ''}
                                                            className='h-10'
                                                            placeholder='Enter officer name'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className='col-span-3'>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
                                                <FormField
                                                    control={control}
                                                    name='affidavitForDelayed.a.a.dateOfMarriage'
                                                    render={({ field }) => (
                                                        <DatePickerField field={{
                                                            value: field.value || '',
                                                            onChange: field.onChange,
                                                        }} label='Issued on' />
                                                    )}
                                                />
                                                <FormField
                                                    control={control}
                                                    name='affidavitForDelayed.a.a.placeOfMarriage'
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-foreground'>
                                                                Place of Marriage
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                    className='h-10'
                                                                    placeholder='Enter officer name'
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className='pt-6 space-y-6'>

                                    {agreementB && (
                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 '>
                                            <FormField
                                                control={control}
                                                name='affidavitForDelayed.a.b.nameOfHusband.first'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-foreground'>
                                                            Husband (first)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                className='h-10'
                                                                placeholder='Enter officer name'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name='affidavitForDelayed.a.b.nameOfHusband.middle'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-foreground'>
                                                            Husband (middle)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                className='h-10'
                                                                placeholder='Enter officer name'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name='affidavitForDelayed.a.b.nameOfHusband.last'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-foreground'>
                                                            Husband (last)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                className='h-10'
                                                                placeholder='Enter officer name'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name='affidavitForDelayed.a.b.nameOfWife.first'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-foreground'>
                                                            Wife (first)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                className='h-10'
                                                                placeholder='Enter officer name'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name='affidavitForDelayed.a.b.nameOfWife.middle'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-foreground'>
                                                            Wife (middle)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                className='h-10'
                                                                placeholder='Enter officer name'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name='affidavitForDelayed.a.b.nameOfWife.last'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-foreground'>
                                                            Wife (last)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                className='h-10'
                                                                placeholder='Enter officer name'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className='col-span-3'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
                                                    <FormField
                                                        control={control}
                                                        name='affidavitForDelayed.a.b.dateOfMarriage'
                                                        render={({ field }) => (
                                                            <DatePickerField field={{
                                                                value: field.value || '',
                                                                onChange: field.onChange,
                                                            }} label='Issued on' />
                                                        )}
                                                    />
                                                    <FormField
                                                        control={control}
                                                        name='affidavitForDelayed.a.b.placeOfMarriage'
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className='text-foreground'>
                                                                    Place of Marriage
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value || ''}
                                                                        className='h-10'
                                                                        placeholder='Enter officer name'
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Marriage was solemnized by</CardTitle>
                            </CardHeader>
                            <CardContent className='p-6 space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.b.solemnizedBy' // ✅ Correct path
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-foreground'>
                                                    Solemnizing officer/Administrator
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={field.value || ''}
                                                        className='h-10'
                                                        placeholder='Enter officer&aposs name'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.b.sector'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sector </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ''}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger
                                                            ref={field.ref}
                                                            className='h-10 px-3 text-base md:text-sm'
                                                        >
                                                            <SelectValue placeholder='Select sector' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value='religious-ceremony'>Religious ceremony</SelectItem>
                                                        <SelectItem value='civil-ceremony'>Civil ceremony</SelectItem>
                                                        <SelectItem value='Muslim-rites'>Muslim rites</SelectItem>
                                                        <SelectItem value='tribal-rites'>Tribal rites</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Marriage Information</CardTitle>
                            </CardHeader>
                            <CardContent className='p-6 space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
                                    {/* License No */}
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.c.a.licenseNo'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-foreground'>
                                                    Marriage License No.
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        className='h-10'
                                                        placeholder='Enter license number'
                                                        maxLength={15}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Issued on */}
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.c.a.dateIssued'
                                        render={({ field }) => (
                                            <DatePickerField field={{
                                                value: field.value || '',
                                                onChange: field.onChange,
                                            }}
                                                placeholder='Select date issued'
                                                label='Issued on'
                                                ref={field.ref}
                                            />
                                        )}
                                    />
                                    {/* Place Issued */}
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.c.a.placeOfSolemnizedMarriage'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-foreground'>
                                                    Civil Registry Office
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        className='h-10'
                                                        placeholder='Enter place issued'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Article No. */}
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.c.b.underArticle'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-foreground'>
                                                    Article
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        className='h-10'
                                                        placeholder='Enter article number'
                                                        maxLength={6}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Husband and Wife's citizenship</CardTitle>
                            </CardHeader>
                            <CardContent className='p-6 space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
                                    {/* License No */}
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.d.husbandCitizenship'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-foreground'>
                                                    Husband's Citizenship
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        className='h-10'
                                                        placeholder='Enter license number'

                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.d.wifeCitizenship'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-foreground'>
                                                    Wife's Citizenship
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        className='h-10'
                                                        placeholder='Enter license number'

                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Reason for the delayed marriage registration</CardTitle>
                            </CardHeader>
                            <CardContent className='p-6 space-y-6'>
                                <div className='grid grid-cols-2 '>
                                    {/* License No */}
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.e'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-foreground'>
                                                    Affiant reason for delayed registration
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder='Enter reason for the delayed marriage registration'
                                                        className='min-h-[100px] resize-none'

                                                        {...field}
                                                        value={field.value ?? ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Affidavit Execution (affiant address and issued date)</CardTitle>
                            </CardHeader>
                            <CardContent className='p-6 space-y-6'>
                                <NCRModeSwitch
                                    isNCRMode={execution}
                                    setIsNCRMode={setExecution}
                                />
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 '>
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.f.date'
                                        render={({ field }) => (
                                            <DatePickerField field={{
                                                value: field.value || '',
                                                onChange: field.onChange,
                                            }} label='Issued on' />
                                        )}
                                    />
                                    <LocationSelector
                                        provinceFieldName='affidavitForDelayed.f.place.province'
                                        municipalityFieldName='affidavitForDelayed.f.place.cityMunicipality'
                                        barangayFieldName='affidavitForDelayed.f.place.barangay'
                                        provinceLabel='Province'
                                        municipalityLabel='City/Municipality'
                                        barangayLabel='Barangay'
                                        isNCRMode={execution}
                                        showBarangay={true}
                                        provincePlaceholder='Select province'
                                        municipalityPlaceholder='Select city/municipality'
                                        barangayPlaceholder='Select barangay'
                                    />
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.f.place.st'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Street</FormLabel>
                                                <FormControl>
                                                    <Input type='text' className='h-10' placeholder='Enter complete address' {...field}
                                                        value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.f.place.country'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input type='text' className='h-10' placeholder='Enter complete address' {...field}
                                                        value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Admin Officer Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Subscribe and Sworn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    <NCRModeSwitch
                                        isNCRMode={ncrModeSwornDelayedOfficer}
                                        setIsNCRMode={setNcrModeSwornOfficer}
                                    />
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                        {/* Date sworn on */}
                                        <FormField
                                            control={control}
                                            name='affidavitForDelayed.dateSworn.dayOf'
                                            render={({ field }) => (
                                                <DatePickerField field={{
                                                    value: field.value || '',
                                                    onChange: field.onChange,
                                                }} label='Issued on' />
                                            )}
                                        />
                                        <LocationSelector
                                            provinceFieldName='affidavitForDelayed.dateSworn.atPlaceOfSworn.province'
                                            municipalityFieldName='affidavitForDelayed.dateSworn.atPlaceOfSworn.cityMunicipality'
                                            barangayFieldName='affidavitForDelayed.dateSworn.atPlaceOfSworn.barangay'
                                            provinceLabel='Province'
                                            municipalityLabel='City/Municipality'
                                            selectTriggerClassName='h-10 px-3 text-base md:text-sm'
                                            provincePlaceholder='Select province'
                                            municipalityPlaceholder='Select city/municipality'
                                            className='grid grid-cols-2 gap-4'
                                            isNCRMode={ncrModeSwornDelayedOfficer}
                                            showBarangay={true}
                                            barangayLabel='Barangay'
                                            barangayPlaceholder='Select barangay'
                                        />
                                        <FormField
                                            control={control}
                                            name='affidavitForDelayed.dateSworn.atPlaceOfSworn.st'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Street</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className='h-10'
                                                            value={field.value || ''}
                                                            placeholder='Enter Office street'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name='affidavitForDelayed.dateSworn.atPlaceOfSworn.country'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Country</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className='h-10'
                                                            value={field.value || ''}
                                                            placeholder='Entry Country'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* CTC Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>CTC Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.dateSworn.ctcInfo.number'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CTC Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ''}
                                                        placeholder='Enter CTC/Valid ID no.'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.dateSworn.ctcInfo.dateIssued'
                                        render={({ field }) => (
                                            <FormItem>
                                                <DatePickerField
                                                    field={{
                                                        value: field.value ?? null,
                                                        onChange: field.onChange,
                                                    }}
                                                    label='Date Issued'
                                                    placeholder='Select date issued'
                                                    ref={field.ref}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name='affidavitForDelayed.dateSworn.ctcInfo.placeIssued'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Place Issued</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ''}
                                                        placeholder='Enter place/office address'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/*  of administrator */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Administering Officer Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                        <FormField
                                            control={control}
                                            name='affidavitForDelayed.administeringInformation.adminName'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-foreground'>
                                                        Administering Officer Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ''}
                                                            className='h-10'
                                                            placeholder='Enter officer name'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name='affidavitForDelayed.administeringInformation.position'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-foreground'>
                                                        Position/Title
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ''}
                                                            className='h-10'
                                                            placeholder='Enter officer name'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name='affidavitForDelayed.administeringInformation.adminAddress'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className='h-10'
                                                            value={field.value || ''}
                                                            placeholder='Enter Office address'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </CardContent>
            )}
        </Card>
    )
}

export default AffidavitForDelayedMarriageRegistration