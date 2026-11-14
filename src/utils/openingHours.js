const dayNames = [
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
  'domingo',
]

const formatDays = (days) => {
  const sortedDays = [...days].sort((first, second) => first - second)

  if (sortedDays.length === 7) return 'Todos os dias'
  if (sortedDays.join(',') === '1,2,3,4,5') return 'Segunda à sexta-feira'
  if (sortedDays.join(',') === '6,7') return 'Sábado e domingo'

  const names = sortedDays.map((day) => dayNames[day - 1])
  const capitalizedFirstDay = `${names[0][0].toUpperCase()}${names[0].slice(1)}`

  if (names.length === 1) return capitalizedFirstDay
  if (names.length === 2) return `${capitalizedFirstDay} e ${names[1]}`

  return `${capitalizedFirstDay}, ${names.slice(1, -1).join(', ')} e ${names[names.length - 1]}`
}

export const groupOpeningHours = (openingHours) => {
  const groups = new Map()

  openingHours.forEach((schedule) => {
    const isClosed = schedule.is_closed
    const key = isClosed ? 'closed' : `${schedule.open_time}-${schedule.close_time}`
    const group = groups.get(key) || {
      key,
      days: [],
      isClosed,
      openTime: schedule.open_time,
      closeTime: schedule.close_time,
    }

    group.days.push(Number(schedule.day_of_week))
    groups.set(key, group)
  })

  return Array.from(groups.values()).map((group) => ({
    key: group.key,
    daysLabel: formatDays(group.days),
    hoursLabel: group.isClosed ? 'Fechado' : `${group.openTime} às ${group.closeTime}`,
  }))
}

const getMinutes = (time) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time || '')
  if (!match) return null

  return Number(match[1]) * 60 + Number(match[2])
}

const isOpenDuringSchedule = (schedule, currentMinutes, isPreviousDay = false) => {
  if (!schedule || schedule.is_closed) return false

  const openMinutes = getMinutes(schedule.open_time)
  const closeMinutes = getMinutes(schedule.close_time)
  if (openMinutes === null || closeMinutes === null) return false

  if (openMinutes < closeMinutes) {
    return !isPreviousDay && currentMinutes >= openMinutes && currentMinutes < closeMinutes
  }

  if (openMinutes > closeMinutes) {
    return isPreviousDay ? currentMinutes < closeMinutes : currentMinutes >= openMinutes
  }

  return false
}

export const isStoreOpenAt = (openingHours, date) => {
  if (!openingHours.length) return null

  const dayOfWeek = date.getDay() || 7
  const previousDay = dayOfWeek === 1 ? 7 : dayOfWeek - 1
  const currentMinutes = date.getHours() * 60 + date.getMinutes()
  const scheduleForDay = (day) => openingHours.find(
    (schedule) => Number(schedule.day_of_week) === day,
  )

  return isOpenDuringSchedule(scheduleForDay(dayOfWeek), currentMinutes)
    || isOpenDuringSchedule(scheduleForDay(previousDay), currentMinutes, true)
}
