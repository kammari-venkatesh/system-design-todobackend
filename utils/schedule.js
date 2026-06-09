import { addDays, startOfDay, format, isSunday } from 'date-fns';

export function computePlanStartDate(from = new Date()) {
  const today = startOfDay(from);
  const dow = today.getDay();
  if (dow === 1) return today;
  if (dow === 0) return addDays(today, 1);
  return addDays(today, 8 - dow);
}

export function dayNumToDate(dayNum, planStart) {
  const start = startOfDay(planStart instanceof Date ? planStart : new Date(planStart));
  if (dayNum <= 1) return start;
  let date = start;
  let count = 1;
  while (count < dayNum) {
    date = addDays(date, 1);
    if (!isSunday(date)) count += 1;
  }
  return date;
}

export function dateToDayNum(date, planStart) {
  const start = startOfDay(planStart instanceof Date ? planStart : new Date(planStart));
  const target = startOfDay(date);
  if (target < start || isSunday(target)) return null;

  let current = start;
  let num = 1;
  while (current < target) {
    current = addDays(current, 1);
    if (!isSunday(current)) num += 1;
    if (num > 120) return null;
  }
  return num;
}

export function buildScheduleHeatmap(allDays, planStart, checked, dayDone) {
  if (!planStart || !allDays?.length) return {};
  const map = {};
  allDays.forEach((day) => {
    const date = dayNumToDate(day._n, planStart);
    const key = format(date, 'yyyy-MM-dd');
    const done = dayDone[`d${day._n}`];
    let progress = 0;
    if (done) {
      progress = 100;
    } else if (day.tasks?.length) {
      const checkedTasks = day.tasks.filter((_, i) => checked[`${day._n}_${i}`]).length;
      progress = Math.round((checkedTasks / day.tasks.length) * 100);
    }
    map[key] = {
      dayNum: day._n,
      topic: day.topic,
      progress,
      studyMinutes: 0,
    };
  });
  return map;
}
