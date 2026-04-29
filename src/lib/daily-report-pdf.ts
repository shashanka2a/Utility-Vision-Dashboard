/**
 * Rasterizes a DOM subtree (e.g. daily report `<body>`) into a multi-page A4 PDF.
 * Used from `/reports/full` after the report iframe loads (same-origin).
 * Dynamic-imports heavy deps so the full-report page stays lean until download.
 */
export async function downloadElementAsMultiPagePdf(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidthMm = pageWidth;
  const sliceHeightPx = (pageHeight * canvas.width) / imgWidthMm;

  let y = 0;
  let first = true;

  while (y < canvas.height) {
    const sliceH = Math.min(sliceHeightPx, canvas.height - y);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceH;
    const ctx = pageCanvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available');

    ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    const imgData = pageCanvas.toDataURL('image/png', 0.92);
    const sliceMmH = (sliceH * imgWidthMm) / canvas.width;

    if (!first) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, sliceMmH);
    first = false;
    y += sliceH;
  }

  pdf.save(fileName);
}

export function sanitizePdfFileName(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'report';
}
