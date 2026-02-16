'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, X, GripVertical, Image as ImageIcon, Video, Film } from 'lucide-react';

// Helper functions to get auth tokens from localStorage
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('pixecom-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
}

function getWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('pixecom-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.workspace?.id || null;
  } catch {
    return null;
  }
}

interface ProductMedia {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  position: number;
}

interface BulkImageUploaderProps {
  productId: string;
  existingMedia: ProductMedia[];
  onUploadComplete?: () => void;
  onReorder?: (mediaIds: string[]) => void;
  onDelete?: (mediaId: string) => void;
}

interface SortableImageProps {
  media: ProductMedia;
  onDelete: (id: string) => void;
}

function SortableImage({ media, onDelete }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isVideo = media.url.match(/\.(mp4|webm|ogg|mov)$/i);
  const isGif = media.url.match(/\.gif$/i);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(media.id);
        }}
        className="absolute top-2 right-2 z-10 p-1 bg-red-600 text-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Primary Badge */}
      {media.isPrimary && (
        <div className="absolute bottom-2 left-2 z-10 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
          Primary
        </div>
      )}

      {/* Media Type Badge - positioned at bottom-right to avoid overlap with drag handle */}
      {isVideo && (
        <div className="absolute bottom-2 right-2 z-10 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded flex items-center gap-1">
          <Video className="w-3 h-3" />
          Video
        </div>
      )}
      {isGif && (
        <div className="absolute bottom-2 right-2 z-10 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded flex items-center gap-1">
          <Film className="w-3 h-3" />
          GIF
        </div>
      )}

      {/* Media Content */}
      {isVideo ? (
        <video
          src={media.url}
          className="w-full h-full object-cover"
          controls={false}
          muted
          loop
          onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
          onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
        />
      ) : (
        <img
          src={media.url}
          alt={media.altText || 'Product media'}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load image:', media.url);
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
          }}
        />
      )}
    </div>
  );
}

export function BulkImageUploader({
  productId,
  existingMedia,
  onUploadComplete,
  onReorder,
  onDelete,
}: BulkImageUploaderProps) {
  const [media, setMedia] = useState<ProductMedia[]>(existingMedia);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update media when existingMedia prop changes (after upload/delete)
  useEffect(() => {
    setMedia(existingMedia);
  }, [existingMedia]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
          formData.append('files', file);
        });

        // Upload to API with XMLHttpRequest for progress tracking
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const endpoint = API_BASE.endsWith('/api')
          ? `${API_BASE}/products/${productId}/media/bulk`
          : `${API_BASE}/api/products/${productId}/media/bulk`;

        const response = await new Promise<Response>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Track upload progress
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(new Response(xhr.response, { status: xhr.status }));
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
          xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

          xhr.open('POST', endpoint);
          xhr.setRequestHeader('Authorization', `Bearer ${getAccessToken()}`);
          xhr.setRequestHeader('X-Workspace-Id', getWorkspaceId() || '');
          xhr.responseType = 'json';
          xhr.send(formData);
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Upload failed with status ${response.status}`);
        }

        const result = await response.json();

        // Check if response is wrapped in TransformInterceptor format
        const mediaRecords = result.data || result;

        // Set progress to 100% when complete
        setUploadProgress(100);

        // Don't update local state - let the parent refetch and update existingMedia
        // This ensures we get the full URL from the server
        onUploadComplete?.();
      } catch (error: any) {
        setUploadError(error.message || 'Failed to upload images');
      } finally {
        setUploading(false);
        // Reset progress after a short delay
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [productId, media, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov'],
    },
    maxFiles: 100,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading,
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Restore scroll
    document.body.style.overflow = '';

    if (!over || active.id === over.id) return;

    const oldIndex = media.findIndex((m) => m.id === active.id);
    const newIndex = media.findIndex((m) => m.id === over.id);

    const newOrder = arrayMove(media, oldIndex, newIndex);
    setMedia(newOrder);

    // Save order to backend
    if (onReorder) {
      onReorder(newOrder.map((m) => m.id));
    } else {
      // Replace with actual API call
      // await apiClient.put(`/products/${productId}/media/reorder`, {
      //   mediaIds: newOrder.map((m) => m.id),
      // });
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      if (onDelete) {
        onDelete(mediaId);
      } else {
        // Replace with actual API call
        // await apiClient.delete(`/products/${productId}/media/${mediaId}`);
      }

      setMedia(media.filter((m) => m.id !== mediaId));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              <p className="text-sm text-gray-600">Uploading files...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <>
                    <p className="font-medium">Drag & drop media files here, or click to select</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 100 files, 50MB each
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: Images (PNG, JPG, WEBP, GIF) & Videos (MP4, WEBM, OGG, MOV)
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploading && uploadProgress > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading...</span>
            <span className="text-sm text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {/* Images Grid */}
      {media.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Images ({media.length})
            </h3>
            <p className="text-xs text-gray-500">Drag to reorder</p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={() => {
              // Prevent page scroll during drag
              document.body.style.overflow = 'hidden';
            }}
            onDragCancel={() => {
              // Restore scroll
              document.body.style.overflow = '';
            }}
          >
            <SortableContext items={media.map((m) => m.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => (
                  <SortableImage key={item.id} media={item} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
