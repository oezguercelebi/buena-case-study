import * as React from 'react'
import { useDropzone, type DropzoneOptions } from 'react-dropzone'
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { Progress } from './progress'

export interface FileUploadProps extends Omit<DropzoneOptions, 'onDrop'> {
  onDrop: (acceptedFiles: File[], rejectedFiles: any[]) => void
  className?: string
  showProgress?: boolean
  progress?: number
  children?: React.ReactNode
  variant?: 'default' | 'compact'
}

export interface UploadedFile extends File {
  preview?: string
  progress?: number
  error?: string
  status?: 'uploading' | 'success' | 'error'
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      onDrop,
      className,
      showProgress = false,
      progress = 0,
      children,
      variant = 'default',
      accept = {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
        'application/pdf': ['.pdf'],
        'text/*': ['.txt', '.csv'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
      },
      maxSize = 5 * 1024 * 1024, // 5MB default
      multiple = true,
      ...dropzoneOptions
    },
    ref
  ) => {
    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragReject,
      isDragAccept,
      fileRejections,
    } = useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple,
      ...dropzoneOptions,
    })

    const borderColor = React.useMemo(() => {
      if (isDragReject) return 'border-destructive bg-destructive/5'
      if (isDragAccept) return 'border-primary bg-primary/5'
      if (isDragActive) return 'border-primary'
      return 'border-muted-foreground/25'
    }, [isDragActive, isDragReject, isDragAccept])

    if (variant === 'compact') {
      return (
        <div
          {...getRootProps()}
          className={cn(
            'relative cursor-pointer rounded-md border-2 border-dashed p-4 transition-colors hover:bg-muted/50',
            borderColor,
            className
          )}
          ref={ref}
        >
          <input {...getInputProps()} />
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Upload files</p>
              <p className="text-xs text-muted-foreground">
                Click or drag files here
              </p>
            </div>
          </div>
          {showProgress && progress > 0 && (
            <Progress value={progress} className="mt-3" />
          )}
        </div>
      )
    }

    return (
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:bg-muted/50',
          borderColor,
          className
        )}
        ref={ref}
      >
        <input {...getInputProps()} />
        
        {children ? (
          children
        ) : (
          <div className="mx-auto max-w-md">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <h3 className="text-lg font-semibold">
                {isDragActive ? 'Drop files here' : 'Upload files'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {isDragActive
                  ? 'Release to upload'
                  : `Drag and drop files here, or click to browse`}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Supports: Images, PDF, Text, Excel files (max {Math.round(maxSize / 1024 / 1024)}MB each)
              </p>
            </div>
            <Button variant="secondary" className="mt-4" asChild>
              <span>Choose Files</span>
            </Button>
          </div>
        )}

        {showProgress && progress > 0 && (
          <div className="mt-6">
            <Progress value={progress} />
            <p className="mt-2 text-sm text-muted-foreground">
              Uploading... {Math.round(progress)}%
            </p>
          </div>
        )}

        {fileRejections.length > 0 && (
          <div className="mt-4 rounded-md bg-destructive/10 p-3">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Upload errors:</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs">
              {fileRejections.map(({ file, errors }, index) => (
                <li key={index} className="text-destructive">
                  {file.name}: {errors.map((e) => e.message).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'

// File preview component
export interface FilePreviewProps {
  files: UploadedFile[]
  onRemove?: (index: number) => void
  className?: string
}

const FilePreview = React.forwardRef<HTMLDivElement, FilePreviewProps>(
  ({ files, onRemove, className }, ref) => {
    if (files.length === 0) return null

    return (
      <div className={cn('space-y-3', className)} ref={ref}>
        <h4 className="text-sm font-medium">Uploaded Files</h4>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <File className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                {file.progress !== undefined && file.progress < 100 && (
                  <Progress value={file.progress} className="mt-2 h-1" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {file.status === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)

FilePreview.displayName = 'FilePreview'

export { FileUpload, FilePreview }