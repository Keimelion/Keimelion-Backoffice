import { LIST_STATUS_VALUES, USER_ROLE_VALUES } from '@keimelion/sdk/enums'
import type { ListStatus, UserRole } from '@keimelion/sdk/enums'
import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'
import { resolveReportTargetLabel } from '@/features/reports/resolve-report-target-label'

export interface ReportTargetPreviewData {
  title: string
  description: string | null
  imageUrl: string | null
  ownerName: string | null
  listStatus: ListStatus | null
  role: UserRole | null
  tags: string[]
  categories: string[]
  sourceUrls: string[]
}

export function parseReportTargetPreview(report: AdminReportDetailParsed): ReportTargetPreviewData {
  const snapshot = report.targetSnapshot
  return {
    title: resolveReportTargetLabel(report),
    description: readText(snapshot.description),
    imageUrl: readThumbnailUrl(snapshot.image) ?? readThumbnailUrl(snapshot.avatar),
    ownerName: isRecord(snapshot.owner) ? readText(snapshot.owner.username) : null,
    listStatus: readEnumValue(LIST_STATUS_VALUES, snapshot.listStatus),
    role: readEnumValue(USER_ROLE_VALUES, snapshot.role),
    tags: readFieldTexts(snapshot.tags, 'name'),
    categories: readFieldTexts(snapshot.categories, 'name'),
    sourceUrls: readFieldTexts(snapshot.sources, 'sourceUrl'),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readText(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null
  return value
}

function readFieldTexts(records: unknown, field: string): string[] {
  if (!Array.isArray(records)) return []
  return records.filter(isRecord).flatMap((record) => readText(record[field]) ?? [])
}

function readThumbnailUrl(image: unknown): string | null {
  if (!isRecord(image) || !isRecord(image.urls)) return null
  return readText(image.urls.sm)
}

function readEnumValue<Value extends string>(
  values: readonly Value[],
  candidate: unknown,
): Value | null {
  return values.find((value) => value === candidate) ?? null
}
