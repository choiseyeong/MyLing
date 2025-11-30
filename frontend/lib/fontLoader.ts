import jsPDF from 'jspdf'

// 맑은고딕 폰트 로더
// 폰트 파일은 public/fonts/malgun.ttf에 위치해야 합니다.
// 또는 base64로 인코딩된 폰트 데이터를 직접 사용할 수 있습니다.

export async function loadMalgunFont(): Promise<string | null> {
  try {
    // 폰트 파일을 fetch로 로드하고 base64로 변환
    const response = await fetch('/fonts/malgun.ttf')
    if (!response.ok) {
      console.warn('맑은고딕 폰트 파일을 찾을 수 없습니다. /fonts/malgun.ttf 경로를 확인하세요.')
      return null
    }
    
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        // data:font/truetype;base64, 부분 제거
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = () => {
        console.error('폰트 파일 읽기 실패')
        resolve(null)
      }
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('폰트 로드 실패:', error)
    return null
  }
}

// 폰트를 jsPDF에 등록
export async function registerMalgunFont(doc: jsPDF): Promise<boolean> {
  try {
    const fontData = await loadMalgunFont()
    if (!fontData) {
      console.warn('맑은고딕 폰트를 사용할 수 없습니다. Helvetica 폰트를 사용합니다.')
      return false
    }

    // VFS에 폰트 파일 추가
    doc.addFileToVFS('malgun.ttf', fontData)
    // 폰트 등록
    doc.addFont('malgun.ttf', 'malgun', 'normal')
    doc.addFont('malgun.ttf', 'malgun', 'bold')
    
    return true
  } catch (error) {
    console.error('폰트 등록 실패:', error)
    return false
  }
}

