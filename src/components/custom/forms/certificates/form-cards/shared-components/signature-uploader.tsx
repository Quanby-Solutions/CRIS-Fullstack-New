import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { CheckCircle2 } from 'lucide-react';
import React from 'react';

export interface SignatureUploaderProps {
  /**
   * The name of the field for use in your form and Zod schema.
   */
  name: string;
  /**
   * The label for the field.
   */
  label?: string;
  /**
   * Callback to pass the selected file (or base64 string) back to the parent.
   */
  onChange?: (value: File | string) => void;
  /**
   * An optional current value. This can be a File object or a base64 string.
   */
  initialValue?: File | string | null;
}

const SignatureUploader: React.FC<SignatureUploaderProps> = ({
  name,
  label = 'Signature',
  onChange,
  initialValue = null,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onChange?.(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById(name)?.click();
  };

  const renderPreview = () => {
    if (initialValue instanceof File) {
      return URL.createObjectURL(initialValue);
    } else if (
      typeof initialValue === 'string' &&
      initialValue.startsWith('data:image')
    ) {
      return initialValue;
    } else if (typeof initialValue === 'string' && initialValue.length > 0) {
      return `data:image/png;base64,${initialValue}`;
    }
    return '';
  };

  return (
    <div className='signature-uploader'>
      {/* Hidden file input */}
      <input
        id={name}
        name={name}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
      />

      <HoverCard>
        <HoverCardTrigger asChild>
          <div className='relative'>
            <Input
              placeholder={initialValue ? 'Change Signature' : 'Upload Signature'}
              readOnly
              onClick={triggerFileInput}
              className='h-10 cursor-pointer pr-10'
            />
            {initialValue && (
              <span className='absolute inset-y-0 right-2 flex items-center text-green-500'>
                <CheckCircle2 className='w-5 h-5' />
              </span>
            )}
          </div>
        </HoverCardTrigger>
        {initialValue && (
          <HoverCardContent
            side='top'
            align='center'
            className='p-2 flex items-center justify-center'
          >
            <img
              src={renderPreview()}
              alt='Signature Preview'
              className='w-full h-full object-contain'
            />
          </HoverCardContent>
        )}
      </HoverCard>
    </div>
  );
};

export default SignatureUploader;
