import { differenceInCalendarDays, format, formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatTime(date: string) {
  return format(new Date(date), 'HH:mm', { locale: ptBR })
}

export function formatDay(date: string) {
  return format(new Date(date), "d 'de' MMMM", { locale: ptBR })
}

export function formatChatDay(date: string) {
  return format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })
}

export function fromNow(date: string) {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true, locale: ptBR })
}

export function countDaysTogether(startDate: string) {
  return differenceInCalendarDays(new Date(), new Date(startDate)) + 1
}
