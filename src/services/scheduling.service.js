const prisma = require('../config/db');

exports.getLiveContent = async (teacherId, subjectFilter) => {
  const now = new Date();
  
  // 1. Fetch eligible content
  const contents = await prisma.content.findMany({
    where: {
      uploaded_by_id: teacherId,
      status: 'APPROVED',
      start_time: { lte: now },
      end_time: { gte: now },
      ...(subjectFilter ? { subject: subjectFilter } : {})
    },
    include: {
      schedule: true
    }
  });

  if (contents.length === 0) {
    return []; // Handled as "No content available" by controller
  }

  // 2. Group by subject
  const bySubject = contents.reduce((acc, content) => {
    if (!acc[content.subject]) acc[content.subject] = [];
    acc[content.subject].push(content);
    return acc;
  }, {});

  const activeContents = [];

  // 3. Scheduling logic per subject
  const nowMs = Date.now();

  for (const subject in bySubject) {
    const items = bySubject[subject];
    // Sort by rotation_order (or fallback to id/created_at if missing schedule)
    items.sort((a, b) => {
      const orderA = a.schedule ? a.schedule.rotation_order : a.id;
      const orderB = b.schedule ? b.schedule.rotation_order : b.id;
      return orderA - orderB;
    });

    // Calculate total duration for this subject's loop
    const totalDurationMs = items.reduce((sum, item) => {
      // Default duration is 5 minutes if not specified
      const duration = item.schedule ? item.schedule.duration : (item.duration || 5);
      return sum + (duration * 60 * 1000);
    }, 0);

    const offsetMs = nowMs % totalDurationMs;

    let currentOffset = 0;
    let activeItem = null;

    for (const item of items) {
      const durationMs = (item.schedule ? item.schedule.duration : (item.duration || 5)) * 60 * 1000;
      if (offsetMs >= currentOffset && offsetMs < currentOffset + durationMs) {
        activeItem = item;
        break;
      }
      currentOffset += durationMs;
    }

    if (activeItem) {
      activeContents.push(activeItem);
    }
  }

  return activeContents;
};
