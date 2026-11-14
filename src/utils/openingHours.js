const dayNames = [
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
  'Dom',
]

const formatDays = (days) => {
  const sortedDays = [...new Set(days)].sort((first, second) => first - second)
  const ranges = []

  sortedDays.forEach((day) => {
    const lastRange = ranges[ranges.length - 1]

    if (lastRange && day === lastRange[1] + 1) {
      lastRange[1] = day
    } else {
      ranges.push([day, day])
    }
  })

  const labels = ranges.map(([firstDay, lastDay]) => (
    firstDay === lastDay
      ? dayNames[firstDay - 1]
      : `${dayNames[firstDay - 1]} à ${dayNames[lastDay - 1]}`
  ))

  if (labels.length < 2) return labels[0]
  if (labels.length === 2) return `${labels[0]} e ${labels[1]}`

  return `${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}`
}

export const groupOpeningHours = (openingHours) => {
  const groups = new Map()

  openingHours.forEach((schedule) => {
    if (schedule.is_closed) return

    const key = `${schedule.open_time}-${schedule.close_time}`
    const group = groups.get(key) || {
      key,
      days: [],
      openTime: schedule.open_time,
      closeTime: schedule.close_time,
    }

    group.days.push(Number(schedule.day_of_week))
    groups.set(key, group)
  })

  return Array.from(groups.values()).map((group) => ({
    key: group.key,
    daysLabel: formatDays(group.days),
    hoursLabel: `${group.openTime} às ${group.closeTime}`,
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
