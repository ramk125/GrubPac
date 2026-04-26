const schedulingService = require('../services/scheduling.service');

exports.getLiveContent = async (req, res) => {
  const { teacher_id } = req.params;
  const { subject } = req.query; // optional subject filter

  // teacher_id should be parsed as int or looked up via string if string. 
  // In our schema it is Int. Let's parse it securely.
  const teacherIdInt = parseInt(teacher_id);
  if (isNaN(teacherIdInt)) {
    return res.status(400).json({ error: 'Invalid teacher ID' });
  }

  const activeContents = await schedulingService.getLiveContent(teacherIdInt, subject);

  if (!activeContents || activeContents.length === 0) {
    return res.json({ message: 'No content available', contents: [] });
  }

  // To meet the strict "returns currently active content" format,
  // if filtered by subject it returns the single active content for that subject.
  if (subject) {
    return res.json({ message: 'Live content', content: activeContents[0] });
  }

  // Otherwise, returns multiple active items (one per subject)
  res.json({ message: 'Live contents', contents: activeContents });
};
