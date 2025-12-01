import { jsPDF } from 'jspdf'

/**
 * Malgun Gothic 폰트를 로드하고 jsPDF에 등록합니다.
 * @param doc jsPDF 인스턴스
 */
export async function loadMalgunFont(): Promise<string> {
  try {
    // 대소문자 구분 없이 시도
    let response = await fetch('/fonts/malgun.ttf')
    if (!response.ok) {
      response = await fetch('/fonts/MALGUN.TTF')
    }
    if (!response.ok) {
      throw new Error('Failed to load font file')
    }
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
    const base64 = btoa(binaryString)
    return base64
  } catch (error) {
    console.error('Error loading Malgun font:', error)
    throw error
  }
}

/**
 * Malgun Gothic 폰트를 jsPDF에 등록합니다.
 * @param doc jsPDF 인스턴스
 * @param base64Font Base64로 인코딩된 폰트 데이터
 */
export function registerMalgunFont(doc: jsPDF, base64Font: string): void {
  // jsPDF의 VFS에 폰트 추가
  ;(doc as any).addFileToVFS('malgun.ttf', base64Font)
  ;(doc as any).addFont('malgun.ttf', 'MalgunGothic', 'normal')
  // bold 스타일도 같은 폰트로 등록 (한글 깨짐 방지)
  ;(doc as any).addFont('malgun.ttf', 'MalgunGothic', 'bold')
}

