export function downloadICS(tasks){
  const L = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PlantDoctor//KR']
  for (const t of tasks){
    if (!t.dueAt) continue
    const dt = t.dueAt.replace(/[-:]/g,'').split('.')[0] + 'Z'
    L.push('BEGIN:VEVENT',`UID:${t.id}@plantdoctor`, `DTSTAMP:${dt}`,
           `DTSTART:${dt}`, `SUMMARY:${t.title}`, 'END:VEVENT')
  }
  L.push('END:VCALENDAR')
  const blob = new Blob([L.join('\r\n')], {type:'text/calendar'})
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'plantdoctor_schedule.ics'
  a.click()
}
