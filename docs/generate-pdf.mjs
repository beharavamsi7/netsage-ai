/**
 * generate-pdf.mjs
 *
 * Converts docs/PROJECT_SUMMARY.md into a professionally formatted PDF
 * suitable for Cisco/AICTE project submission.
 * Uses PDFKit — no browser or system dependencies required.
 *
 * Usage: node docs/generate-pdf.mjs
 */

import { readFileSync, mkdirSync, createWriteStream } from "fs";
import { resolve, dirname } from "path";
import PDFDocument from "pdfkit";

const mdPath = resolve("docs/PROJECT_SUMMARY.md");
const pdfPath = resolve("docs/NetSageAI_Project_Summary.pdf");
const md = readFileSync(mdPath, "utf-8");

// ── PDF setup ──────────────────────────────────────────────────────────────

mkdirSync(dirname(pdfPath), { recursive: true });

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 72, bottom: 72, left: 65, right: 65 },
  bufferPages: true,
  info: {
    Title: "NetSage AI — Project Summary",
    Author: "NetSage AI Project",
    Subject: "Applied AI-Assisted Cisco Network Troubleshooting with Human-in-the-Loop Review",
    Keywords: "NetSage AI, Cisco, Network Troubleshooting, Gemini, Human Review",
  },
});

const stream = doc.pipe(createWriteStream(pdfPath));

// ── Font & style config ────────────────────────────────────────────────────

const FONT = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const FONT_ITALIC = "Helvetica-Oblique";
const FONT_BOLD_ITALIC = "Helvetica-BoldOblique";
const FONT_MONO = "Courier";

const COLORS = {
  text: "#1a1a1a",
  heading: "#0a0a0a",
  subheading: "#111111",
  muted: "#555555",
  light: "#888888",
  tableBorder: "#cccccc",
  tableHeader: "#f0f0f0",
  tableAlt: "#f8f8f8",
  codeBg: "#f5f5f5",
  codeBorder: "#dddddd",
  link: "#0066cc",
  hr: "#dddddd",
  black: "#000000",
  white: "#ffffff",
};

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 65;
const MARGIN_RIGHT = 65;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

let y = 0;
let currentPage = 0;

// ── Utility functions ──────────────────────────────────────────────────────

function ensureSpace(needed) {
  if (y + needed > PAGE_HEIGHT - 72) {
    doc.addPage();
    y = 72;
  }
}

function moveTo(x, newY) {
  y = newY;
}

function checkPageBreak(needed) {
  if (y + needed > PAGE_HEIGHT - 72) {
    doc.addPage();
    y = 72;
    return true;
  }
  return false;
}

// ── Title Page ─────────────────────────────────────────────────────────────

function drawTitlePage() {
  // Title
  doc
    .font(FONT_BOLD)
    .fontSize(32)
    .fillColor(COLORS.heading)
    .text("NetSage AI", MARGIN_LEFT, 220, {
      width: CONTENT_WIDTH,
      align: "center",
    });

  // Divider
  y += 15;
  const dividerWidth = 80;
  const dividerX = (PAGE_WIDTH - dividerWidth) / 2;
  doc
    .moveTo(dividerX, y)
    .lineTo(dividerX + dividerWidth, y)
    .lineWidth(1.5)
    .strokeColor(COLORS.hr)
    .stroke();

  y += 30;

  // Subtitle
  doc
    .font(FONT)
    .fontSize(14)
    .fillColor(COLORS.muted)
    .text(
      "Applied AI-Assisted Cisco Network Troubleshooting\nwith Human-in-the-Loop Review",
      MARGIN_LEFT,
      y,
      { width: CONTENT_WIDTH, align: "center", lineGap: 4 }
    );

  y += 80;

  // Meta info
  const meta = [
    ["Project Type", "Applied AI + Network Engineering"],
    ["Domain", "Cisco Packet Tracer & Lab Environments"],
    ["Architecture", "AI Diagnosis · Rule Checking · Human Review"],
    ["Stack", "React · TypeScript · Convex · Gemini · Python"],
    ["Date", "August 2026"],
  ];

  for (const [label, value] of meta) {
    doc
      .font(FONT_BOLD)
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(`${label}: `, MARGIN_LEFT, y, { continued: true, width: CONTENT_WIDTH, align: "center" })
      .font(FONT)
      .text(value, { align: "center" });
    y += 18;
  }

  doc.addPage();
  y = 72;
}

// ── Markdown parser (simplified but sufficient for this document) ──────────

function parseInline(text) {
  // Returns array of {text, font, size, color} segments
  const segments = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Bold + italic
    let match = remaining.match(/^\*\*\*(.+?)\*\*\*/);
    if (match) {
      segments.push({ text: match[1], font: FONT_BOLD_ITALIC });
      remaining = remaining.slice(match[0].length);
      continue;
    }
    // Bold
    match = remaining.match(/^\*\*(.+?)\*\*/);
    if (match) {
      segments.push({ text: match[1], font: FONT_BOLD });
      remaining = remaining.slice(match[0].length);
      continue;
    }
    // Italic
    match = remaining.match(/^\*(.+?)\*/);
    if (match) {
      segments.push({ text: match[1], font: FONT_ITALIC });
      remaining = remaining.slice(match[0].length);
      continue;
    }
    // Inline code
    match = remaining.match(/^`([^`]+)`/);
    if (match) {
      segments.push({ text: match[1], font: FONT_MONO, size: 9 });
      remaining = remaining.slice(match[0].length);
      continue;
    }
    // Link [text](url)
    match = remaining.match(/^\[([^\]]+)\]\([^)]+\)/);
    if (match) {
      segments.push({ text: match[1], font: FONT, color: COLORS.link });
      remaining = remaining.slice(match[0].length);
      continue;
    }
    // Plain text until next special char
    match = remaining.match(/^[^*`\[]+/);
    if (match) {
      segments.push({ text: match[0], font: FONT });
      remaining = remaining.slice(match[0].length);
      continue;
    }
    // Single special char
    segments.push({ text: remaining[0], font: FONT });
    remaining = remaining.slice(1);
  }

  return segments;
}

function drawInlineText(segments, x, startY, options = {}) {
  let cx = x;
  let cy = startY;
  const maxWidth = options.width || CONTENT_WIDTH;
  const fontSize = options.fontSize || 10.5;

  for (const seg of segments) {
    const segSize = seg.size || fontSize;
    const segFont = seg.font || FONT;
    const segColor = seg.color || COLORS.text;

    doc.font(segFont).fontSize(segSize).fillColor(segColor);

    // Split by newlines
    const lines = seg.text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        cx = x;
        cy += segSize * 1.4;
      }
      if (lines[i].length > 0) {
        doc.text(lines[i], cx, cy, {
          width: maxWidth - (cx - x),
          lineBreak: false,
          continued: false,
        });
        cx = doc.x;
      }
    }
  }

  return cy;
}

function measureInlineTextHeight(segments, fontSize = 10.5) {
  let lines = 1;
  for (const seg of segments) {
    const segText = seg.text;
    const newlines = (segText.match(/\n/g) || []).length;
    lines += newlines;
  }
  return lines * fontSize * 1.4;
}

// ── Parse markdown lines ──────────────────────────────────────────────────

const lines = md.split("\n");
let i = 0;

function processBlockquote() {
  const quoteLines = [];
  while (i < lines.length && lines[i].startsWith("> ")) {
    quoteLines.push(lines[i].slice(2));
    i++;
  }
  const text = quoteLines.join("\n");
  ensureSpace(30);
  doc
    .rect(MARGIN_LEFT - 5, y - 2, 3, quoteLines.length * 15 + 10)
    .fill(COLORS.hr);
  doc
    .font(FONT_ITALIC)
    .fontSize(10)
    .fillColor(COLORS.muted);
  doc.text(text, MARGIN_LEFT + 8, y, { width: CONTENT_WIDTH - 15, align: "left" });
  y = doc.y + 8;
}

function processCodeBlock() {
  i++; // skip opening ```
  const codeLines = [];
  while (i < lines.length && !lines[i].startsWith("```")) {
    codeLines.push(lines[i]);
    i++;
  }
  i++; // skip closing ```

  const lineHeight = 12;
  const blockHeight = codeLines.length * lineHeight + 20;

  ensureSpace(Math.min(blockHeight, 200));

  // Background
  doc
    .rect(MARGIN_LEFT - 5, y - 5, CONTENT_WIDTH + 10, blockHeight)
    .fill(COLORS.codeBg)
    .strokeColor(COLORS.codeBorder)
    .lineWidth(0.5)
    .rect(MARGIN_LEFT - 5, y - 5, CONTENT_WIDTH + 10, blockHeight)
    .stroke();

  doc.font(FONT_MONO).fontSize(8.5).fillColor(COLORS.text);
  let codeY = y + 5;
  for (const line of codeLines) {
    if (codeY > PAGE_HEIGHT - 80) {
      doc.addPage();
      y = 72;
      codeY = y + 5;
      // Re-draw background
      doc
        .rect(MARGIN_LEFT - 5, y - 5, CONTENT_WIDTH + 10, (codeLines.length - codeLines.indexOf(line)) * lineHeight + 20)
        .fill(COLORS.codeBg);
    }
    doc.text(line || " ", MARGIN_LEFT + 3, codeY, {
      width: CONTENT_WIDTH - 6,
      lineBreak: false,
    });
    codeY += lineHeight;
  }
  y = codeY + 8;
}

function processTable() {
  const tableLines = [];
  while (i < lines.length && lines[i].startsWith("|")) {
    tableLines.push(lines[i]);
    i++;
  }

  if (tableLines.length < 2) return;

  // Parse headers
  const headers = tableLines[0]
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());

  // Skip separator line (index 1)
  const rows = [];
  for (let r = 2; r < tableLines.length; r++) {
    const cells = tableLines[r]
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    rows.push(cells);
  }

  const numCols = headers.length;
  const colWidth = CONTENT_WIDTH / numCols;
  const rowHeight = 18;
  const headerHeight = 22;
  const totalHeight = headerHeight + rows.length * rowHeight + 5;

  ensureSpace(Math.min(totalHeight, 200));

  // Header
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, headerHeight).fill(COLORS.tableHeader);
  doc.font(FONT_BOLD).fontSize(9).fillColor(COLORS.text);
  for (let c = 0; c < numCols; c++) {
    doc.text(headers[c], MARGIN_LEFT + c * colWidth + 5, y + 6, {
      width: colWidth - 10,
      lineBreak: false,
    });
  }
  y += headerHeight;

  // Border top of header
  doc.moveTo(MARGIN_LEFT, y - headerHeight).lineTo(MARGIN_LEFT + CONTENT_WIDTH, y - headerHeight).lineWidth(0.5).strokeColor(COLORS.tableBorder).stroke();

  // Rows
  for (let r = 0; r < rows.length; r++) {
    checkPageBreak(rowHeight + 5);

    const isAlt = r % 2 === 1;
    if (isAlt) {
      doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, rowHeight).fill(COLORS.tableAlt);
    }

    // Row border
    doc.moveTo(MARGIN_LEFT, y).lineTo(MARGIN_LEFT + CONTENT_WIDTH, y).lineWidth(0.3).strokeColor(COLORS.tableBorder).stroke();

    doc.font(FONT).fontSize(9).fillColor(COLORS.text);
    for (let c = 0; c < numCols; c++) {
      const cellText = rows[r][c] || "";
      // Remove markdown formatting from cell text
      const cleanText = cellText.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1");
      doc.text(cleanText, MARGIN_LEFT + c * colWidth + 5, y + 4, {
        width: colWidth - 10,
        lineBreak: false,
      });
    }
    y += rowHeight;
  }

  // Bottom border
  doc.moveTo(MARGIN_LEFT, y).lineTo(MARGIN_LEFT + CONTENT_WIDTH, y).lineWidth(0.5).strokeColor(COLORS.tableBorder).stroke();

  y += 8;
}

function processList(isOrdered = false) {
  const listItems = [];
  while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
    const text = lines[i].replace(/^\s*[-*]\s+/, "");
    listItems.push(text);
    i++;
  }

  for (let idx = 0; idx < listItems.length; idx++) {
    const bullet = isOrdered ? `${idx + 1}. ` : "•  ";
    const text = listItems[idx];

    // Check for sub-lists (indented items)
    ensureSpace(16);

    // Parse inline formatting in list items
    const segments = parseInline(text);
    const fullText = bullet;

    doc.font(FONT).fontSize(10.5).fillColor(COLORS.text);
    doc.text(bullet, MARGIN_LEFT + 5, y, { continued: true, lineBreak: false, width: CONTENT_WIDTH - 10 });

    // Draw inline segments
    let cx = doc.x;
    for (const seg of segments) {
      doc.font(seg.font || FONT).fontSize(seg.size || 10.5).fillColor(seg.color || COLORS.text);
      doc.text(seg.text, cx, y, { continued: true, lineBreak: false, width: CONTENT_WIDTH - 10 - (cx - MARGIN_LEFT - 5) });
      cx = doc.x;
    }
    y += 16;
  }
}

function processOrderedList() {
  const listItems = [];
  while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
    const text = lines[i].replace(/^\s*\d+\.\s+/, "");
    listItems.push(text);
    i++;
  }

  for (let idx = 0; idx < listItems.length; idx++) {
    const bullet = `${idx + 1}. `;
    const text = listItems[idx];

    ensureSpace(16);

    const segments = parseInline(text);

    doc.font(FONT).fontSize(10.5).fillColor(COLORS.text);
    doc.text(bullet, MARGIN_LEFT + 5, y, { continued: true, lineBreak: false, width: CONTENT_WIDTH - 10 });

    let cx = doc.x;
    for (const seg of segments) {
      doc.font(seg.font || FONT).fontSize(seg.size || 10.5).fillColor(seg.color || COLORS.text);
      doc.text(seg.text, cx, y, { continued: true, lineBreak: false, width: CONTENT_WIDTH - 10 - (cx - MARGIN_LEFT - 5) });
      cx = doc.x;
    }
    y += 16;
  }
}

// ── Main document processing ───────────────────────────────────────────────

drawTitlePage();

// Process all lines
while (i < lines.length) {
  const line = lines[i];

  // Skip empty lines
  if (line.trim() === "") {
    i++;
    continue;
  }

  // Horizontal rule
  if (/^---+$/.test(line.trim())) {
    ensureSpace(20);
    doc
      .moveTo(MARGIN_LEFT, y + 5)
      .lineTo(MARGIN_LEFT + CONTENT_WIDTH, y + 5)
      .lineWidth(0.5)
      .strokeColor(COLORS.hr)
      .stroke();
    y += 16;
    i++;
    continue;
  }

  // Code block
  if (line.startsWith("```")) {
    processCodeBlock();
    continue;
  }

  // Table
  if (line.startsWith("|")) {
    processTable();
    continue;
  }

  // Blockquote
  if (line.startsWith("> ")) {
    processBlockquote();
    continue;
  }

  // Headings
  const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const text = headingMatch[2].replace(/\*\*/g, "");

    if (level === 1) {
      ensureSpace(40);
      // Section heading with underline
      doc.font(FONT_BOLD).fontSize(18).fillColor(COLORS.heading);
      doc.text(text, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
      y += 2;
      doc
        .moveTo(MARGIN_LEFT, y)
        .lineTo(MARGIN_LEFT + CONTENT_WIDTH, y)
        .lineWidth(1.2)
        .strokeColor(COLORS.hr)
        .stroke();
      y += 14;
    } else if (level === 2) {
      ensureSpace(30);
      doc.font(FONT_BOLD).fontSize(14).fillColor(COLORS.subheading);
      doc.text(text, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
      y += 6;
    } else if (level === 3) {
      ensureSpace(22);
      doc.font(FONT_BOLD).fontSize(11.5).fillColor(COLORS.subheading);
      doc.text(text, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
      y += 4;
    } else {
      ensureSpace(18);
      doc.font(FONT_BOLD).fontSize(10.5).fillColor(COLORS.text);
      doc.text(text, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
      y += 4;
    }
    i++;
    continue;
  }

  // Ordered list
  if (/^\s*\d+\.\s/.test(line)) {
    processOrderedList();
    continue;
  }

  // Unordered list
  if (/^\s*[-*]\s/.test(line)) {
    processList();
    continue;
  }

  // Regular paragraph
  const segments = parseInline(line);
  ensureSpace(16);

  let cx = MARGIN_LEFT;
  for (const seg of segments) {
    const segFont = seg.font || FONT;
    const segSize = seg.size || 10.5;
    const segColor = seg.color || COLORS.text;

    doc.font(segFont).fontSize(segSize).fillColor(segColor);

    if (seg.text.includes("\n")) {
      const parts = seg.text.split("\n");
      for (let p = 0; p < parts.length; p++) {
        if (p > 0) {
          cx = MARGIN_LEFT;
          y += segSize * 1.4;
        }
        if (parts[p].length > 0) {
          doc.text(parts[p], cx, y, {
            width: CONTENT_WIDTH - (cx - MARGIN_LEFT),
            lineBreak: false,
          });
          cx = doc.x;
        }
      }
    } else if (seg.text.length > 0) {
      doc.text(seg.text, cx, y, {
        width: CONTENT_WIDTH - (cx - MARGIN_LEFT),
        lineBreak: false,
      });
      cx = doc.x;
    }
  }
  y += 16;
  i++;
}

// ── Add page numbers ──────────────────────────────────────────────────────

const pageCount = doc.bufferedPageRange().count;
for (let p = 0; p < pageCount; p++) {
  doc.switchToPage(p);

  // Skip page number on title page
  if (p === 0) continue;

  doc
    .font(FONT)
    .fontSize(9)
    .fillColor(COLORS.light)
    .text(
      `${p} / ${pageCount - 1}`,
      MARGIN_LEFT,
      PAGE_HEIGHT - 50,
      { width: CONTENT_WIDTH, align: "center" }
    );
}

doc.end();

console.log(`PDF generated: ${pdfPath}`);
console.log(`Pages: ${pageCount}`);
