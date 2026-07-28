export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function daysBetween(fromISO, toISODate) {
  const from = new Date(fromISO + 'T00:00:00')
  const to = new Date(toISODate + 'T00:00:00')
  return Math.round((to.getTime() - from.getTime()) / 86400000)
}

export function lastNDates(n) {
  const dates = []
  const cursor = new Date()
  for (let i = 0; i < n; i++) {
    dates.unshift(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() - 1)
  }
  return dates
}

export function currentStreak(loggedDatesSet) {
  let streak = 0
  const cursor = new Date()
  if (!loggedDatesSet.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (loggedDatesSet.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
