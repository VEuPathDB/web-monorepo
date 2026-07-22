// Client-side PDF text extraction for the AI gene-publication upload path.
//
// The PDF never leaves the browser: we extract its text with MuPDF.js (WASM,
// lazy-loaded only when this module runs) and compute a SHA-256 of the original
// bytes via Web Crypto. Only `paperText` + `pdfContentSha256` are sent to the
// server. The MuPDF API used here matches the validated spike (branch
// feature-test-mupdf / PR #1700).

export type PdfExtractionStage = 'loading-reader' | 'hashing' | 'extracting';

export interface PdfExtractionProgress {
  stage: PdfExtractionStage;
  // Populated while stage === 'extracting' so the view can show a page counter.
  pagesDone?: number;
  pageCount?: number;
}

export interface PdfExtractionSuccess {
  type: 'success';
  paperText: string;
  pdfContentSha256: string; // hex SHA-256 of the original PDF bytes
  pageCount: number;
  characterCount: number;
}

export interface PdfExtractionFailure {
  type: 'error';
  // 'no-text'     — opened fine but yielded no extractable text (scanned/image-only)
  // 'load-failed' — could not open/parse the file (corrupt, password-protected, not a PDF)
  reason: 'no-text' | 'load-failed';
  message: string; // user-facing default; the view may override per `reason`
}

export type PdfExtractionResult = PdfExtractionSuccess | PdfExtractionFailure;

const COULD_NOT_READ_MESSAGE =
  "We couldn't extract any text from that PDF. It may be scanned (image-only) " +
  'or password-protected. Try a different file, or use a PubMed ID instead.';

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Extract text from a user-selected PDF entirely in the browser.
 *
 * Resolves to a discriminated `PdfExtractionResult` — never rejects — so the
 * caller can render the error inline without a try/catch. Progress is reported
 * through the optional `onProgress` callback so the view can show the
 * "Preparing PDF reader…" / "Extracting text…" indicators.
 */
export async function extractPdfText(
  file: File,
  onProgress?: (progress: PdfExtractionProgress) => void
): Promise<PdfExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Lazy-load MuPDF.js. The dynamic import keeps the WASM bundle out of the
  //    initial page load — it's only fetched when the user actually picks a file.
  onProgress?.({ stage: 'loading-reader' });
  let mupdf: typeof import('mupdf');
  try {
    mupdf = await import('mupdf');
  } catch {
    return {
      type: 'error',
      reason: 'load-failed',
      message: 'Could not load the PDF reader. Please try again in a moment.',
    };
  }

  // 2. Compute the SHA-256 over the original bytes (provenance / dedupe key).
  onProgress?.({ stage: 'hashing' });
  const pdfContentSha256 = await sha256Hex(arrayBuffer);

  // 3. Open the document and concatenate per-page text.
  let doc: ReturnType<typeof mupdf.Document.openDocument>;
  try {
    doc = mupdf.Document.openDocument(
      new Uint8Array(arrayBuffer),
      'application/pdf'
    );
  } catch {
    return {
      type: 'error',
      reason: 'load-failed',
      message: COULD_NOT_READ_MESSAGE,
    };
  }

  try {
    const pageCount = doc.countPages();
    const chunks: string[] = [];
    for (let i = 0; i < pageCount; i++) {
      onProgress?.({ stage: 'extracting', pagesDone: i, pageCount });
      const page = doc.loadPage(i);
      chunks.push(page.toStructuredText('preserve-whitespace').asText());
    }
    const paperText = chunks.join('\n\n').trim();
    if (paperText.length === 0) {
      return {
        type: 'error',
        reason: 'no-text',
        message: COULD_NOT_READ_MESSAGE,
      };
    }
    return {
      type: 'success',
      paperText,
      pdfContentSha256,
      pageCount,
      characterCount: paperText.length,
    };
  } catch {
    return {
      type: 'error',
      reason: 'load-failed',
      message: COULD_NOT_READ_MESSAGE,
    };
  }
}
