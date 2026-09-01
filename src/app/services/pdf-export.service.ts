import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { R07Week, UserProfile } from '../models/r07.models';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  public exportWeekToPdf(week: R07Week, profile: UserProfile): void {
    this.exportWeeklyAgendaPdf(week, profile);
  }

  public exportWeeklyAgendaPdf(week: R07Week, profile: UserProfile): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [107, 33, 168]; // Purple / Burgundy #6b21a8
    const goldColor = [217, 119, 6];     // Gold / Amber #d97706
    const darkGray = [30, 41, 59];

    // --- PAGE 1: HEADER & RESUMEN SEMANAL ---
    // Header Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('AGENDA DEVOCIONAL R07', 105, 14, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('«PASA TIEMPO CONMIGO» • DIARIO ESPIRITUAL SEMANAL', 105, 22, { align: 'center' });

    // Gold accent line
    doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setLineWidth(1.2);
    doc.line(0, 32, 210, 32);

    // Profile & Week Info Box
    let yPos = 40;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, yPos, 182, 26, 3, 3, 'FD');

    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`DISCÍPULO/A:`, 18, yPos + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${profile.displayName || 'No especificado'}`, 46, yPos + 7);

    doc.setFont('helvetica', 'bold');
    doc.text(`LÍDER / MENTOR:`, 115, yPos + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${profile.leaderName || 'Sin asignar'}`, 150, yPos + 7);

    doc.setFont('helvetica', 'bold');
    doc.text(`GRUPO / IGLESIA:`, 18, yPos + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(`${profile.groupName || profile.churchName || 'Comunidad Cristiana'}`, 52, yPos + 15);

    doc.setFont('helvetica', 'bold');
    doc.text(`SEMANA N°:`, 115, yPos + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(`${week.weekNumber} (${week.startDate} al ${week.endDate})`, 140, yPos + 15);

    doc.setFont('helvetica', 'bold');
    doc.text(`LEMA SEMANAL:`, 18, yPos + 22);
    doc.setFont('helvetica', 'italic');
    doc.text(`"${week.motto}"`, 48, yPos + 22);

    // Versículo Lema
    yPos += 32;
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, yPos, 182, 20, 2, 2, 'FD');

    doc.setTextColor(180, 83, 9);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`VERSÍCULO CLAVE: ${week.weeklyVerse.reference}`, 18, yPos + 6);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    const verseLines = doc.splitTextToSize(`"${week.weeklyVerse.text}"`, 174);
    doc.text(verseLines, 18, yPos + 12);

    // Goals & Prayers Summary
    yPos += 26;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('METAS SEMANALES Y MOTIVOS DE ORACIÓN', 14, yPos);

    const goalsRows = week.weeklyGoals.map((g, i) => [
      `${i + 1}`,
      g.title,
      g.category.toUpperCase(),
      g.completed ? '[X] Cumplida' : '[ ] En progreso'
    ]);

    autoTable(doc, {
      startY: yPos + 3,
      head: [['#', 'Meta Espiritual / Personal', 'Área', 'Estado']],
      body: goalsRows,
      theme: 'grid',
      headStyles: { fillColor: [107, 33, 168], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 100 },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 37, halign: 'center' }
      },
      margin: { left: 14, right: 14 }
    });

    // Daily Summary Table
    const lastY = (doc as any).lastAutoTable?.finalY || yPos + 40;
    let tableStartY = lastY + 8;

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TABLA GENERAL DE LOS 7 DÍAS (MÉTODO R07)', 14, tableStartY);

    const daysSummaryRows = week.days.map(d => [
      d.dayName,
      d.date,
      `${d.bibleReading.book} ${d.bibleReading.chapter}:${d.bibleReading.verses}`,
      d.rhema ? d.rhema.substring(0, 75) + '...' : 'Pendiente',
      `${d.timeSpentMinutes || 0} min`,
      d.completed ? 'COMPLETADO' : 'PENDIENTE'
    ]);

    autoTable(doc, {
      startY: tableStartY + 3,
      head: [['Día', 'Fecha', 'Pasaje Bíblico', 'Palabra Rhema', 'Tiempo', 'Estado']],
      body: daysSummaryRows,
      theme: 'striped',
      headStyles: { fillColor: [88, 28, 135], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold' },
        1: { cellWidth: 20 },
        2: { cellWidth: 32 },
        3: { cellWidth: 70 },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' }
      },
      margin: { left: 14, right: 14 }
    });

    // --- PAGES FOR DAILY DETAILS ---
    // We group 2-3 days per subsequent page
    for (let pageIdx = 0; pageIdx < 4; pageIdx++) {
      doc.addPage();
      const startDay = pageIdx * 2;
      const endDay = Math.min(startDay + 2, 7);

      // Mini Header
      doc.setFillColor(243, 232, 255);
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(107, 33, 168);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`AGENDA R07 • REGISTRO DIARIO DETALLADO • SEMANA ${week.weekNumber}`, 14, 10);
      doc.text(`${profile.displayName || ''}`, 196, 10, { align: 'right' });

      let currentY = 22;

      if (startDay < 7) {
        for (let dIdx = startDay; dIdx < endDay; dIdx++) {
          const day = week.days[dIdx];
          if (!day) continue;

          doc.setFillColor(107, 33, 168);
          doc.roundedRect(14, currentY, 182, 9, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`DÍA ${dIdx + 1}: ${day.dayName.toUpperCase()} (${day.date}) — LECTURA: ${day.bibleReading.book} ${day.bibleReading.chapter}:${day.bibleReading.verses}`, 18, currentY + 6);
          doc.text(day.completed ? '[CUMPLIDO]' : '[PENDIENTE]', 190, currentY + 6, { align: 'right' });

          currentY += 12;

          // Box for Rhema, Reflection, Application, Prayer
          doc.setDrawColor(203, 213, 225);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(14, currentY, 182, 108, 2, 2, 'FD');

          doc.setTextColor(107, 33, 168);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.text('1. PALABRA RHEMA (Lo que Dios me habló hoy):', 18, currentY + 6);
          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const rhemaText = day.rhema || 'Sin registro aún.';
          const rhemaLines = doc.splitTextToSize(rhemaText, 174);
          doc.text(rhemaLines, 18, currentY + 11);

          const offsetReflec = currentY + 28;
          doc.setTextColor(107, 33, 168);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.text('2. REFLEXIÓN Y MEDITACIÓN:', 18, offsetReflec);
          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const reflecText = day.reflection || 'Sin registro aún.';
          const reflecLines = doc.splitTextToSize(reflecText, 174);
          doc.text(reflecLines, 18, offsetReflec + 5);

          const offsetApp = currentY + 52;
          doc.setTextColor(107, 33, 168);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.text('3. APLICACIÓN PRÁCTICA Y ACCIÓN DE OBEDIENCIA:', 18, offsetApp);
          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const appText = `${day.application ? day.application + '\n' : ''}Acción: ${day.actionItem || 'Acción diaria de obediencia'}`;
          const appLines = doc.splitTextToSize(appText, 174);
          doc.text(appLines, 18, offsetApp + 5);

          const offsetPrayer = currentY + 76;
          doc.setTextColor(107, 33, 168);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.text('4. MI ORACIÓN Y DECLARACIÓN PROFÉTICA:', 18, offsetPrayer);
          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const prayerText = `Oración: ${day.prayerSummary || 'Gratitud y clamor diario'}\nDeclaración: ${day.dailyAffirmation || 'Declaración profética'}`;
          const prayerLines = doc.splitTextToSize(prayerText, 174);
          doc.text(prayerLines, 18, offsetPrayer + 5);

          currentY += 114;
        }
      }

      // On the last page (day 7 & evaluation)
      if (pageIdx === 3) {
        // Weekly Evaluation Box
        currentY = 145;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(14, currentY, 182, 135, 3, 3, 'FD');

        doc.setTextColor(107, 33, 168);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('EVALUACIÓN SEMANAL Y FIRMA DE DISCIPULADO', 18, currentY + 8);

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`Asistencia a Reunión de Iglesia / Célula:`, 18, currentY + 18);
        doc.setFont('helvetica', 'normal');
        doc.text(week.weeklyEvaluation?.attendanceChurch ? 'SÍ [X]' : 'NO [ ]', 100, currentY + 18);

        doc.setFont('helvetica', 'bold');
        doc.text(`Días de Devocional R07 Completados:`, 18, currentY + 26);
        doc.setFont('helvetica', 'normal');
        doc.text(`${week.days.filter(d => d.completed).length} de 7 días`, 100, currentY + 26);

        doc.setFont('helvetica', 'bold');
        doc.text(`Ayuno Semanal Realizado:`, 18, currentY + 34);
        doc.setFont('helvetica', 'normal');
        doc.text(week.weeklyEvaluation?.fastingDone ? 'SÍ [X]' : 'NO [ ]', 100, currentY + 34);

        doc.setFont('helvetica', 'bold');
        doc.text('Testimonio Personal de la Semana:', 18, currentY + 44);
        doc.setFont('helvetica', 'normal');
        const testLines = doc.splitTextToSize(week.weeklyEvaluation?.personalTestimony || 'Sin testimonio registrado.', 174);
        doc.text(testLines, 18, currentY + 50);

        doc.setFont('helvetica', 'bold');
        doc.text('Comentarios y Calificación del Líder:', 18, currentY + 76);
        doc.setFont('helvetica', 'normal');
        const leaderLines = doc.splitTextToSize(week.weeklyEvaluation?.summaryForLeader || 'Evaluación del mentor...', 174);
        doc.text(leaderLines, 18, currentY + 82);

        // Signature lines
        doc.setDrawColor(148, 163, 184);
        doc.line(25, currentY + 120, 85, currentY + 120);
        doc.line(125, currentY + 120, 185, currentY + 120);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Firma del Discípulo/a', 55, currentY + 125, { align: 'center' });
        doc.text('Firma del Líder / Pastor', 155, currentY + 125, { align: 'center' });
      }
    }

    // Save and download
    const fileName = `Agenda_R07_Semana_${week.weekNumber}_${profile.displayName?.replace(/\s+/g, '_') || 'Discipulo'}.pdf`;
    doc.save(fileName);
  }
}
