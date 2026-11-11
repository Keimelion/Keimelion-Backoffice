'use client'

import { useApiVersion } from '@/features/health/hooks/use-api-version'
import { APP_VERSION } from '@/lib/app-version'
import { formatAppVersion } from '@/lib/format-app-version'
import { useTranslate } from '@/lib/i18n/use-translate'

export function DeployedVersions(): React.JSX.Element {
  const t = useTranslate()
  const { data: apiVersion } = useApiVersion()
  const apiVersionLabel = apiVersion === undefined
    ? t('sidebar.versions.unknown')
    : formatAppVersion(apiVersion, null)

  return (
    <p className="px-3 text-xs text-muted-foreground">
      {t('sidebar.versions.summary', { backofficeVersion: APP_VERSION, apiVersion: apiVersionLabel })}
    </p>
  )
}
