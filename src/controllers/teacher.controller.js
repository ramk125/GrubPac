const prisma = require('../config/db');

exports.uploadContent = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File is required' });

  const { title, subject, description, start_time, end_time, duration } = req.body;
  
  if (!title || !subject) {
    return res.status(400).json({ error: 'Title and subject are mandatory' });
  }

  const content = await prisma.content.create({
    data: {
      title,
      subject,
      description: description || null,
      file_path: '/uploads/' + req.file.filename,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      status: 'PENDING',
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      duration: duration ? parseFloat(duration) : null,
      uploaded_by_id: req.user.id
    }
  });

  res.status(201).json({ message: 'Content uploaded successfully', content });
};

exports.getMyContent = async (req, res) => {
  const contents = await prisma.content.findMany({
    where: { uploaded_by_id: req.user.id },
    orderBy: { created_at: 'desc' }
  });
  res.json({ contents });
};
