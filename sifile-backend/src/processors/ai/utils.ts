/**
 * Detect the MIME type of a file buffer based on magic numbers (first few bytes).
 */
export function detectMimeType(buffer: Buffer): string {
  // PDF magic number is %PDF- (0x25 0x50 0x44 0x46)
  if (buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf'
  }
  // JPEG magic number is FF D8 FF
  if (buffer.length > 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg'
  }
  // PNG magic number is 89 50 4E 47
  if (buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png'
  }
  // WebP magic number is RIFF ... WEBP (starts with 52 49 46 46, WEBP at bytes 8-11)
  if (buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp'
  }
  
  // Default to application/pdf since it is the primary document type
  return 'application/pdf'
}
