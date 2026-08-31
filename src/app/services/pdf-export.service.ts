import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { R07StorageService } from './r07-storage.service';
import { R07DayEntryEntity, R07WeekEntity, R07WeeklyGoalEntity } from '../models/r07.models';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private storage = inject(R07StorageService);

  generateWeeklyPdf(
    week: R07WeekEntity,
    days: R07DayEntryEntity[],
    goals: R07WeeklyGoalEntity[],
    includePhotos: boolean = true
  ): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const isMen = this.storage.edition() === 'MEN';
    const primaryColor: [number, number, number] = isMen ? [13, 71, 161] : [216, 101, 136];
    const secondaryColor: [number, number, number] = isMen ? [25, 118, 210] : [233, 30, 99];
    const headerBg: [number, number, number] = isMen ? [227, 242, 253] : [255, 240, 245];

    // 1. Header Banner
    doc.setFillColor(...headerBg);
    doc.roundedRect(12, 12, 186, 26, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text('R07 • PASA TIEMPO CONMIGO', 20, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const editionText = isMen ? 'Edición Hombres ⚔️' : 'Edición Mujeres 🌸';
    doc.text(`${week.title} | ${editionText} | ${week.startDate} - ${week.endDate}`, 20, 28);
    doc.text(`Usuario: ${this.storage.userName()} (${this.storage.groupName()} - ${this.storage.churchName()})`, 20, 34);

    // 2. Info Cards: Reading Goal & Prayer Attendance
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, 42, 90, 16, 2, 2, 'FD');
    doc.roundedRect(108, 42, 90, 16, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('META DE LECTURA DE LA SEMANA:', 16, 48);
    doc.text('TIEMPOS DE ORACIÓN:', 112, 48);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const readingText = week.readingGoal ? `${week.readingGoal} (${week.isGoalCompleted ? 'Cumplida' : 'En proceso'})` : 'No asignada';
    doc.text(readingText, 16, 54);
    doc.text(`Asistencia: ${week.prayerAttendanceCount} veces en la semana`, 112, 54);

    // 3. Weekly Goals strip if present
    let currentY = 62;
    if (goals.length > 0) {
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(12, currentY, 186, 12, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('METAS SEMANALES:', 16, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const goalsList = goals.map((g) => `${g.isCompleted ? '[X]' : '[ ]'} ${g.title}`).join('   |   ');
      const truncatedGoals = goalsList.length > 110 ? goalsList.substring(0, 107) + '...' : goalsList;
      doc.text(truncatedGoals, 16, currentY + 9);
      currentY += 16;
    }

    // 4. Main 7-day R07 Table
    const tableData = days.map((day) => {
      let description = '';
      if (day.godSpoke) description += `• Dios me habló: ${day.godSpoke}\n`;
      if (day.reflectionText) description += `• Reflexión: ${day.reflectionText}\n`;
      if (day.actionStep) description += `• Paso de acción: ${day.actionStep}\n`;
      if (day.prayerText) description += `• Oración: ${day.prayerText}`;

      if (!description.trim()) {
        description = '(Sin registro)';
      }

      return [
        `${day.dayName}\n${day.dateText}`,
        day.timeText || '—',
        day.mood ? `${day.moodEmoji || ''} ${day.mood}` : '—',
        day.scriptureRef || '—',
        description.trim()
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['DÍA / FECHA', 'HORA', 'ÁNIMO', 'CITA BÍBLICA', 'DESCRIBE TU R07']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 26, halign: 'center', fontStyle: 'bold', fontSize: 7.5 },
        1: { cellWidth: 16, halign: 'center', fontSize: 7.5 },
        2: { cellWidth: 22, halign: 'center', fontSize: 7.5 },
        3: { cellWidth: 26, fontSize: 7.5 },
        4: { cellWidth: 'auto', fontSize: 7.5 }
      },
      styles: {
        font: 'helvetica',
        overflow: 'linebreak',
        cellPadding: 2,
        valign: 'middle'
      },
      margin: { left: 12, right: 12, bottom: 20 }
    });

    // 5. Church & Connection Group summary footer block
    const finalY = (doc as any).lastAutoTable.finalY + 4;
    if (finalY < 260) {
      doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
      doc.roundedRect(12, finalY, 186, 14, 2, 2, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('GRUPO DE CONEXIÓN & ASISTENCIA A LA IGLESIA:', 16, finalY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Asistió al Grupo: ${week.attendedGroup ? 'Sí' : 'No'} | Día 1 Oración: ${week.attendedPrayerDay1 ? 'Sí' : 'No'} | Día 2 Oración: ${week.attendedPrayerDay2 ? 'Sí' : 'No'} | Culto Dominical: ${week.attendedSundayService ? 'Sí' : 'No'}`,
        16,
        finalY + 10
      );
    }

    // 6. Biblical Verse Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...secondaryColor);
    doc.text('«Pasa tiempo Conmigo y saciaré tu alma» — Jeremías 31:25', 105, 290, { align: 'center' });

    // 7. Attached Photos Annex (if requested and present)
    if (includePhotos) {
      const allPhotos: { dayName: string; uri: string }[] = [];
      for (const day of days) {
        try {
          const uris: string[] = JSON.parse(day.photoUrisJson || '[]');
          for (const uri of uris) {
            allPhotos.push({ dayName: day.dayName, uri });
          }
        } catch {
          // ignore
        }
      }

      if (allPhotos.length > 0) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text('ANEXO: FOTOS DE PÁGINAS DEVOCIONALES R07', 14, 18);

        let photoY = 26;
        for (let i = 0; i < allPhotos.length; i++) {
          const photo = allPhotos[i];
          if (photoY > 220) {
            doc.addPage();
            photoY = 20;
          }

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(60, 60, 60);
          doc.text(`Página Manuscrita - ${photo.dayName}:`, 14, photoY);
          photoY += 4;

          try {
            // Add image if base64 data URL
            if (photo.uri.startsWith('data:image/')) {
              doc.addImage(photo.uri, 'JPEG', 14, photoY, 120, 80);
              photoY += 86;
            }
          } catch (e) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('(Imagen adjunta archivada digitalmente)', 14, photoY + 5);
            photoY += 12;
          }
        }
      }
    }

    return doc;
  }

  downloadPdf(week: R07WeekEntity, days: R07DayEntryEntity[], goals: R07WeeklyGoalEntity[]): void {
    const doc = this.generateWeeklyPdf(week, days, goals);
    const fileName = `R07_${week.title.replace(/\s+/g, '_')}_${this.storage.userName().replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    this.storage.showSnackbar('PDF descargado con éxito.');
  }

  generateTextSummary(week: R07WeekEntity, days: R07DayEntryEntity[], goals: R07WeeklyGoalEntity[]): string {
    return this.generateWhatsAppText(week, days, goals);
  }

  generateWhatsAppText(week: R07WeekEntity, days: R07DayEntryEntity[], goals: R07WeeklyGoalEntity[]): string {
    const isMen = this.storage.edition() === 'MEN';
    const icon = isMen ? '⚔️' : '🌸';
    const completedDays = days.filter((d) => d.isCompleted).length;

    let text = `*R07 • PASA TIEMPO CONMIGO* ${icon}\n`;
    text += `👤 *Nombre:* ${this.storage.userName()}\n`;
    text += `📅 *Semana:* ${week.title} (${week.startDate} - ${week.endDate})\n`;
    text += `📖 *Meta de lectura:* ${week.readingGoal || 'No definida'} ${week.isGoalCompleted ? '✅' : '⏳'}\n`;
    text += `🙏 *Asistencia a oración:* ${week.prayerAttendanceCount} veces\n`;
    text += `📊 *Devocionales completados:* ${completedDays}/7 días\n\n`;

    text += `*RESUMEN DIARIO:*\n`;
    for (const day of days) {
      if (day.isCompleted) {
        text += `• *${day.dayName}* (${day.timeText || 'Mañana'}): ${day.scriptureRef || 'Lectura'} | ${day.moodEmoji || ''} ${day.mood || ''}\n`;
        if (day.reflectionText) {
          const cleanRef = day.reflectionText.substring(0, 100).replace(/\n/g, ' ');
          text += `  _"${cleanRef}${day.reflectionText.length > 100 ? '...' : ''}"_\n`;
        }
      } else {
        text += `• *${day.dayName}:* Pendiente\n`;
      }
    }

    if (goals.length > 0) {
      text += `\n*METAS SEMANALES:*\n`;
      for (const g of goals) {
        text += `${g.isCompleted ? '✅' : '⬜'} ${g.title}\n`;
      }
    }

    text += `\n«Pasa tiempo Conmigo y saciaré tu alma» — Jeremías 31:25`;
    return text;
  }

  shareViaWhatsApp(week: R07WeekEntity, days: R07DayEntryEntity[], goals: R07WeeklyGoalEntity[]): void {
    const text = this.generateWhatsAppText(week, days, goals);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  copyTextToClipboard(week: R07WeekEntity, days: R07DayEntryEntity[], goals: R07WeeklyGoalEntity[]): void {
    const text = this.generateWhatsAppText(week, days, goals);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.storage.showSnackbar('Resumen copiado al portapapeles.');
    }
  }
}
