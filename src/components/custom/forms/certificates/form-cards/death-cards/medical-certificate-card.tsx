// MedicalCertificateCard.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectItem } from '@/components/ui/select';

interface MedicalCertificateFormValues {
  medicalCertificate: {
    causesOfDeath: {
      // For infant details (when applicable)
      mainDiseaseOfInfant?: string;
      otherDiseasesOfInfant?: string;
      mainMaternalDisease?: string;
      otherMaternalDisease?: string;
      otherRelevantCircumstances?: string;
      // For standard details (when applicable)
      immediate?: {
        cause?: string;
        interval?: string;
      };
      antecedent?: {
        cause?: string;
        interval?: string;
      };
      underlying?: {
        cause?: string;
        interval?: string;
      };
      otherSignificantConditions?: string;
    };
    maternalCondition?: {
      pregnantNotInLabor?: boolean;
      pregnantInLabor?: boolean;
      lessThan42Days?: boolean;
      daysTo1Year?: boolean;
      noneOfTheAbove?: boolean;
    };
    externalCauses: {
      mannerOfDeath?: string;
      placeOfOccurrence?: string;
    };
    attendant: {
      type?: 'Private physician' | 'Public health officer' | 'Hospital authority' | 'None' | 'Others';
      othersSpecify?: string;
      duration: {
        from?: string;
        to?: string;
      };
      certification?: {
        time?: string;
        name?: string;
        title?: string;
        address?: string;
        date?: string;
      };
    };
    autopsy: boolean;
  };
}

const MedicalCertificateCard: React.FC = () => {
  const { control } = useForm<MedicalCertificateFormValues>({
    defaultValues: {
      medicalCertificate: {
        causesOfDeath: {},
        maternalCondition: {},
        externalCauses: {},
        attendant: {
          duration: {},
          certification: {},
        },
        autopsy: false,
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Certificate</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Causes of Death Section */}
        <div>
          <h3>Causes of Death</h3>
          <p>Infant/Standard cause-of-death details based on age.</p>
          {/* Infant Fields */}
          <div>
            <label>Main Disease of Infant</label>
            <Controller
              name="medicalCertificate.causesOfDeath.mainDiseaseOfInfant"
              control={control}
              render={({ field }) => (
                <Input placeholder="Main disease/condition" {...field} />
              )}
            />
          </div>
          <div>
            <label>Other Diseases of Infant</label>
            <Controller
              name="medicalCertificate.causesOfDeath.otherDiseasesOfInfant"
              control={control}
              render={({ field }) => <Input placeholder="Other diseases" {...field} />}
            />
          </div>
          <div>
            <label>Main Maternal Disease</label>
            <Controller
              name="medicalCertificate.causesOfDeath.mainMaternalDisease"
              control={control}
              render={({ field }) => <Input placeholder="Main maternal disease" {...field} />}
            />
          </div>
          <div>
            <label>Other Maternal Disease</label>
            <Controller
              name="medicalCertificate.causesOfDeath.otherMaternalDisease"
              control={control}
              render={({ field }) => <Input placeholder="Other maternal disease" {...field} />}
            />
          </div>
          <div>
            <label>Other Relevant Circumstances</label>
            <Controller
              name="medicalCertificate.causesOfDeath.otherRelevantCircumstances"
              control={control}
              render={({ field }) => (
                <Input placeholder="Other circumstances" {...field} />
              )}
            />
          </div>

          {/* Standard Cause Fields */}
          <h4>Immediate Cause</h4>
          <div>
            <label>Cause</label>
            <Controller
              name="medicalCertificate.causesOfDeath.immediate.cause"
              control={control}
              render={({ field }) => <Input placeholder="Immediate cause" {...field} />}
            />
          </div>
          <div>
            <label>Interval</label>
            <Controller
              name="medicalCertificate.causesOfDeath.immediate.interval"
              control={control}
              render={({ field }) => <Input placeholder="Interval" {...field} />}
            />
          </div>
          <h4>Antecedent Cause</h4>
          <div>
            <label>Cause</label>
            <Controller
              name="medicalCertificate.causesOfDeath.antecedent.cause"
              control={control}
              render={({ field }) => <Input placeholder="Antecedent cause" {...field} />}
            />
          </div>
          <div>
            <label>Interval</label>
            <Controller
              name="medicalCertificate.causesOfDeath.antecedent.interval"
              control={control}
              render={({ field }) => <Input placeholder="Antecedent interval" {...field} />}
            />
          </div>
          <h4>Underlying Cause</h4>
          <div>
            <label>Cause</label>
            <Controller
              name="medicalCertificate.causesOfDeath.underlying.cause"
              control={control}
              render={({ field }) => <Input placeholder="Underlying cause" {...field} />}
            />
          </div>
          <div>
            <label>Interval</label>
            <Controller
              name="medicalCertificate.causesOfDeath.underlying.interval"
              control={control}
              render={({ field }) => <Input placeholder="Underlying interval" {...field} />}
            />
          </div>
          <div>
            <label>Other Significant Conditions</label>
            <Controller
              name="medicalCertificate.causesOfDeath.otherSignificantConditions"
              control={control}
              render={({ field }) => (
                <Input placeholder="Other conditions" {...field} />
              )}
            />
          </div>
        </div>

        {/* Maternal Condition Section */}
        <div>
          <h3>Maternal Condition</h3>
          <div>
            <label>
              <Controller
                name="medicalCertificate.maternalCondition.pregnantNotInLabor"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                )}
              />
              Pregnant (Not in labor)
            </label>
          </div>
          <div>
            <label>
              <Controller
                name="medicalCertificate.maternalCondition.pregnantInLabor"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                )}
              />
              Pregnant (In labor)
            </label>
          </div>
          <div>
            <label>
              <Controller
                name="medicalCertificate.maternalCondition.lessThan42Days"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                )}
              />
              Less than 42 days
            </label>
          </div>
          <div>
            <label>
              <Controller
                name="medicalCertificate.maternalCondition.daysTo1Year"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                )}
              />
              Days to 1 Year
            </label>
          </div>
          <div>
            <label>
              <Controller
                name="medicalCertificate.maternalCondition.noneOfTheAbove"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                )}
              />
              None of the Above
            </label>
          </div>
        </div>

        {/* External Causes Section */}
        <div>
          <h3>External Causes</h3>
          <div>
            <label>Manner of Death</label>
            <Controller
              name="medicalCertificate.externalCauses.mannerOfDeath"
              control={control}
              render={({ field }) => <Input placeholder="Manner of Death" {...field} />}
            />
          </div>
          <div>
            <label>Place of Occurrence</label>
            <Controller
              name="medicalCertificate.externalCauses.placeOfOccurrence"
              control={control}
              render={({ field }) => <Input placeholder="Place of Occurrence" {...field} />}
            />
          </div>
        </div>

        {/* Attendant Details Section */}
        <div>
          <h3>Attendant Details</h3>
          <div>
            <label>Type</label>
            <Controller
              name="medicalCertificate.attendant.type"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <SelectItem value="Private physician">
                    Private physician
                  </SelectItem>
                  <SelectItem value="Public health officer">
                    Public health officer
                  </SelectItem>
                  <SelectItem value="Hospital authority">
                    Hospital authority
                  </SelectItem>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </Select>
              )}
            />
          </div>
          <div>
            <label>Others Specify</label>
            <Controller
              name="medicalCertificate.attendant.othersSpecify"
              control={control}
              render={({ field }) => (
                <Input placeholder="Specify other attendant" {...field} />
              )}
            />
          </div>
          <div>
            <label>Duration From</label>
            <Controller
              name="medicalCertificate.attendant.duration.from"
              control={control}
              render={({ field }) => <Input type="date" {...field} />}
            />
          </div>
          <div>
            <label>Duration To</label>
            <Controller
              name="medicalCertificate.attendant.duration.to"
              control={control}
              render={({ field }) => <Input type="date" {...field} />}
            />
          </div>
          <div>
            <h4>Certification</h4>
            <div>
              <label>Time</label>
              <Controller
                name="medicalCertificate.attendant.certification.time"
                control={control}
                render={({ field }) => <Input type="time" {...field} />}
              />
            </div>
            <div>
              <label>Name</label>
              <Controller
                name="medicalCertificate.attendant.certification.name"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Attendant name" {...field} />
                )}
              />
            </div>
            <div>
              <label>Title</label>
              <Controller
                name="medicalCertificate.attendant.certification.title"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Attendant title" {...field} />
                )}
              />
            </div>
            <div>
              <label>Address</label>
              <Controller
                name="medicalCertificate.attendant.certification.address"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Attendant address" {...field} />
                )}
              />
            </div>
            <div>
              <label>Date</label>
              <Controller
                name="medicalCertificate.attendant.certification.date"
                control={control}
                render={({ field }) => <Input type="date" {...field} />}
              />
            </div>
          </div>
        </div>

        {/* Autopsy Section */}
        <div>
          <h3>Autopsy</h3>
          <div>
            <label>
              <Controller
                name="medicalCertificate.autopsy"
                control={control}
                render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Autopsy Performed
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalCertificateCard;
