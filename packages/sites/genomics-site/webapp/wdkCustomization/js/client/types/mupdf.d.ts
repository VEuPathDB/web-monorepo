// Minimal type shim for the `mupdf` package.
//
// Two reasons we hand-declare instead of using mupdf's bundled types:
//  1. mupdf exposes its declarations only via the `exports` map, which this
//     repo's `moduleResolution: "node"` (classic) does not read.
//  2. mupdf 1.27's bundled .d.ts uses the generic `Uint8Array<ArrayBufferLike>`
//     form introduced in TypeScript 5.7; this repo is on TS 4.9, whose lib has a
//     non-generic `Uint8Array`, so importing those declarations fails to compile.
//
// We therefore declare only the small API surface used by extractPdfText.ts.
// At runtime webpack resolves the real module via the `exports` map.
declare module 'mupdf' {
  export class StructuredText {
    asText(): string;
  }

  export class Page {
    toStructuredText(options?: string): StructuredText;
  }

  export class Document {
    static openDocument(
      from: ArrayBuffer | Uint8Array,
      magic?: string
    ): Document;
    countPages(): number;
    loadPage(index: number): Page;
  }
}
