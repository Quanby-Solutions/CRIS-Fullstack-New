import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { CheckCircle2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface SignatureUploaderProps {
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
   * An optional initial value. This can be a File object or a base64 string.
   */
  initialValue?: File | string;
}

const SignatureUploader: React.FC<SignatureUploaderProps> = ({
  name,
  label = 'Signature',
  onChange,
  initialValue = null,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | string | null>(
    initialValue || null
  );

  useEffect(() => {
    setSelectedFile(initialValue || null);
  }, [initialValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onChange?.(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById(name)?.click();
  };

  const renderPreview = () => {
    if (selectedFile instanceof File) {
      return URL.createObjectURL(selectedFile);
    } else if (typeof selectedFile === 'string' && selectedFile.startsWith('data:image')) {
      return selectedFile; // Base64 string (already formatted)
    } else if (typeof selectedFile === 'string') {
      return `data:image/png;base64,${selectedFile}`; // Ensure proper format
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
        accept='image/*' // Restrict file types to images
        onChange={handleFileChange}
        className='hidden'
      />

      <HoverCard>
        <HoverCardTrigger asChild>
          <div className='relative'>
            <Input
              placeholder={
                selectedFile ? 'Change Signature' : 'Upload Signature'
              }
              readOnly
              onClick={triggerFileInput}
              className='h-10 cursor-pointer pr-10'
            />
            {selectedFile && (
              <span className='absolute inset-y-0 right-2 flex items-center text-green-500'>
                <CheckCircle2 className='w-5 h-5' />
              </span>
            )}
          </div>
        </HoverCardTrigger>
        {selectedFile && (
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
