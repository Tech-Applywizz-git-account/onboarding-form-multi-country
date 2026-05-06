import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label: string;
  className?: string;
  error?: string;
  initialFile?: File | null;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept = '.pdf',
  maxSize = 20 * 1024 * 1024, // 20MB default
  label,
  className,
  error,
  initialFile
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null);
  const [uploadError, setUploadError] = useState<string>('');

  // Sync internal state with external updates
  React.useEffect(() => {
    setSelectedFile(initialFile || null);
    if (!initialFile) setUploadError('');
  }, [initialFile]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError('');

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setUploadError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setUploadError('Only PDF files are allowed');
      } else {
        setUploadError('Invalid file');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize,
    multiple: false
  });

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    setUploadError('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'glass-card p-6 border-2 border-dashed cursor-pointer transition-all duration-300 hover:border-primary',
            isDragActive && 'border-primary bg-primary/5',
            (error || uploadError) && 'border-destructive'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className={cn(
              'h-8 w-8 transition-colors',
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            )} />
            <div className="text-center">
              <p className="text-sm text-foreground">
                {isDragActive ? 'Drop the PDF here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF only, max {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <File className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="h-8 w-8 p-0 hover:bg-destructive/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {(error || uploadError) && (
        <p className="text-sm text-destructive">{error || uploadError}</p>
      )}
    </div>
  );
};

export default FileDropzone;