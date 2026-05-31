const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const ProgressTracker = require('../models/ProgressTracker');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Order = require('../models/Order');
const PDFDocument = require('pdfkit');

// Download user progress report as PDF (streamed)
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const [progress, attendance] = await Promise.all([
      ProgressTracker.find({ userId: user._id }).sort({ date: -1 }).limit(30).lean(),
      Attendance.find({ userId: user._id }).sort({ date: -1 }).limit(30).lean(),
    ]);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="aurafit-progress-${Date.now()}.pdf"`);
    doc.pipe(res);

    // Header band
    doc.rect(0, 0, 612, 80).fill('#0a0a0a');
    doc.fontSize(24).fillColor('#00d4ff').text('AURAFIT', 50, 25);
    doc.fontSize(10).fillColor('#666').text('Progress Report', 50, 52);
    doc.fontSize(10).fillColor('#fff').text(`Generated: ${new Date().toLocaleDateString()}`, 400, 35);

    // User info
    doc.moveDown(3);
    doc.fontSize(18).fillColor('#000').text(`${user.name}`, 50, 100);
    doc.fontSize(11).fillColor('#555')
      .text(`Email: ${user.email}`, 50, 122)
      .text(`Membership: ${user.membership || 'None'}`, 50, 137)
      .text(`Level: ${Math.floor((user.points || 0) / 100) + 1}  •  Points: ${user.points || 0}  •  Streak: ${user.currentStreak || 0} days`, 50, 152);

    // Divider
    doc.moveTo(50, 175).lineTo(562, 175).strokeColor('#00d4ff').lineWidth(1.5).stroke();

    // Summary stats
    doc.fontSize(14).fillColor('#000').text('Summary', 50, 190);
    const totalVisits = attendance.length;
    const avgWeight = progress.length ? (progress.reduce((s, p) => s + (p.weight || 0), 0) / progress.length).toFixed(1) : 'N/A';

    const statBoxes = [
      { label: 'Total Sessions', value: String(totalVisits) },
      { label: 'Avg Weight (kg)', value: String(avgWeight) },
      { label: 'Progress Entries', value: String(progress.length) },
      { label: 'Current Streak', value: `${user.currentStreak || 0}d` },
    ];

    statBoxes.forEach((s, i) => {
      const x = 50 + (i % 2) * 255;
      const y = 210 + Math.floor(i / 2) * 55;
      doc.rect(x, y, 240, 45).fillColor('#f8f9fa').fill();
      doc.fontSize(18).fillColor('#9d00ff').text(s.value, x + 10, y + 7);
      doc.fontSize(9).fillColor('#666').text(s.label, x + 10, y + 30);
    });

    // Progress table
    if (progress.length > 0) {
      let y = 340;
      doc.fontSize(14).fillColor('#000').text('Body Measurements History', 50, y);
      y += 22;

      const cols = ['Date', 'Weight (kg)', 'Body Fat %', 'BMI'];
      const colW = [120, 110, 110, 100];
      let x = 50;
      doc.fontSize(9).fillColor('#fff');
      doc.rect(50, y, 462, 18).fill('#0a0a0a');
      cols.forEach((c, i) => { doc.text(c, x + 5, y + 5); x += colW[i]; });
      y += 18;

      progress.slice(0, 15).forEach((p, idx) => {
        doc.rect(50, y, 462, 18).fill(idx % 2 === 0 ? '#f9f9f9' : '#fff');
        x = 50;
        const row = [
          new Date(p.date).toLocaleDateString(),
          String(p.weight || '-'),
          p.bodyFat ? `${p.bodyFat}%` : '-',
          p.bmi ? p.bmi.toFixed(1) : '-',
        ];
        doc.fillColor('#333');
        row.forEach((v, i) => { doc.text(v, x + 5, y + 5); x += colW[i]; });
        y += 18;
        if (y > 720) { doc.addPage(); y = 50; }
      });
    }

    // Attendance section
    if (attendance.length > 0) {
      let y = doc.y + 30;
      if (y > 680) { doc.addPage(); y = 50; }
      doc.fontSize(14).fillColor('#000').text('Recent Attendance', 50, y);
      y += 22;

      doc.fontSize(9).fillColor('#fff').rect(50, y, 462, 18).fill('#0a0a0a');
      doc.text('Date', 55, y + 5);
      doc.text('Check-in Time', 175, y + 5);
      doc.text('Points Earned', 320, y + 5);
      y += 18;

      attendance.slice(0, 10).forEach((a, idx) => {
        doc.rect(50, y, 462, 18).fill(idx % 2 === 0 ? '#f9f9f9' : '#fff').fillColor('#333');
        doc.text(new Date(a.date).toLocaleDateString(), 55, y + 5);
        doc.text(a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : '-', 175, y + 5);
        doc.text(String(a.pointsEarned || 10), 320, y + 5);
        y += 18;
      });
    }

    // Footer
    const footerY = 780;
    doc.moveTo(50, footerY).lineTo(562, footerY).strokeColor('#ddd').lineWidth(1).stroke();
    doc.fontSize(8).fillColor('#999').text('AuraFit — Your AI Fitness Partner | support@aurafit.com', 50, footerY + 8, { align: 'center', width: 512 });

    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: export all members summary (CSV-like JSON for now)
router.get('/admin/members-summary', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'member' })
      .select('name email membership points currentStreak createdAt status')
      .lean();

    res.json({ success: true, data: users, total: users.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
