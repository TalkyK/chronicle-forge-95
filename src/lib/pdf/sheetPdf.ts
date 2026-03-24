import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type PdfField = {
  label: string;
  value: string | null | undefined;
};

type StoryPdfData = {
  title?: string;
  name: string;
  codename: string;
  ageRange: string;
  personalities: string[];
  ability: string;
  storyRole: string;
  archetype: string;
  motivation: string;
  relations: string;
  avatarFile?: File | null;
};

type RpgPdfData = {
  title?: string;
  name: string;
  system: string;
  notes: string;
  attributes: Array<{ label: string; value: string }>;
  skills: Array<{ name: string; description: string }>;
  inventory: Array<{ name: string; quantity: number; weight: string; notes: string; equipped: boolean }>;
  avatarFile?: File | null;
};

const A4 = { width: 595.28, height: 841.89 };

function sanitizeFileName(input: string): string {
  return input
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function downloadBytesAsPdf(bytes: Uint8Array, fileName: string) {
  // Garante ArrayBuffer (evita incompatibilidade de types quando bytes é Uint8Array<ArrayBufferLike>)
  const safe = new Uint8Array(bytes);
  const arrayBuffer = safe.buffer.slice(safe.byteOffset, safe.byteOffset + safe.byteLength);
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function embedAvatar(doc: PDFDocument, file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type === "image/png") return doc.embedPng(bytes);
  if (file.type === "image/jpeg" || file.type === "image/jpg") return doc.embedJpg(bytes);

  // fallback: tenta como PNG primeiro, depois JPG
  try {
    return await doc.embedPng(bytes);
  } catch {
    return doc.embedJpg(bytes);
  }
}

type WriterOptions = {
  title: string;
  subtitle?: string;
  avatarFile?: File | null;
  sections: Array<{ heading: string; fields: PdfField[]; lines?: string[] }>;
  fileBaseName: string;
};

export async function generateSheetPdf(options: WriterOptions) {
  const doc = await PDFDocument.create();

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const lineGap = 4;

  let page = doc.addPage([A4.width, A4.height]);
  let y = A4.height - margin;

  const textColor = rgb(0.12, 0.12, 0.14);
  const mutedColor = rgb(0.35, 0.35, 0.40);

  const ensureSpace = (need: number) => {
    if (y - need >= margin) return;
    page = doc.addPage([A4.width, A4.height]);
    y = A4.height - margin;
  };

  const drawWrapped = (text: string, x: number, size: number, bold = false, color = textColor, maxWidth?: number) => {
    const font = bold ? fontBold : fontRegular;
    const width = maxWidth ?? A4.width - margin - x;
    const words = text.split(/\s+/).filter(Boolean);

    let line = "";
    const lines: string[] = [];

    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= width) {
        line = next;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);

    for (const l of lines) {
      ensureSpace(size + lineGap);
      page.drawText(l, { x, y, size, font, color });
      y -= size + lineGap;
    }
  };

  // Header
  ensureSpace(64);
  page.drawText(options.title, { x: margin, y, size: 20, font: fontBold, color: textColor });

  // Avatar no canto superior direito (opcional)
  if (options.avatarFile) {
    try {
      const img = await embedAvatar(doc, options.avatarFile);
      const maxW = 120;
      const maxH = 160;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = A4.width - margin - w;
      const topY = y + 18;
      page.drawImage(img, { x, y: topY - h, width: w, height: h });
    } catch {
      // se falhar, ignora a imagem
    }
  }

  y -= 28;

  if (options.subtitle) {
    drawWrapped(options.subtitle, margin, 11, false, mutedColor);
    y -= 6;
  }

  for (const section of options.sections) {
    ensureSpace(24);
    page.drawText(section.heading, { x: margin, y, size: 13, font: fontBold, color: textColor });
    y -= 18;

    for (const field of section.fields) {
      const label = field.label.trim();
      const value = (field.value ?? "").toString().trim();
      if (!label && !value) continue;

      ensureSpace(14);
      page.drawText(`${label}:`, { x: margin, y, size: 10.5, font: fontBold, color: mutedColor });
      const valueX = margin + 110;
      drawWrapped(value || "—", valueX, 10.5, false, textColor, A4.width - margin - valueX);
    }

    if (section.lines?.length) {
      for (const line of section.lines) {
        if (!line.trim()) continue;
        drawWrapped(`• ${line}`, margin + 8, 10.5, false, textColor, A4.width - margin - (margin + 8));
      }
    }

    y -= 10;
  }

  const bytes = await doc.save();
  const fileName = sanitizeFileName(options.fileBaseName) || "ficha";
  downloadBytesAsPdf(bytes, `${fileName}.pdf`);
}

export async function exportStorySheetPdf(data: StoryPdfData) {
  const base = data.name || data.codename || "personagem";

  await generateSheetPdf({
    title: data.title ?? "Ficha de Personagem (Narrativa)",
    subtitle: "Gerado automaticamente pelo sistema",
    avatarFile: data.avatarFile ?? null,
    fileBaseName: `Ficha - ${base}`,
    sections: [
      {
        heading: "Identidade",
        fields: [
          { label: "Nome completo", value: data.name },
          { label: "Codinome/Alcunha", value: data.codename },
          { label: "Faixa etária", value: data.ageRange },
          { label: "Arquétipo", value: data.archetype },
        ],
      },
      {
        heading: "Caracterização",
        fields: [
          { label: "Personalidade (tags)", value: data.personalities.filter(Boolean).join(", ") },
          { label: "Habilidade", value: data.ability },
          { label: "Papel na história", value: data.storyRole },
        ],
      },
      {
        heading: "Motivação",
        fields: [{ label: "Objetivo", value: data.motivation }],
      },
      {
        heading: "Relações",
        fields: [{ label: "Relações com terceiros", value: data.relations }],
      },
    ],
  });
}

export async function exportRpgSheetPdf(data: RpgPdfData) {
  const base = data.name || "personagem";

  const attributesLines = data.attributes
    .filter((a) => a.label.trim() || a.value.trim())
    .map((a) => `${a.label || "Atributo"}: ${a.value || "—"}`);

  const skillsLines = data.skills
    .filter((s) => s.name.trim() || s.description.trim())
    .map((s) => `${s.name || "Perícia"} — ${s.description || ""}`.trim());

  const inventoryLines = data.inventory
    .filter((i) => i.name.trim())
    .map((i) => {
      const equipped = i.equipped ? "(equipado)" : "";
      const qty = i.quantity ? `x${i.quantity}` : "";
      const w = i.weight ? `· ${i.weight}` : "";
      const notes = i.notes ? `— ${i.notes}` : "";
      return `${i.name} ${qty} ${equipped} ${w} ${notes}`.replace(/\s+/g, " ").trim();
    });

  await generateSheetPdf({
    title: data.title ?? "Ficha de Personagem (RPG)",
    subtitle: "Gerado automaticamente pelo sistema",
    avatarFile: data.avatarFile ?? null,
    fileBaseName: `Ficha RPG - ${base}`,
    sections: [
      {
        heading: "Informações básicas",
        fields: [
          { label: "Nome", value: data.name },
          { label: "Sistema", value: data.system },
          { label: "Notas", value: data.notes },
        ],
      },
      {
        heading: "Atributos",
        fields: [],
        lines: attributesLines.length ? attributesLines : ["—"],
      },
      {
        heading: "Perícias",
        fields: [],
        lines: skillsLines.length ? skillsLines : ["—"],
      },
      {
        heading: "Inventário",
        fields: [],
        lines: inventoryLines.length ? inventoryLines : ["—"],
      },
    ],
  });
}
