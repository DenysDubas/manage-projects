export function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('uk-UA', options).format(new Date(value))
}

export function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0]
}
