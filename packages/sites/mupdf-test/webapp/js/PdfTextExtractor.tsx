import React, { useRef, useState } from 'react';

export function PdfTextExtractor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setText(null);
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // @ts-ignore — mupdf ships types via `exports` field; not found by moduleResolution:node
      const mupdf = await import('mupdf');
      const doc = mupdf.Document.openDocument(
        new Uint8Array(arrayBuffer),
        'application/pdf'
      );
      const pages = doc.countPages();
      const chunks: string[] = [];
      for (let i = 0; i < pages; i++) {
        const page = doc.loadPage(i);
        chunks.push(page.toStructuredText('preserve-whitespace').asText());
      }
      setText(chunks.join('\n\n--- page break ---\n\n'));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>PDF Text Extractor (mupdf spike)</h1>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {loading && <p>Extracting text…</p>}
      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</pre>
      )}
      {text != null && (
        <pre
          style={{
            marginTop: '1rem',
            padding: '0.5rem',
            background: '#f4f4f4',
            border: '1px solid #ccc',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          {text}
        </pre>
      )}
    </div>
  );
}
