'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
  files: File[]
  onFileUpload: (files: File[]) => void
  onTranslate: () => void
}

export default function FileUpload({
  files,
  onFileUpload,
  onTranslate,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.type.startsWith('image/') ||
        file.name.endsWith('.pdf') ||
        /\.(jpg|jpeg|png|gif|bmp)$/i.test(file.name)
    )

    if (validFiles.length > 0) {
      onFileUpload([...files, ...validFiles].slice(0, 5))
    } else {
      alert('PDF 또는 이미지 파일만 업로드 가능합니다.')
    }
  }

  const handleDeleteFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFileUpload(newFiles)
  }

  const handleDeleteAll = () => {
    onFileUpload([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">파일을 업로드해 주세요</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* 드래그 앤 드롭 영역 */}
        <div>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-primary bg-primary/10'
                : 'border-gray-300 hover:border-primary'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-gray-600 mb-4">
              Choose a file or drag & drop it here
            </p>
            <button
              type="button"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              파일 선택
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>

        {/* 업로드된 파일 목록 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">
              {files.length}개 / 5개
            </span>
            {files.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-primary hover:underline"
              >
                전체 파일 삭제 &gt;
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            ))}

            {Array.from({ length: 5 - files.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className={`p-3 border rounded ${
                  index === 4 - files.length
                    ? 'border-dashed border-gray-300'
                    : 'border-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={onTranslate}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold"
          >
            번역 시작하기 &gt;
          </button>
        </div>
      )}
      
      {files.length === 0 && (
        <p className="mt-4 text-center text-gray-500 text-sm">
          PDF 또는 이미지 파일을 업로드해주세요.
        </p>
      )}
    </div>
  )
}

