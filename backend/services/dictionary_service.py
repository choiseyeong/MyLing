import httpx
from typing import Optional, List
import re
from bs4 import BeautifulSoup

class DictionaryService:
    """다음 영어사전을 사용한 단어 사전 조회 서비스"""
    
    DAUM_DICT_URL = "https://alldic.daum.net/search.do?q="
    
    def __init__(self, translation_service=None):
        """번역 서비스는 사용하지 않음 (단어 뜻은 다음 사전에서 직접 가져옴)"""
        # translation_service는 호환성을 위해 받지만 사용하지 않음
        pass
    
    async def get_word_meaning(self, word: str, translate_to_korean: bool = True) -> Optional[str]:
        """다음 영어사전에서 단어의 뜻을 가져옵니다"""
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': 'https://alldic.daum.net/'
                }
                
                # 다음 사전 검색 URL
                search_url = f"{self.DAUM_DICT_URL}{word.lower()}"
                
                response = await client.get(search_url, headers=headers)
                
                if response.status_code == 200:
                    # HTML 파싱
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # 다음 사전의 단어 뜻 추출
                    meanings = []
                    
                    # 방법 1: list_mean 클래스 찾기 (다음 사전의 뜻 리스트)
                    mean_list = soup.find_all('ul', class_='list_mean')
                    if mean_list:
                        for ul in mean_list:
                            # 각 li 태그에서 뜻 추출
                            li_items = ul.find_all('li')
                            for li in li_items:
                                # 뜻 텍스트 추출
                                meaning_text = li.get_text(strip=True)
                                if meaning_text and re.search(r'[가-힣]', meaning_text):
                                    # 너무 긴 뜻은 제외 (50자 이하)
                                    if 2 <= len(meaning_text) <= 50:
                                        meanings.append(meaning_text)
                    
                    # 방법 2: txt_mean 클래스 찾기
                    if not meanings:
                        mean_items = soup.find_all(['span', 'div', 'li'], class_=re.compile(r'txt_mean|mean', re.I))
                        for item in mean_items:
                            meaning_text = item.get_text(strip=True)
                            if meaning_text and re.search(r'[가-힣]', meaning_text):
                                if 2 <= len(meaning_text) <= 50 and meaning_text not in meanings:
                                    meanings.append(meaning_text)
                    
                    # 방법 3: 일반적인 뜻 태그 찾기
                    if not meanings:
                        # 다음 사전의 구조에 맞는 선택자 시도
                        selectors = [
                            '.list_mean li',
                            '.mean_list li',
                            '[class*="mean"]',
                            'ul.list_mean',
                        ]
                        for selector in selectors:
                            elements = soup.select(selector)
                            for elem in elements:
                                meaning_text = elem.get_text(strip=True)
                                # 한글이 포함되고 적절한 길이인 경우만
                                if meaning_text and re.search(r'[가-힣]', meaning_text):
                                    # 쉼표로 분리된 여러 뜻 처리
                                    parts = re.split(r'[,，、]', meaning_text)
                                    for part in parts:
                                        part = part.strip()
                                        if 2 <= len(part) <= 15 and re.search(r'[가-힣]', part):
                                            if part not in meanings:
                                                meanings.append(part)
                                                if len(meanings) >= 3:  # 최대 3개
                                                    break
                                    if len(meanings) >= 3:
                                        break
                            if len(meanings) >= 3:
                                break
                    
                    if meanings:
                        # 최대 3개까지만, 쉼표로 구분
                        result = ", ".join(meanings[:3])
                        return result
                    else:
                        print(f"No meanings found for word: {word}")
                        return None
                else:
                    print(f"Daum dictionary error: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"Error fetching from Daum dictionary: {str(e)}")
            return None
