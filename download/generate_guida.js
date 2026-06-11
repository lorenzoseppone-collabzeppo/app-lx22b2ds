const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } = require("docx");
const fs = require("fs");

const DOCX_SCRIPTS = "/home/z/my-project/skills/docx/scripts";

async function main() {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1200, bottom: 1000, left: 1100, right: 1100 },
        }
      },
      children: [
        // TITOLO
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "\u{1F4C5} GUIDA ALL'APP TURNAZIONI", bold: true, size: 40, color: "2563eb", font: "Calibri" }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ text: "Istruzioni per l'uso", size: 24, color: "64748b", font: "Calibri" }),
          ]
        }),

        // LINK
        new Paragraph({
          spacing: { before: 200, after: 100 },
          shading: { type: ShadingType.CLEAR, fill: "eff6ff" },
          children: [
            new TextRun({ text: "  LINK DELL'APP:  ", bold: true, size: 22, color: "1e40af", font: "Calibri" }),
            new TextRun({ text: "https://lorenzoseppone-collabzeppo.github.io/app-lx22b2ds/turnazioni.html", size: 20, color: "2563eb", font: "Calibri" }),
          ]
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({ text: "(Copia questo link e incollalo nel browser del telefono o computer)", size: 18, color: "64748b", italics: true, font: "Calibri" }),
          ]
        }),

        // SEZIONE 1
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({ text: "1. COSA FA L'APP", bold: true, size: 26, color: "2563eb", font: "Calibri" }),
          ]
        }),
        ...[
          "L'app genera automaticamente i turni di lavoro per un intero mese.",
          "Ogni persona ha il suo orario personalizzato (non tutto il gruppo insieme).",
          "I turni ruotano ogni settimana: il Gruppo A diventa B, il B diventa C, il C diventa A.",
          "I giorni di riposo sono assegnati a persone di gruppi diversi.",
          "Chi riposa ha una persona reperibile per le emergenze.",
        ].map(t => new Paragraph({
          spacing: { after: 80 },
          indent: { left: 300 },
          children: [
            new TextRun({ text: "\u2022  ", size: 22, font: "Calibri" }),
            new TextRun({ text: t, size: 22, font: "Calibri" }),
          ]
        })),

        // SEZIONE 2
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({ text: "2. COME NAVIGARE NELL'APP", bold: true, size: 26, color: "2563eb", font: "Calibri" }),
          ]
        }),
        ...[
          { icon: "\u{1F4C5}", title: "CALENDARIO", desc: "Vedi il mese con i turni di ogni giorno. Clicca su un giorno per vedere tutti i dettagli." },
          { icon: "\u{1F4C6}", title: "SETTIMANA", desc: "Vedi la settimana con l'orario esatto di ogni persona (entrata e uscita)." },
          { icon: "\u{1F4CA}", title: "COPERTURE", desc: "Controlla quante persone ci sono in ogni fascia oraria. Dalle 9:30 alle 15:30 DEVONO esserci almeno 6 persone." },
          { icon: "\u23F1\uFE0F", title: "ORE", desc: "Vedi le ore lavorate da ogni persona nel mese. L'obiettivo \u00E8 138 ore." },
          { icon: "\u2699\uFE0F", title: "IMPOSTAZIONI", desc: "Cambia variante (8 persone + Jolly oppure 9 persone 3+3+3), ore target, giorni di riposo." },
        ].map(t => new Paragraph({
          spacing: { after: 100 },
          indent: { left: 300 },
          children: [
            new TextRun({ text: `${t.icon}  `, size: 22, font: "Calibri" }),
            new TextRun({ text: t.title + ": ", bold: true, size: 22, font: "Calibri" }),
            new TextRun({ text: t.desc, size: 22, font: "Calibri" }),
          ]
        })),

        // SEZIONE 3
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({ text: "3. COME SONO ORGANIZZATI I TURNI", bold: true, size: 26, color: "2563eb", font: "Calibri" }),
          ]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Ogni persona ha un orario diverso dentro il suo gruppo. Esempio per la 1\u00AA settimana:", size: 22, font: "Calibri" }),
          ]
        }),

        // TABELLA
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: ["Gruppo", "Persona", "Orario", "Stato"].map(h =>
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: "2563eb" },
                  margins: { top: 60, bottom: 60, left: 100, right: 100 },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 20, color: "ffffff", font: "Calibri" })] })]
                })
              )
            }),
            // Gruppo A
            ...([
              ["A", "A1", "7:30 - 15:00", "Lavoro"],
              ["A", "A2", "9:00 - 16:30", "Lavoro"],
              ["B", "B1", "8:00 - 15:30", "Lavoro"],
              ["B", "B2", "9:30 - 17:00", "Lavoro"],
              ["B", "B3", "\u2014", "Riposo"],
              ["C", "C1", "8:30 - 16:00", "Lavoro"],
              ["C", "C2", "9:30 - 17:30", "Lavoro"],
              ["C", "C3", "\u2014", "Riposo"],
              ["Jolly", "Jolly", "16:30 - 18:00", "Fisso + sostituzioni"],
            ]).map((row, idx) =>
              new TableRow({
                children: row.map((cell, ci) =>
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? "f8fafc" : "ffffff" },
                    margins: { top: 40, bottom: 40, left: 100, right: 100 },
                    children: [new Paragraph({
                      alignment: ci === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                      children: [new TextRun({
                        text: cell,
                        size: 20,
                        bold: ci === 0,
                        color: ci === 0 ? (cell === "A" ? "ef4444" : cell === "B" ? "3b82f6" : cell === "C" ? "10b981" : cell === "Jolly" ? "f59e0b" : "1e293b") : "1e293b",
                        font: "Calibri"
                      })]
                    })]
                  })
                )
              })
            )
          ]
        }),

        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({ text: "La settimana dopo i gruppi ruotano: A diventa B, B diventa C, C diventa A.", size: 22, font: "Calibri" }),
          ]
        }),

        // SEZIONE 4
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({ text: "4. LE REGOLE DEI RIPOSI", bold: true, size: 26, color: "2563eb", font: "Calibri" }),
          ]
        }),
        ...[
          "2 persone a riposo per giorno, da gruppi diversi (mai A1 + A2 insieme a riposo).",
          "Di queste 2, una rimane REPERIBILE (pronta a tornare se qualcuno si ammala).",
          "I riposi sono distribuiti equamente nel mese.",
          "Se uno si ammala e non c'\u00E8 il Jolly, il reperibile deve coprire il turno.",
        ].map(t => new Paragraph({
          spacing: { after: 80 },
          indent: { left: 300 },
          children: [
            new TextRun({ text: "\u2022  ", size: 22, font: "Calibri" }),
            new TextRun({ text: t, size: 22, font: "Calibri" }),
          ]
        })),

        // SEZIONE 5
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({ text: "5. SCARICARE L'EXCEL", bold: true, size: 26, color: "2563eb", font: "Calibri" }),
          ]
        }),
        ...[
          "Vai sulla tab \u201CCalendario\u201D.",
          "Clicca il bottone verde \u201CScarica Excel\u201D in fondo alla pagina.",
          "Si scarica un file con tutti i turni del mese, le ore per persona e il confronto con il target di 138 ore.",
          "Puoi aprire il file con Excel, Google Sheets o Numbers.",
        ].map(t => new Paragraph({
          spacing: { after: 80 },
          indent: { left: 300 },
          children: [
            new TextRun({ text: "\u2022  ", size: 22, font: "Calibri" }),
            new TextRun({ text: t, size: 22, font: "Calibri" }),
          ]
        })),

        // SEZIONE 6
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({ text: "6. VARIANTE 9 PERSONE (SENZA JOLLY)", bold: true, size: 26, color: "2563eb", font: "Calibri" }),
          ]
        }),
        ...[
          "Vai sulla tab \u201CImpostazioni\u201D (l'ingranaggio \u2699\uFE0F in basso).",
          "Clicca il bottone \u201C9 persone (3+3+3)\u201D.",
          "I gruppi diventano: A1-A2-A3, B1-B2-B3, C1-C2-C3.",
          "Non c'\u00E8 pi\u00F9 il Jolly: se uno si ammala, il reperibile copre.",
        ].map(t => new Paragraph({
          spacing: { after: 80 },
          indent: { left: 300 },
          children: [
            new TextRun({ text: "\u2022  ", size: 22, font: "Calibri" }),
            new TextRun({ text: t, size: 22, font: "Calibri" }),
          ]
        })),

        // SEZIONE 7
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({ text: "7. COSE DA SAPERE", bold: true, size: 26, color: "2563eb", font: "Calibri" }),
          ]
        }),
        ...[
          "L'app funziona su telefono, tablet e computer.",
          "I dati sono salvati sul tuo dispositivo. Se cambi telefono, le impostazioni vanno rimesse.",
          "Per modificare i nomi delle persone (es. A1 = Maria), chiedi a Lorenzo.",
          "Per cambiare la logica dei turni, chiedi a Lorenzo.",
          "Il bottone \u201CReset Tutto\u201D nelle impostazioni cancella tutto e ricomincia da capo.",
        ].map(t => new Paragraph({
          spacing: { after: 80 },
          indent: { left: 300 },
          children: [
            new TextRun({ text: "\u2022  ", size: 22, font: "Calibri" }),
            new TextRun({ text: t, size: 22, font: "Calibri" }),
          ]
        })),

        // NOTA FINALE
        new Paragraph({
          spacing: { before: 400 },
          shading: { type: ShadingType.CLEAR, fill: "fef3c7" },
          children: [
            new TextRun({ text: "  \u26A0\uFE0F DOMANDE O PROBLEMI? Contatta Lorenzo che pu\u00F2 modificare l'app secondo le tue esigenze.", bold: true, size: 20, color: "92400e", font: "Calibri" }),
          ]
        }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/download/Guida_Turnazioni.docx", buffer);
  console.log("Documento creato: /home/z/my-project/download/Guida_Turnazioni.docx");
}

main().catch(console.error);
