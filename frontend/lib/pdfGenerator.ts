import { jsPDF } from 'jspdf'
import { loadMalgunFont, registerMalgunFont } from './fontLoader'

interface SentencePair {
  english: string
  korean: string
}

interface Paragraph {
  sentences: SentencePair[]
}

interface Word {
  id: number
  word: string
  meaning: string
  study_id?: number
  study_title?: string
  known: boolean
}

/**
 * 텍스트를 페이지 너비에 맞게 분할합니다.
 */
function splitText(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  doc.setFontSize(fontSize)
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
  return lines
}

/**
 * 로고 이미지를 로드합니다.
 */
async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch('/myling_logo.png')
    if (!response.ok) {
      return null
    }
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error loading logo:', error)
    return null
  }
}

/**
 * 페이지 헤더를 추가합니다 (로고 + 보라색 선).
 */
async function addPageHeader(
  doc: jsPDF,
  margin: number,
  pageWidth: number
): Promise<void> {
  const logoSize = 7.5 // 로고 크기 절반
  const logoDataUrl = await loadLogo()

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margin, margin, logoSize * 2, logoSize)
    } catch (error) {
      console.error('Error adding logo image:', error)
      // 폴백: 텍스트로 표시
      doc.setFontSize(8)
      doc.text('MyLing', margin, margin + 5)
    }
  } else {
    // 폴백: 텍스트로 표시
    doc.setFontSize(8)
    doc.text('MyLing', margin, margin + 5)
  }

  // 연보라색 선 추가
  doc.setDrawColor(200, 180, 255) // 연보라색
  doc.setLineWidth(0.5)
  doc.line(
    margin,
    margin + logoSize + 5,
    pageWidth - margin,
    margin + logoSize + 5
  )
}

/**
 * 페이지 푸터를 추가합니다 (페이지 번호).
 */
function addPageFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number,
  pageWidth: number,
  pageHeight: number,
  margin: number
): void {
  if (totalPages >= 2) {
    doc.setFontSize(10)
    doc.text(
      `${pageNumber} / ${totalPages}`,
      pageWidth - margin - 20,
      pageHeight - margin + 5
    )
  }
}

/**
 * Step 2용 PDF를 생성합니다.
 * 제목(크고 두껍게), 영어 한줄, 한국어 한줄이 교차로 표시됩니다.
 */
export async function generatePDFStep2(
  title: string,
  paragraphs: Paragraph[]
): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  const lineHeight = 5 // 행간 간격 더 좁게
  const titleFontSize = 20
  const bodyFontSize = 11 // 영어 본문 폰트 크기 더 키움
  const koreanFontSize = 8 // 한글은 영어보다 더 작게
  const paragraphNumberFontSize = 7 // 문단 번호 폰트 크기

  // Malgun Gothic 폰트 로드 및 등록
  try {
    const fontBase64 = await loadMalgunFont()
    registerMalgunFont(doc, fontBase64)
    doc.setFont('MalgunGothic')
  } catch (error) {
    console.error('Failed to load font, using default:', error)
  }

  let y = margin + 30 // 헤더 공간 확보 (연보라색 선과 제목 사이 간격 더 넓게)
  let currentPage = 1
  const totalPages = 1 // 초기값, 나중에 업데이트

  // 제목 추가
  doc.setFontSize(titleFontSize)
  doc.setFont('MalgunGothic', 'bold')
  const titleLines = splitText(doc, title, contentWidth, titleFontSize)
  for (const line of titleLines) {
    if (y + lineHeight > pageHeight - margin - 10) {
      doc.addPage()
      currentPage++
      await addPageHeader(doc, margin, pageWidth)
      y = margin + 30
    }
    doc.text(line, margin, y)
    y += lineHeight + 2
  }
  y += 12 // 제목과 본문 사이 간격 더 넓게

  // 본문 추가 (영어 한줄, 한국어 한줄 교차)
  doc.setFontSize(bodyFontSize)
  doc.setFont('MalgunGothic', 'normal')

  for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
    const paragraph = paragraphs[pIndex]
    
    // 문단 번호 표시 (파란색, 작은 글씨)
    if (paragraphs.length > 1) {
      doc.setFontSize(paragraphNumberFontSize)
      doc.setTextColor(0, 0, 255) // 파란색
      doc.text(`${pIndex + 1}`, margin - 8, y + 2) // 왼쪽 여백에 표시
      doc.setTextColor(0, 0, 0) // 검은색으로 복원
      doc.setFontSize(bodyFontSize)
    }
    
    for (const sentence of paragraph.sentences) {
      // 영어 문장
      const englishLines = splitText(
        doc,
        sentence.english,
        contentWidth,
        bodyFontSize
      )
      for (const line of englishLines) {
        if (y + lineHeight > pageHeight - margin - 10) {
          doc.addPage()
          currentPage++
          await addPageHeader(doc, margin, pageWidth)
          y = margin + 30
        }
        doc.text(line, margin, y)
        y += lineHeight
      }

      // 한국어 문장
      doc.setFontSize(koreanFontSize)
      doc.setTextColor(150, 150, 150) // 연한 회색
      const koreanLines = splitText(
        doc,
        sentence.korean,
        contentWidth,
        koreanFontSize
      )
      for (const line of koreanLines) {
        if (y + lineHeight > pageHeight - margin - 10) {
          doc.addPage()
          currentPage++
          await addPageHeader(doc, margin, pageWidth)
          y = margin + 30
        }
        doc.text(line, margin, y)
        y += lineHeight
      }
      // 영어로 돌아가기 위해 색상과 폰트 크기 복원
      doc.setFontSize(bodyFontSize)
      doc.setTextColor(0, 0, 0) // 검은색으로 복원
      y += 2 // 문장 간 간격 더 좁게
    }
    y += 3 // 문단 간 간격
  }

  // 모든 페이지에 헤더와 푸터 추가
  const finalPageCount = doc.getNumberOfPages()
  for (let i = 1; i <= finalPageCount; i++) {
    doc.setPage(i)
    await addPageHeader(doc, margin, pageWidth)
    addPageFooter(doc, i, finalPageCount, pageWidth, pageHeight, margin)
  }

  doc.save(`${title || 'document'}.pdf`)
}

/**
 * Step 3용 PDF를 생성합니다.
 * 제목과 본문은 Step 2와 동일하지만, 오른쪽 30%에 영단어와 뜻이 표시됩니다.
 * 단어는 자신이 추가된 문단 옆에 배치됩니다.
 */
export async function generatePDFStep3(
  title: string,
  paragraphs: Paragraph[],
  words: Word[]
): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const mainContentWidth = (pageWidth - margin * 2) * 0.7 // 왼쪽 70%
  const wordColumnWidth = (pageWidth - margin * 2) * 0.3 // 오른쪽 30%
  const mainContentX = margin
  const wordColumnX = margin + mainContentWidth + 5
  const lineHeight = 5 // 행간 간격 더 좁게
  const titleFontSize = 20
  const bodyFontSize = 11 // 영어 본문 폰트 크기 더 키움
  const koreanFontSize = 8 // 한글은 영어보다 더 작게
  const wordFontSize = 8 // 단어 폰트 크기 더 작게
  const paragraphNumberFontSize = 7 // 문단 번호 폰트 크기

  // Malgun Gothic 폰트 로드 및 등록
  try {
    const fontBase64 = await loadMalgunFont()
    registerMalgunFont(doc, fontBase64)
    doc.setFont('MalgunGothic')
  } catch (error) {
    console.error('Failed to load font, using default:', error)
  }

  // 단어를 문단별로 매핑하고, 각 단어가 처음 등장하는 문장 정보 저장
  interface WordWithPosition {
    word: Word
    paragraphIndex: number
    sentenceIndex: number
  }
  
  const wordsWithPosition: WordWithPosition[] = []
  words.forEach((word) => {
    // 단어가 처음 등장하는 문단과 문장 찾기
    for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
      const paragraph = paragraphs[pIndex]
      for (let sIndex = 0; sIndex < paragraph.sentences.length; sIndex++) {
        const sentence = paragraph.sentences[sIndex]
        if (sentence.english.toLowerCase().includes(word.word.toLowerCase())) {
          wordsWithPosition.push({
            word,
            paragraphIndex: pIndex,
            sentenceIndex: sIndex,
          })
          return // 첫 번째 등장 위치만 저장
        }
      }
    }
  })
  
  // 문단별로 그룹화
  const wordsByParagraph: { [key: number]: WordWithPosition[] } = {}
  wordsWithPosition.forEach((wp) => {
    if (!wordsByParagraph[wp.paragraphIndex]) {
      wordsByParagraph[wp.paragraphIndex] = []
    }
    wordsByParagraph[wp.paragraphIndex].push(wp)
  })

  let y = margin + 30 // 헤더 공간 확보 (연보라색 선과 제목 사이 간격 더 넓게)
  let currentPage = 1

  // 제목 추가
  doc.setFontSize(titleFontSize)
  doc.setFont('MalgunGothic', 'bold')
  const titleLines = splitText(doc, title, mainContentWidth, titleFontSize)
  for (const line of titleLines) {
    if (y + lineHeight > pageHeight - margin - 10) {
      doc.addPage()
      currentPage++
      await addPageHeader(doc, margin, pageWidth)
      y = margin + 30
    }
    doc.text(line, mainContentX, y)
    y += lineHeight + 2
  }
  y += 12 // 제목과 본문 사이 간격 더 넓게

  // 본문과 단어 추가
  doc.setFontSize(bodyFontSize)
  doc.setFont('MalgunGothic', 'normal')

  // 각 문장의 Y 위치를 추적하기 위한 맵
  const sentenceYPositions: Map<string, number> = new Map()

  for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
    const paragraph = paragraphs[pIndex]
    const paragraphWords = wordsByParagraph[pIndex] || []
    const paragraphStartY = y

    // 문단 번호 표시 (파란색, 작은 글씨)
    if (paragraphs.length > 1) {
      doc.setFontSize(paragraphNumberFontSize)
      doc.setTextColor(0, 0, 255) // 파란색
      doc.text(`${pIndex + 1}`, mainContentX - 8, y + 2) // 왼쪽 여백에 표시
      doc.setTextColor(0, 0, 0) // 검은색으로 복원
      doc.setFontSize(bodyFontSize)
    }

    // 문단의 모든 문장 추가
    for (let sIndex = 0; sIndex < paragraph.sentences.length; sIndex++) {
      const sentence = paragraph.sentences[sIndex]
      const sentenceKey = `${pIndex}-${sIndex}`
      const sentenceStartY = y

      // 영어 문장
      const englishLines = splitText(
        doc,
        sentence.english,
        mainContentWidth,
        bodyFontSize
      )
      for (const line of englishLines) {
        if (y + lineHeight > pageHeight - margin - 10) {
          doc.addPage()
          currentPage++
          await addPageHeader(doc, margin, pageWidth)
          y = margin + 30
        }
        doc.text(line, mainContentX, y)
        y += lineHeight
      }

      // 한국어 문장
      doc.setFontSize(koreanFontSize)
      doc.setTextColor(150, 150, 150) // 연한 회색
      const koreanLines = splitText(
        doc,
        sentence.korean,
        mainContentWidth,
        koreanFontSize
      )
      for (const line of koreanLines) {
        if (y + lineHeight > pageHeight - margin - 10) {
          doc.addPage()
          currentPage++
          await addPageHeader(doc, margin, pageWidth)
          y = margin + 30
        }
        doc.text(line, mainContentX, y)
        y += lineHeight
      }
      // 영어로 돌아가기 위해 색상과 폰트 크기 복원
      doc.setFontSize(bodyFontSize)
      doc.setTextColor(0, 0, 0) // 검은색으로 복원
      
      // 이 문장의 Y 위치 저장 (영어 문장 시작 위치)
      sentenceYPositions.set(sentenceKey, sentenceStartY)
      
      y += 2 // 문장 간 간격 더 좁게
    }

    // 이 문단의 단어들을 오른쪽에 추가 (단어가 처음 등장하는 문장 위치 기준)
    if (paragraphWords.length > 0) {
      // 문장 인덱스 순으로 정렬하여 순서대로 배치
      paragraphWords.sort((a, b) => a.sentenceIndex - b.sentenceIndex)
      
      doc.setFontSize(wordFontSize)
      let lastWordY = 0 // 마지막 단어의 Y 위치 추적
      for (const wp of paragraphWords) {
        const sentenceKey = `${wp.paragraphIndex}-${wp.sentenceIndex}`
        let wordY = sentenceYPositions.get(sentenceKey) || paragraphStartY
        
        // 이전 단어와 겹치지 않도록 조정
        if (lastWordY > 0 && wordY < lastWordY + lineHeight * 2) {
          wordY = lastWordY + lineHeight * 2
        }
        
        // 단어와 뜻을 분리하여 표시 (영단어 굵게, 한글뜻 작게)
        const wordLines = splitText(
          doc,
          wp.word.word,
          wordColumnWidth,
          wordFontSize
        )
        
        // 영단어 (굵게)
        doc.setFont('MalgunGothic', 'bold')
        doc.setTextColor(0, 0, 0) // 검은색
        for (const line of wordLines) {
          if (wordY + lineHeight > pageHeight - margin - 10) {
            doc.addPage()
            currentPage++
            await addPageHeader(doc, margin, pageWidth)
            wordY = margin + 30
          }
          doc.text(line, wordColumnX, wordY)
          wordY += lineHeight
        }
        
        // 한글 뜻 (작게, 회색)
        if (wp.word.meaning) {
          doc.setFontSize(wordFontSize - 1) // 뜻은 더 작게
          doc.setFont('MalgunGothic', 'normal')
          doc.setTextColor(120, 120, 120) // 회색
          const meaningLines = splitText(
            doc,
            wp.word.meaning,
            wordColumnWidth,
            wordFontSize - 1
          )
          for (const line of meaningLines) {
            if (wordY + lineHeight > pageHeight - margin - 10) {
              doc.addPage()
              currentPage++
              await addPageHeader(doc, margin, pageWidth)
              wordY = margin + 20
            }
            doc.text(line, wordColumnX, wordY)
            wordY += lineHeight
          }
          doc.setFontSize(wordFontSize) // 원래 크기로 복원
        }
        
        // 색상과 폰트 복원
        doc.setTextColor(0, 0, 0)
        doc.setFont('MalgunGothic', 'normal')
        
        lastWordY = wordY
        wordY += 1 // 단어 간 간격
      }
    }

    y += 5 // 문단 간 간격
  }

  // 모든 페이지에 헤더와 푸터 추가
  const finalPageCount = doc.getNumberOfPages()
  for (let i = 1; i <= finalPageCount; i++) {
    doc.setPage(i)
    await addPageHeader(doc, margin, pageWidth)
    addPageFooter(doc, i, finalPageCount, pageWidth, pageHeight, margin)
  }

  doc.save(`${title || 'document'}.pdf`)
}


