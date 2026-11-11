import { ReportTargetTypes, type ReportTargetType } from '@keimelion/sdk/enums'
import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'

export function resolveReportTargetLabel(report: AdminReportDetailParsed): string {
  const label = report.targetSnapshot[resolveSnapshotLabelKey(report.targetType)]
  if (typeof label !== 'string' || label.trim().length === 0) return report.targetId
  return label
}

function resolveSnapshotLabelKey(targetType: ReportTargetType): string {
  switch (targetType) {
    case ReportTargetTypes.USER:
      return 'username'
    case ReportTargetTypes.LIST:
      return 'title'
    case ReportTargetTypes.ITEM:
      return 'name'
  }
}
