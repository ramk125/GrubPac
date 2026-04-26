const prisma = require('../config/db');

exports.getAllContent = async (req, res) => {
  const contents = await prisma.content.findMany({
    include: { uploaded_by: { select: { name: true, email: true } } },
    orderBy: { created_at: 'desc' }
  });
  res.json({ contents });
};

exports.getPendingContent = async (req, res) => {
  const contents = await prisma.content.findMany({
    where: { status: 'PENDING' },
    include: { uploaded_by: { select: { name: true, email: true } } },
    orderBy: { created_at: 'desc' }
  });
  res.json({ contents });
};

exports.approveContent = async (req, res) => {
  // We need to parse rotation order and duration if teacher provided it or set default logic.
  // The system allows teacher to set them, so we assume they exist or use default values if needed.
  // Actually, scheduling requires creation of ContentSchedule or just rotating based on 'duration' on Content itself.
  // We can just rely on the duration directly on Content to avoid the overhead of ContentSchedule table syncing for now, 
  // but to satisfy "Minimum Tables" we can also populate ContentSchedule here if we want.
  
  const contentToApprove = await prisma.content.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!contentToApprove) return res.status(404).json({ error: 'Content not found' });
  if (contentToApprove.status !== 'PENDING') return res.status(400).json({ error: 'Can only approve pending content' });

  const content = await prisma.content.update({
    where: { id: parseInt(req.params.id) },
    data: {
      status: 'APPROVED',
      approved_by_id: req.user.id,
      approved_at: new Date()
    }
  });

  // Populate the ContentSlot and ContentSchedule tables for strict assignment adherence
  let slot = await prisma.contentSlot.findUnique({ where: { subject: content.subject } });
  if (!slot) {
    slot = await prisma.contentSlot.create({ data: { subject: content.subject } });
  }

  // Get current schedules to determine rotation_order
  const existingSchedules = await prisma.contentSchedule.count({ where: { slot_id: slot.id } });
  
  await prisma.contentSchedule.create({
    data: {
      content_id: content.id,
      slot_id: slot.id,
      rotation_order: existingSchedules + 1,
      duration: content.duration || 5 // defaulting to 5 mins
    }
  });

  res.json({ message: 'Content approved', content });
};

exports.rejectContent = async (req, res) => {
  const { rejection_reason } = req.body;
  if (!rejection_reason) return res.status(400).json({ error: 'Rejection reason is required' });

  const content = await prisma.content.update({
    where: { id: parseInt(req.params.id) },
    data: {
      status: 'REJECTED',
      rejection_reason
    }
  });
  res.json({ message: 'Content rejected', content });
};
