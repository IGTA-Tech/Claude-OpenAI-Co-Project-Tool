import * as pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore - pdf-parse has complex types
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error('Failed to extract text from DOCX')
  }
}

export async function extractTextFromTXT(buffer: Buffer): Promise<string> {
  return buffer.toString('utf-8')
}

export async function extractTextFromCSV(buffer: Buffer): Promise<string> {
  const text = buffer.toString('utf-8')
  // Simple CSV parsing - convert to readable text
  const lines = text.split('\n')
  return lines.join('\n')
}

export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  const type = fileType.toLowerCase()

  if (type.includes('pdf')) {
    return extractTextFromPDF(buffer)
  } else if (type.includes('word') || type.includes('docx')) {
    return extractTextFromDOCX(buffer)
  } else if (type.includes('text') || type.includes('txt')) {
    return extractTextFromTXT(buffer)
  } else if (type.includes('csv')) {
    return extractTextFromCSV(buffer)
  } else {
    throw new Error(`Unsupported file type: ${fileType}`)
  }
}
