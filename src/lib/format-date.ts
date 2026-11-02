export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
