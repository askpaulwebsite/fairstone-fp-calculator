import { pdf } from '@react-pdf/renderer';

// Generate a PDF from a react-pdf element and trigger a direct file download.
export async function downloadPdf(element, fileName) {
  const blob = await pdf(element).toBlob(); // v4: returns a Promise<Blob>
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a); // Firefox needs the node in the DOM
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
