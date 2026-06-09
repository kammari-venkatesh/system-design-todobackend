import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import isSameDay from 'date-fns/isSameDay';
import parseISO from 'date-fns/parseISO';
import startOfDay from 'date-fns/startOfDay';
import subDays from 'date-fns/subDays';

export function flattenPlan(weeks) {
  const days = [];
  weeks.forEach((week) => {
    week.days.forEach((day, idx) => {
      const dayNum = days.length + 1;
      days.push({
        ...day,
        _n: dayNum,
        week: week.w,
        phase: week.phase,
        weekTitle: week.title,
        dayIndexInWeek: idx,
      });
    });
  });
  return days;
}

export function getDayStatus(dayNum, checked, dayDone, totalTasks) {
  if (dayDone[`d${dayNum}`]) return 'completed';
  let done = 0;
  for (let i = 0; i < totalTasks; i++) {
    if (checked[`${dayNum}_${i}`]) done += 1;
  }
  if (done > 0) return 'partial';
  return 'not_started';
}

export function getCurrentDayNum(allDays, dayDone) {
  for (const day of allDays) {
    if (!dayDone[`d${day._n}`]) return day._n;
  }
  return allDays.length;
}

export function getActivityDates(dayActivity) {
  const dates = new Set();
  Object.values(dayActivity || {}).forEach((activity) => {
    if (activity?.lastStudiedAt) {
      dates.add(format(startOfDay(new Date(activity.lastStudiedAt)), 'yyyy-MM-dd'));
    }
  });
  return dates;
}

export function computeStreaks(dayActivity) {
  const dates = [...getActivityDates(dayActivity)].sort();
  if (!dates.length) return { current: 0, longest: 0 };

  let longest = 1;
  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = parseISO(dates[i - 1]);
    const curr = parseISO(dates[i]);
    const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) streak += 1;
    else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  longest = Math.max(longest, streak);

  const today = startOfDay(new Date());
  let current = 0;
  let check = today;
  while (true) {
    const key = format(check, 'yyyy-MM-dd');
    if (dates.includes(key)) {
      current += 1;
      check = subDays(check, 1);
    } else break;
  }

  return { current, longest };
}

export function computeWeeklyConsistency(dayActivity) {
  const dates = getActivityDates(dayActivity);
  let active = 0;
  for (let i = 0; i < 7; i++) {
    const key = format(subDays(new Date(), i), 'yyyy-MM-dd');
    if (dates.has(key)) active += 1;
  }
  return Math.round((active / 7) * 100);
}

export function getOverdueDays(allDays, dayDone, currentDayNum) {
  return allDays.filter((d) => d._n < currentDayNum && !dayDone[`d${d._n}`]);
}

export function getUpcomingDays(allDays, currentDayNum, count = 7) {
  return allDays.filter((d) => d._n >= currentDayNum).slice(0, count);
}

export function getRecentlyStudied(allDays, dayActivity, limit = 10) {
  const entries = Object.entries(dayActivity || {})
    .filter(([, a]) => a?.lastStudiedAt)
    .map(([key, a]) => ({
      dayNum: Number(key.replace('d', '')),
      lastStudiedAt: new Date(a.lastStudiedAt),
    }))
    .sort((a, b) => b.lastStudiedAt - a.lastStudiedAt)
    .slice(0, limit);

  return entries
    .map((e) => allDays.find((d) => d._n === e.dayNum))
    .filter(Boolean);
}

export function computePhaseProgress(allDays, dayDone, phaseId) {
  const phaseDays = allDays.filter((d) => d.phase === phaseId);
  if (!phaseDays.length) return 0;
  const done = phaseDays.filter((d) => dayDone[`d${d._n}`]).length;
  return Math.round((done / phaseDays.length) * 100);
}

export function computeWeekProgress(allDays, dayDone, weekNum) {
  const weekDays = allDays.filter((d) => d.week === weekNum);
  if (!weekDays.length) return 0;
  const done = weekDays.filter((d) => dayDone[`d${d._n}`]).length;
  return Math.round((done / weekDays.length) * 100);
}

export function computeOverallProgress(allDays, dayDone) {
  if (!allDays.length) return 0;
  const done = allDays.filter((d) => dayDone[`d${d._n}`]).length;
  return Math.round((done / allDays.length) * 100);
}

export function getDayCompletionPercent(dayNum, checked, totalTasks) {
  if (!totalTasks) return 0;
  let done = 0;
  for (let i = 0; i < totalTasks; i++) {
    if (checked[`${dayNum}_${i}`]) done += 1;
  }
  return Math.round((done / totalTasks) * 100);
}

export function getWeakAndStrongTopics(allDays, checked, dayDone) {
  const weak = [];
  const strong = [];
  allDays.forEach((day) => {
    const total = day.tasks.length;
    const pct = getDayCompletionPercent(day._n, checked, total);
    if (dayDone[`d${day._n}`] || pct === 100) strong.push({ day: day._n, topic: day.topic, pct });
    else if (pct > 0 && pct < 100) weak.push({ day: day._n, topic: day.topic, pct });
  });
  return { weak: weak.slice(0, 5), strong: strong.slice(-5) };
}

export function getTotalStudyMinutes(dayActivity) {
  return Object.values(dayActivity || {}).reduce((sum, a) => sum + (a?.studyMinutes || 0), 0);
}

export function getStudyMinutesForPeriod(dayActivity, daysBack) {
  const cutoff = subDays(new Date(), daysBack);
  let total = 0;
  Object.values(dayActivity || {}).forEach((activity) => {
    if (activity?.lastStudiedAt && new Date(activity.lastStudiedAt) >= cutoff) {
      total += activity.studyMinutes || 0;
    }
  });
  return total;
}

export function buildHeatmapData(dayActivity, allDays, checked, dayDone) {
  const map = {};
  Object.entries(dayActivity || {}).forEach(([key, activity]) => {
    if (!activity?.lastStudiedAt) return;
    const dateKey = format(startOfDay(new Date(activity.lastStudiedAt)), 'yyyy-MM-dd');
    const dayNum = Number(key.replace('d', ''));
    const day = allDays.find((d) => d._n === dayNum);
    if (!day) return;
    const pct = dayDone[key] ? 100 : getDayCompletionPercent(dayNum, checked, day.tasks.length);
    map[dateKey] = {
      dayNum,
      topic: day.topic,
      progress: pct,
      studyMinutes: activity.studyMinutes || 0,
    };
  });
  return map;
}

export function getWeeklyReport(allDays, checked, dayDone, dayActivity, weekNum) {
  const weekDays = allDays.filter((d) => d.week === weekNum);
  const daysCompleted = weekDays.filter((d) => dayDone[`d${d._n}`]).length;
  let tasksCompleted = 0;
  let totalTasks = 0;
  weekDays.forEach((day) => {
    totalTasks += day.tasks.length;
    for (let i = 0; i < day.tasks.length; i++) {
      if (checked[`${day._n}_${i}`]) tasksCompleted += 1;
    }
  });
  const studyMinutes = weekDays.reduce((sum, day) => {
    const act = dayActivity[`d${day._n}`];
    return sum + (act?.studyMinutes || 0);
  }, 0);
  const { weak, strong } = getWeakAndStrongTopics(weekDays, checked, dayDone);
  const streaks = computeStreaks(dayActivity);
  return {
    weekNum,
    daysCompleted,
    totalDays: weekDays.length,
    tasksCompleted,
    totalTasks,
    completionPct: weekDays.length ? Math.round((daysCompleted / weekDays.length) * 100) : 0,
    avgStudyMinutes: daysCompleted ? Math.round(studyMinutes / daysCompleted) : 0,
    currentStreak: streaks.current,
    weakTopics: weak,
    strongTopics: strong,
  };
}

export function getPendingRevisions(revisionState) {
  const now = new Date();
  return Object.entries(revisionState || {})
    .filter(([, state]) => state?.nextReviewAt && new Date(state.nextReviewAt) <= now)
    .map(([key]) => Number(key));
}
