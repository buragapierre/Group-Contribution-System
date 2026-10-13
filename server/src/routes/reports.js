import { Router } from 'express';
import PDFDocument from 'pdfkit';
import requireAuth from '../middleware/requireAuth.js';
import { getSupabaseAdmin } from '../supabase.js';

const router = Router();

// GET /api/reports/contributions?class_id=<id>
// Streams a PDF contribution report for one class.
// Allowed for the class professor or an admin.
router.get('/contributions', requireAuth, async (req, res, next) => {
  try {
    const classId = req.query.class_id;
    if (!classId) return res.status(400).json({ error: 'class_id is required' });

    const db = getSupabaseAdmin();

    const { data: cls } = await db.from('classes').select('*').eq('id', classId).single();
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const { data: profile } = await db
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();
    if (profile?.role !== 'admin' && cls.professor_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the class professor can export this report' });
    }

    const { data: rows } = await db
      .from('contributions')
      .select('*')
      .eq('class_id', classId)
      .order('contribution_percent', { ascending: false });

    const { data: gradeRows } = await db
      .from('ratings')
      .select('rated_user_id, score')
      .eq('class_id', classId);
    const gradeByUser = new Map((gradeRows || []).map(r => [r.rated_user_id, r.score]));

    const avg = (rows || []).length
      ? Math.round(rows.reduce((a, c) => a + (c.contribution_percent || 0), 0) / rows.length)
      : 0;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="contributions-class-${classId}.pdf"`
    );

    const doc = new PDFDocument({ margin: 48 });
    doc.pipe(res);

    doc.fontSize(20).text('Group Contribution Report', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Class: ${cls.subject || ''} (${cls.section || 'General'})`);
    doc.text(`Semester: ${cls.semester || '-'} · ${cls.academic_year || ''}`);
    doc.text(`Professor: ${cls.professor_name || ''}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(12).text(`Average contribution: ${avg}%   ·   Students: ${(rows || []).length}`);
    doc.moveDown();

    const startX = 48;
    const widths = [150, 55, 65, 55, 45, 60];
    const totalW = widths.reduce((a, b) => a + b, 0);
    const headers = ['Student', 'Assigned', 'Completed', 'On-time', '%', 'Grade'];
    const rowH = 22;

    function drawHeader(y) {
      doc.fillColor('#6d28d9').rect(startX, y, totalW, rowH).fill();
      let x = startX;
      headers.forEach((h, i) => {
        doc.fillColor('#ffffff').fontSize(10).text(h, x + 6, y + 6, { width: widths[i] - 12, lineBreak: false });
        x += widths[i];
      });
      return y + rowH;
    }

    if (!(rows || []).length) {
      doc.fillColor('#000000').fontSize(11).text('No contribution records for this class yet.');
    } else {
      let y = drawHeader(doc.y + 6);
      (rows || []).forEach(c => {
        if (y > 720) {
          doc.addPage();
          y = drawHeader(48);
        }
        const cells = [
          c.user_name || 'Member',
          String(c.tasks_assigned ?? 0),
          String(c.tasks_completed ?? 0),
          String(c.on_time_completions ?? 0),
          `${c.contribution_percent ?? 0}%`,
          gradeByUser.has(c.user_id) ? String(gradeByUser.get(c.user_id)) : '-',
        ];
        let cx = startX;
        doc.fillColor('#000000');
        cells.forEach((cell, i) => {
          doc.rect(cx, y, widths[i], rowH).stroke();
          doc.fontSize(10).text(cell, cx + 6, y + 6, { width: widths[i] - 12, lineBreak: false });
          cx += widths[i];
        });
        y += rowH;
      });
    }

    doc.end();
  } catch (err) {
    next(err);
  }
});

export default router;
