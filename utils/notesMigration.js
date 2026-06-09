function emptyTipTapDoc() {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

function textToTipTapDoc(text) {
  if (!text?.trim()) return emptyTipTapDoc();
  return {
    type: 'doc',
    content: text.split('\n').filter(Boolean).map((line) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    })),
  };
}

function buildDailyNoteTemplate(day) {
  const now = new Date().toISOString();
  const sections = {
    keyConcepts: emptyTipTapDoc(),
    importantPoints: emptyTipTapDoc(),
    doubts: emptyTipTapDoc(),
    interviewQuestions: emptyTipTapDoc(),
    examples: emptyTipTapDoc(),
    revisionNotes: emptyTipTapDoc(),
    personalThoughts: emptyTipTapDoc(),
  };
  return {
    id: `day-${day._n}`,
    type: 'daily',
    dayNum: day._n,
    week: day.week,
    phase: day.phase,
    topic: day.topic,
    title: `Day ${day._n} · ${day.topic}`,
    summary: '',
    pinned: false,
    favorite: false,
    tags: [],
    relatedNoteIds: [],
    sections,
    body: emptyTipTapDoc(),
    attachments: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function migrateLegacyDayNotes(dayNotes, allDays) {
  const migrated = {};
  Object.entries(dayNotes || {}).forEach(([dayNumStr, legacy]) => {
    const dayNum = Number(dayNumStr);
    const day = allDays?.find((d) => d._n === dayNum);
    if (!day) return;
    const hasContent = legacy.learned || legacy.takeaways || legacy.doubts || legacy.revision;
    if (!hasContent) return;
    const note = buildDailyNoteTemplate(day);
    note.sections.keyConcepts = textToTipTapDoc(legacy.learned || '');
    note.sections.importantPoints = textToTipTapDoc(legacy.takeaways || '');
    note.sections.doubts = textToTipTapDoc(legacy.doubts || '');
    note.sections.revisionNotes = textToTipTapDoc(legacy.revision || '');
    note.updatedAt = legacy.updatedAt ? new Date(legacy.updatedAt).toISOString() : note.updatedAt;
    migrated[note.id] = note;
  });
  return migrated;
}

export function ensureKnowledgeNotesMigrated(progress, allDays) {
  const existing = progress.knowledgeNotes ? Object.fromEntries(progress.knowledgeNotes) : {};
  if (Object.keys(existing).length > 0) return false;

  const dayNotes = progress.dayNotes ? Object.fromEntries(progress.dayNotes) : {};
  const migrated = migrateLegacyDayNotes(dayNotes, allDays);
  if (Object.keys(migrated).length === 0) return false;

  progress.knowledgeNotes = migrated;
  progress.markModified('knowledgeNotes');
  return true;
}
