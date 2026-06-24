import type { ReportMedia } from "@/lib/types"

interface MediaPreparationProgress {
  completed: number
  progress: number
  total: number
}

function toSizeLabel(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function toMediaKind(file: File): ReportMedia["kind"] {
  if (file.type.startsWith("image/")) {
    return "image"
  }

  if (file.type.startsWith("video/")) {
    return "video"
  }

  return "document"
}

async function compressImageFile(file: File) {
  const bitmap = await createImageBitmap(file)
  const maxWidth = 1440
  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")

  if (!context) {
    return file
  }

  context.drawImage(bitmap, 0, 0, width, height)

  return new Promise<File>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(file)
          return
        }

        resolve(
          new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          })
        )
      },
      "image/jpeg",
      0.82
    )
  })
}

export async function prepareMediaFiles(
  files: FileList | File[],
  onProgress?: (progress: MediaPreparationProgress) => void
) {
  const source = Array.from(files)
  const preparedFiles: File[] = []

  for (const [index, sourceFile] of source.entries()) {
    let preparedFile = sourceFile

    if (sourceFile.type.startsWith("image/") && sourceFile.size > 1024 * 512) {
      preparedFile = await compressImageFile(sourceFile)
    }

    preparedFiles.push(preparedFile)
    onProgress?.({
      completed: index + 1,
      progress: Math.round(((index + 1) / source.length) * 100),
      total: source.length,
    })
  }

  return preparedFiles.map<ReportMedia>((file, index) => ({
    id: `${file.name}-${index}-${Date.now()}`,
    name: file.name,
    kind: toMediaKind(file),
    sizeLabel: toSizeLabel(file.size),
    mimeType: file.type || undefined,
    previewUrl:
      file.type.startsWith("image/") || file.type.startsWith("video/")
        ? URL.createObjectURL(file)
        : undefined,
  }))
}
