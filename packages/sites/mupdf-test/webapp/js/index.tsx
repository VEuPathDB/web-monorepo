import React from 'react';
import { createRoot } from 'react-dom/client';
import { PdfTextExtractor } from './PdfTextExtractor';

createRoot(document.querySelector(process.env.ROOT_ELEMENT!)!).render(
  <PdfTextExtractor />
);
