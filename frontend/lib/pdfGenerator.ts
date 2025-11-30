import jsPDF from 'jspdf'
import { registerMalgunFont } from './fontLoader'

interface Sentence {
  english: string
  korean: string
}

interface Paragraph {
  sentences: Sentence[]
}

interface Word {
  id: number
  word: string
  meaning: string
  study_id?: number | null
  known: boolean
}

interface TranslationData {
  paragraphs: Paragraph[]
  words?: Word[]
}

// 텍스트를 여러 줄로 나누는 함수 (PDF 너비에 맞게, 한글 지원)
function splitText(doc: jsPDF, text: string, maxWidth: number, fontSize: number = 12): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = doc.getTextWidth(testLine)
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines.length > 0 ? lines : [text]
}

// Step 2용 PDF 생성
export async function generatePDFStep2(
  title: string,
  translationData: TranslationData,
  onProgress?: (progress: number) => void
): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  const logoSize = 7.5 // 절반으로 줄임
  
  let yPos = margin + logoSize + 10
  let pageNum = 1
  let totalPages = 1

  // 맑은고딕 폰트 등록
  const fontRegistered = await registerMalgunFont(doc)
  const koreanFont = fontRegistered ? 'malgun' : 'helvetica'

  // 로고 이미지 로드 (한 번만 로드)
  let logoImage: HTMLImageElement | null = null
  const loadLogo = async (): Promise<HTMLImageElement | null> => {
    if (logoImage) return logoImage
    
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        logoImage = img
        resolve(img)
      }
      img.onerror = () => {
        resolve(null)
      }
      img.src = '/myling_logo.png'
    })
  }

  // 페이지 헤더 (로고)
  const addPageHeader = async () => {
    const logo = await loadLogo()
    if (logo && logo.complete && logo.naturalWidth > 0) {
      const logoHeight = 15
      const logoWidth = (logo.width / logo.height) * logoHeight
      doc.addImage(logo, 'PNG', margin, margin, logoWidth, logoHeight)
    } else {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('MyLing', margin, margin + 5)
    }
  }

  // 페이지 푸터 (페이지 번호)
  const addPageFooter = (currentPage: number, total: number) => {
    if (total >= 2) {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      const pageText = `${currentPage}`
      const textWidth = doc.getTextWidth(pageText)
      doc.text(pageText, pageWidth - margin - textWidth, pageHeight - margin)
    }
  }

  await addPageHeader()

  // 제목 추가 (크고 두껍게)
  doc.setFontSize(20)
  doc.setFont(koreanFont, 'bold')
  doc.setTextColor(0, 0, 0)
  const titleLines = splitText(doc, title, contentWidth, 20)
  for (const line of titleLines) {
    if (yPos + 15 > pageHeight - margin - 20) {
      addPageFooter(pageNum, totalPages)
      doc.addPage()
      pageNum++
      totalPages = pageNum
      await addPageHeader()
      yPos = margin + logoSize + 10
    }
    doc.text(line, margin, yPos)
    yPos += 10
  }
  
  yPos += 10 // 제목과 본문 사이 간격

  // 본문 추가
  doc.setFontSize(10) // 10으로 고정
  
  for (const paragraph of translationData.paragraphs) {
    for (const sentence of paragraph.sentences) {
      // 영어 문장
      doc.setFont('helvetica', 'normal')
      const englishLines = splitText(doc, sentence.english, contentWidth, 10)
      for (const line of englishLines) {
        if (yPos + 15 > pageHeight - margin - 20) {
          addPageFooter(pageNum, totalPages)
          doc.addPage()
          pageNum++
          totalPages = pageNum
          await addPageHeader()
          yPos = margin + logoSize + 10
        }
        doc.setTextColor(0, 0, 0)
        doc.text(line, margin, yPos)
        yPos += 7
      }
      
      // 한국어 문장
      doc.setFont(koreanFont, 'normal')
      const koreanLines = splitText(doc, sentence.korean, contentWidth, 10)
      for (const line of koreanLines) {
        if (yPos + 15 > pageHeight - margin - 20) {
          addPageFooter(pageNum, totalPages)
          doc.addPage()
          pageNum++
          totalPages = pageNum
          await addPageHeader()
          yPos = margin + logoSize + 10
        }
        doc.setTextColor(100, 100, 100)
        doc.text(line, margin, yPos)
        yPos += 7
      }
      
      yPos += 5 // 문장 사이 간격
    }
    
    yPos += 5 // 문단 사이 간격
  }

  // 모든 페이지에 페이지 번호 추가
  totalPages = pageNum
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addPageFooter(i, totalPages)
  }

  // PDF 저장
  doc.save(`${title || 'document'}.pdf`)
}

// Step 3용 PDF 생성 (단어 포함)
export async function generatePDFStep3(
  title: string,
  translationData: TranslationData,
  words: Word[],
  onProgress?: (progress: number) => void
): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  const rightColumnWidth = contentWidth * 0.3
  const leftColumnWidth = contentWidth * 0.65
  const rightColumnStart = margin + leftColumnWidth + contentWidth * 0.05
  const logoSize = 7.5 // 절반으로 줄임
  
  let yPos = margin + logoSize + 10
  let pageNum = 1
  let totalPages = 1

  // 맑은고딕 폰트 등록
  const fontRegistered = await registerMalgunFont(doc)
  const koreanFont = fontRegistered ? 'malgun' : 'helvetica'

  // 문단별 단어 매핑
  const wordsByParagraph: { [key: number]: Word[] } = {}
  words.forEach(word => {
    for (let pIndex = 0; pIndex < translationData.paragraphs.length; pIndex++) {
      const paragraph = translationData.paragraphs[pIndex]
      const found = paragraph.sentences.some(sentence => 
        sentence.english.toLowerCase().includes(word.word.toLowerCase())
      )
      if (found) {
        if (!wordsByParagraph[pIndex]) {
          wordsByParagraph[pIndex] = []
        }
        wordsByParagraph[pIndex].push(word)
        break
      }
    }
  })

  // 로고 이미지 로드
  let logoImage: HTMLImageElement | null = null
  const loadLogo = async (): Promise<HTMLImageElement | null> => {
    if (logoImage) return logoImage
    
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        logoImage = img
        resolve(img)
      }
      img.onerror = () => {
        resolve(null)
      }
      img.src = '/myling_logo.png'
    })
  }

  // 페이지 헤더 (로고 + 연보라색 선)
  const addPageHeader = async () => {
    // 연보라색 선 추가 (페이지 상단)
    doc.setDrawColor(196, 179, 255) // 연보라색 RGB: #C4B3FF
    doc.setLineWidth(2)
    doc.line(margin, margin + logoSize + 5, pageWidth - margin, margin + logoSize + 5)
    
    const logo = await loadLogo()
    if (logo && logo.complete && logo.naturalWidth > 0) {
      const logoHeight = 7.5 // 절반으로 줄임
      const logoWidth = (logo.width / logo.height) * logoHeight
      doc.addImage(logo, 'PNG', margin, margin, logoWidth, logoHeight)
    } else {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('MyLing', margin, margin + 5)
    }
  }

  // 페이지 푸터 (페이지 번호)
  const addPageFooter = (currentPage: number, total: number) => {
    if (total >= 2) {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      const pageText = `${currentPage}`
      const textWidth = doc.getTextWidth(pageText)
      doc.text(pageText, pageWidth - margin - textWidth, pageHeight - margin)
    }
  }

  await addPageHeader()

  // 제목 추가 (크고 두껍게)
  doc.setFontSize(20)
  doc.setFont(koreanFont, 'bold')
  doc.setTextColor(0, 0, 0)
  const titleLines = splitText(doc, title, contentWidth, 20)
  for (const line of titleLines) {
    if (yPos + 15 > pageHeight - margin - 20) {
      addPageFooter(pageNum, totalPages)
      doc.addPage()
      pageNum++
      totalPages = pageNum
      await addPageHeader()
      yPos = margin + logoSize + 10
    }
    doc.text(line, margin, yPos)
    yPos += 10
  }
  
  yPos += 10

  // 본문과 단어 추가
  doc.setFontSize(10) // 10으로 고정
  
  for (let pIndex = 0; pIndex < translationData.paragraphs.length; pIndex++) {
    const paragraph = translationData.paragraphs[pIndex]
    const paragraphWords = wordsByParagraph[pIndex] || []
    let paragraphStartY = yPos
    
    // 문단의 모든 문장 추가
    for (const sentence of paragraph.sentences) {
      // 영어 문장
      doc.setFont('helvetica', 'normal')
      const englishLines = splitText(doc, sentence.english, leftColumnWidth, 10)
      for (const line of englishLines) {
        if (yPos + 15 > pageHeight - margin - 20) {
          addPageFooter(pageNum, totalPages)
          doc.addPage()
          pageNum++
          totalPages = pageNum
          await addPageHeader()
          yPos = margin + logoSize + 10
          paragraphStartY = yPos
        }
        doc.setTextColor(0, 0, 0)
        doc.text(line, margin, yPos)
        yPos += 7
      }
      
      // 한국어 문장
      doc.setFont(koreanFont, 'normal')
      const koreanLines = splitText(doc, sentence.korean, leftColumnWidth, 10)
      for (const line of koreanLines) {
        if (yPos + 15 > pageHeight - margin - 20) {
          addPageFooter(pageNum, totalPages)
          doc.addPage()
          pageNum++
          totalPages = pageNum
          await addPageHeader()
          yPos = margin + logoSize + 10
          paragraphStartY = yPos
        }
        doc.setTextColor(100, 100, 100)
        doc.text(line, margin, yPos)
        yPos += 7
      }
      
      yPos += 5
    }
    
    // 오른쪽에 단어 추가
    if (paragraphWords.length > 0) {
      let wordY = paragraphStartY
      doc.setFontSize(10)
      
      for (const word of paragraphWords) {
        // 단어 (영어)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        const wordLines = splitText(doc, word.word, rightColumnWidth, 10)
        for (const line of wordLines) {
          if (wordY + 10 > pageHeight - margin - 20) {
            addPageFooter(pageNum, totalPages)
            doc.addPage()
            pageNum++
            totalPages = pageNum
            await addPageHeader()
            wordY = margin + logoSize + 10
            paragraphStartY = wordY
          }
          doc.text(line, rightColumnStart, wordY)
          wordY += 6
        }
        
        // 뜻 (한글)
        if (word.meaning) {
          doc.setFont(koreanFont, 'normal')
          doc.setTextColor(100, 100, 100)
          const meaningLines = splitText(doc, word.meaning, rightColumnWidth, 10)
          for (const line of meaningLines) {
            if (wordY + 10 > pageHeight - margin - 20) {
              addPageFooter(pageNum, totalPages)
              doc.addPage()
              pageNum++
              totalPages = pageNum
              await addPageHeader()
              wordY = margin + logoSize + 10
            }
            doc.text(line, rightColumnStart, wordY)
            wordY += 6
          }
        }
        
        wordY += 3
      }
      
      if (wordY <= pageHeight - margin - 20) {
        yPos = Math.max(yPos, wordY)
      } else {
        yPos = wordY
      }
    }
    
    yPos += 10
  }

  // 모든 페이지에 페이지 번호 추가
  totalPages = pageNum
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addPageFooter(i, totalPages)
  }

  // PDF 저장
  doc.save(`${title || 'document'}.pdf`)
}
