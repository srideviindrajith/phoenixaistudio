import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'txt' | 'json' | 'zip';
  content: string | { name: string; content: string | Uint8Array }[];
  filename: string;
  title?: string;
  metadata?: Record<string, any>;
}

// CRC-32 checksum calculation for standard ZIP archive compliance
function crc32(data: Uint8Array): number {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Helper to create store-only ZIP archives in pure TS
export function createStoreOnlyZip(files: { name: string; content: string | Uint8Array }[]): Blob {
  const parts: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const filenameBytes = new TextEncoder().encode(file.name);
    const fileData = typeof file.content === 'string' ? new TextEncoder().encode(file.content) : file.content;
    const fileCrc = crc32(fileData);
    const fileSize = fileData.length;

    // 1. Local File Header
    const lfh = new Uint8Array(30 + filenameBytes.length);
    const view = new DataView(lfh.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 10, true);         // Version needed to extract (1.0)
    view.setUint16(6, 0, true);          // General purpose bit flag
    view.setUint16(8, 0, true);          // Compression method (0 = store)
    view.setUint16(10, 0, true);         // Last mod file time
    view.setUint16(12, 0, true);         // Last mod file date
    view.setUint32(14, fileCrc, true);   // CRC-32
    view.setUint32(18, fileSize, true);  // Compressed size
    view.setUint32(22, fileSize, true);  // Uncompressed size
    view.setUint16(26, filenameBytes.length, true); // Filename length
    view.setUint16(28, 0, true);         // Extra field length
    lfh.set(filenameBytes, 30);

    parts.push(lfh);
    parts.push(fileData);

    // 2. Central Directory File Header
    const cdfh = new Uint8Array(46 + filenameBytes.length);
    const cdView = new DataView(cdfh.buffer);

    cdView.setUint32(0, 0x02014b50, true); // Central directory header signature
    cdView.setUint16(4, 20, true);         // Version made by (2.0)
    cdView.setUint16(6, 10, true);         // Version needed to extract (1.0)
    cdView.setUint16(8, 0, true);          // General purpose bit flag
    cdView.setUint16(10, 0, true);         // Compression method (0 = store)
    cdView.setUint16(12, 0, true);         // Last mod file time
    cdView.setUint16(14, 0, true);         // Last mod file date
    cdView.setUint32(16, fileCrc, true);   // CRC-32
    cdView.setUint32(20, fileSize, true);  // Compressed size
    cdView.setUint32(24, fileSize, true);  // Uncompressed size
    cdView.setUint16(28, filenameBytes.length, true); // Filename length
    cdView.setUint16(30, 0, true);         // Extra field length
    cdView.setUint16(32, 0, true);         // File comment length
    cdView.setUint16(34, 0, true);         // Disk number start
    cdView.setUint16(36, 0, true);         // Internal file attributes
    cdView.setUint32(38, 0, true);         // External file attributes
    cdView.setUint32(42, offset, true);    // Local header offset
    cdfh.set(filenameBytes, 46);

    centralDirectory.push(cdfh);

    offset += lfh.length + fileData.length;
  }

  // Calculate size of central directory
  let centralDirectorySize = 0;
  for (const cdfh of centralDirectory) {
    centralDirectorySize += cdfh.length;
  }

  // 3. End of Central Directory Record (EOCD)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // End of central directory signature
  eocdView.setUint16(4, 0, true);          // Number of this disk
  eocdView.setUint16(6, 0, true);          // Disk where central directory starts
  eocdView.setUint16(8, files.length, true); // Central directory records on this disk
  eocdView.setUint16(10, files.length, true); // Total number of central directory records
  eocdView.setUint32(12, centralDirectorySize, true); // Size of central directory
  eocdView.setUint32(16, offset, true);    // Offset of central directory relative to start
  eocdView.setUint16(20, 0, true);         // Comment length

  const allParts = [...parts, ...centralDirectory, eocd];
  return new Blob(allParts, { type: 'application/zip' });
}

export function exportFile(options: ExportOptions): void {
  const { format, content, filename, title, metadata } = options;

  try {
    let blob: Blob;
    let mimeType: string;
    let finalFilename = filename;

    switch (format) {
      case 'zip':
        if (!Array.isArray(content)) {
          throw new Error('ZIP format requires content to be an array of files.');
        }
        blob = createStoreOnlyZip(content);
        mimeType = 'application/zip';
        if (!finalFilename.endsWith('.zip')) {
          finalFilename += '.zip';
        }
        break;

      case 'pdf':
        const pdf = new jsPDF();
        const textContent = typeof content === 'string' ? content : '';
        
        // Add title if provided
        if (title) {
          pdf.setFontSize(20);
          pdf.text(title, 20, 20);
          pdf.setFontSize(12);
          pdf.text(new Date().toLocaleDateString(), 20, 30);
          pdf.setLineWidth(0.5);
          pdf.line(20, 35, 190, 35);
        }

        // Add content
        pdf.setFontSize(11);
        const lines = pdf.splitTextToSize(textContent, 170);
        pdf.text(lines, 20, title ? 45 : 20);

        // Add metadata if provided
        if (metadata) {
          pdf.setFontSize(9);
          pdf.setTextColor(100);
          let yPosition = title ? 45 + (lines.length * 5) + 10 : 20 + (lines.length * 5) + 10;
          Object.entries(metadata).forEach(([key, value]) => {
            pdf.text(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`, 20, yPosition);
            yPosition += 5;
          });
        }

        blob = pdf.output('blob');
        mimeType = 'application/pdf';
        if (!finalFilename.endsWith('.pdf')) {
          finalFilename += '.pdf';
        }
        break;

      case 'docx':
        const docxContentString = typeof content === 'string' ? content : '';
        const docxContent = `${title ? title + '\n\n' : ''}${docxContentString}${metadata ? '\n\n---\nMetadata:\n' + JSON.stringify(metadata, null, 2) : ''}`;
        blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (!finalFilename.endsWith('.docx')) {
          finalFilename += '.docx';
        }
        break;

      case 'txt':
        const txtContentString = typeof content === 'string' ? content : '';
        const txtContent = `${title ? title + '\n\n' : ''}${txtContentString}${metadata ? '\n\n---\nMetadata:\n' + JSON.stringify(metadata, null, 2) : ''}`;
        blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        mimeType = 'text/plain;charset=utf-8';
        if (!finalFilename.endsWith('.txt')) {
          finalFilename += '.txt';
        }
        break;

      case 'json':
        const jsonContentString = typeof content === 'string' ? content : '';
        const jsonData = metadata ? { title, content: jsonContentString, metadata } : { title, content: jsonContentString };
        const jsonContent = JSON.stringify(jsonData, null, 2);
        blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
        mimeType = 'application/json;charset=utf-8';
        if (!finalFilename.endsWith('.json')) {
          finalFilename += '.json';
        }
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function generateFilename(type: 'resume' | 'portfolio' | 'ats' | 'orders', format: string): string {
  const date = new Date().toISOString().split('T')[0];
  const prefix = {
    resume: 'Resume',
    portfolio: 'Portfolio',
    ats: 'ATS_Report',
    orders: 'Orders'
  }[type];

  return `${prefix}_${date}.${format}`;
}
