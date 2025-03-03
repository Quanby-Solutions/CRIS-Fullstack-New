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
import { Switch } from '@/components/ui/switch';
import { DeathCertificateFormValues } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { format } from 'date-fns';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import SignatureUploader from '../shared-components/signature-uploader';

const AffidavitDelayedRegistrationCard: React.FC = () => {
  const { control, setValue, watch } =
    useFormContext<DeathCertificateFormValues>();

  // Local state toggle for displaying the affidavit section.
  const [isDelayed, setIsDelayed] = useState(false);

  // Watch attendance.wasAttended to conditionally show attendedBy.
  const wasAttended = watch('delayedRegistration.attendance.wasAttended');

  return (
    <Card>
      <CardHeader className='flex flex-row justify-between items-start'>
        <div>
          <CardTitle>Affidavit for Delayed Registration of Death</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Fill out this section only if the registration of death is delayed.
          </p>
        </div>
        <div className='flex items-start space-x-3'>
          <FormLabel className='mb-0'>Delayed Registration?</FormLabel>
          <Switch checked={isDelayed} onCheckedChange={setIsDelayed} />
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {isDelayed && (
          <>
            {/* Affiant Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Affiant Information</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={control}
                  name='delayedRegistration.affiant.name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiant Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Enter affiant name'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='delayedRegistration.affiant.civilStatus'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Civil Status</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='e.g. Single/Married'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={control}
                  name='delayedRegistration.affiant.residenceAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residence Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter affiant's address"
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='delayedRegistration.affiant.age'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter affiant's age"
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name='delayedRegistration.affiant.signature'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiant Signature</FormLabel>
                    <FormControl>
                      <SignatureUploader
                        name='delayedRegistration.affiant.signature'
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Deceased Information (Affidavit) */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>
                Deceased Information (Affidavit)
              </h3>
              <FormField
                control={control}
                name='delayedRegistration.deceased.name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of Deceased</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter deceased's name"
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormField
                  control={control}
                  name='delayedRegistration.deceased.burialInfo.date'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePickerField
                          field={{
                            value: field.value ?? '',
                            onChange: (date) =>
                              field.onChange(
                                date ? format(date, 'MM/dd/yyyy') : ''
                              ),
                          }}
                          label='Burial/Cremation Date'
                          placeholder='Select date'
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='delayedRegistration.deceased.burialInfo.place'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Burial/Cremation Place</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Enter location'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='delayedRegistration.deceased.burialInfo.method'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Method</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Buried or Cremated'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Attendance Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Attendance</h3>
              <FormField
                control={control}
                name='delayedRegistration.attendance.wasAttended'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center space-x-2'>
                    <FormLabel>Was Attended?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid md:grid-cols-3 grid-cols-1 gap-4'>
              {watch('delayedRegistration.attendance.wasAttended') && (
                <FormField
                  control={control}
                  name='delayedRegistration.attendance.attendedBy'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attended By</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Name of physician/health officer'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {/* Cause of Death & Reason for Delay */}
              <FormField
                control={control}
                name='delayedRegistration.causeOfDeath'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cause of Death (Affidavit)</FormLabel>
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
              <FormField
                control={control}
                name='delayedRegistration.reasonForDelay'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Delay</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Enter reason for delayed registration'
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Affidavit Date / Place */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Affidavit Date / Place</h3>
              <div className='grid md:grid-cols-2 grid-cols-1 gap-4'>
                <FormField
                  control={control}
                  name='delayedRegistration.affidavitDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePickerField
                          field={{
                            value: field.value ?? '',
                            onChange: (date) => field.onChange(date),
                          }}
                          label='Affidavit Date'
                          placeholder='Select date'
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='delayedRegistration.affidavitDatePlace'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affidavit Place</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Enter place'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Administering Officer */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Administering Officer</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={control}
                  name='delayedRegistration.adminOfficer.signature'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Officer Signature</FormLabel>
                      <FormControl>
                        <SignatureUploader
                          name='delayedRegistration.adminOfficer.signature'
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='delayedRegistration.adminOfficer.position'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Officer Position</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Enter position'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CTC / ID Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>CTC / ID Information</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormField
                  control={control}
                  name='delayedRegistration.ctcInfo.number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTC/ID Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Enter CTC/ID number'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='delayedRegistration.ctcInfo.issuedOn'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issued On</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='YYYY-MM-DD'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='delayedRegistration.ctcInfo.issuedAt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issued At</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Place issued'
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AffidavitDelayedRegistrationCard;
