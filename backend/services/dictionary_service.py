from typing import Optional, List
import httpx
import json

class DictionaryService:
    """Free Dictionary API + DeepL 조합으로 사전식 한국어 뜻 제공"""
    
    DICT_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en"
    
    def __init__(self, translation_service=None):
        """번역 서비스를 받아서 영어 정의를 한국어로 번역"""
        self.translation_service = translation_service
        if not translation_service:
            print("⚠️ Warning: TranslationService not provided to DictionaryService")
        else:
            print("✅ [DictionaryService] Initialized with Free Dictionary API + DeepL")
    
    async def _fallback_to_deepl(self, word: str) -> Optional[str]:
        """DeepL로 직접 번역하는 fallback 메서드"""
        if not self.translation_service:
            print(f"   ❌ TranslationService not available for fallback")
            return None
        
        try:
            print(f"   🔄 Translating '{word}' directly with DeepL...")
            # 단어 자체를 직접 번역 (더 자연스러운 결과)
            korean_meaning = await self.translation_service.translate(word, target_lang="KO")
            if korean_meaning and korean_meaning.strip():
                result = korean_meaning.strip()
                # "의미" 같은 불필요한 단어 제거
                if result.endswith('의미'):
                    result = result[:-2].strip()
                
                # 쉼표나 세미콜론으로 구분된 뜻 필터링 (20글자 초과 제거)
                result = self._filter_long_meanings(result)
                
                if not result.endswith('.'):
                    result += "."
                print(f"✅ [DictionaryService] Fallback translation: '{result}'")
                return result
            else:
                print(f"   ❌ DeepL translation returned empty")
                return None
        except Exception as e:
            print(f"   ❌ Fallback translation failed: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    async def get_word_meaning(self, word: str, translate_to_korean: bool = True) -> Optional[str]:
        """
        Free Dictionary API에서 영어 정의를 가져와서 DeepL로 한국어로 번역합니다.
        사전식 뜻 형식: "달리다. 작동하다. 운영하다."
        """
        if not word or not word.strip():
            print(f"❌ [DictionaryService] Empty word provided")
            return None
        
        if not self.translation_service:
            print(f"❌ [DictionaryService] TranslationService not available for word: {word}")
            return None
        
        word_clean = word.lower().strip()
        print(f"🔍 [DictionaryService] Fetching definition for: '{word_clean}'")
        
        try:
            # 1단계: Free Dictionary API에서 영어 정의 가져오기
            async with httpx.AsyncClient(timeout=10.0) as client:
                api_url = f"{self.DICT_API_URL}/{word_clean}"
                print(f"   📡 Fetching from: {api_url}")
                
                response = await client.get(api_url)
                
                print(f"   📊 Response status: {response.status_code}")
                
                if response.status_code == 404:
                    print(f"   ⚠️ Word '{word_clean}' not found in Free Dictionary API (404)")
                    return await self._fallback_to_deepl(word_clean)
                
                if response.status_code != 200:
                    print(f"   ❌ API returned status {response.status_code}")
                    print(f"   Response text: {response.text[:200]}")
                    return await self._fallback_to_deepl(word_clean)
                
                try:
                    data = response.json()
                    print(f"   📦 Response data type: {type(data)}")
                    if isinstance(data, list):
                        print(f"   📦 Response data length: {len(data)}")
                    elif isinstance(data, dict):
                        print(f"   📦 Response data keys: {list(data.keys())}")
                except Exception as e:
                    print(f"   ❌ Failed to parse JSON: {e}")
                    print(f"   Response text: {response.text[:500]}")
                    print(f"   🔄 Falling back to DeepL direct translation...")
                    return await self._fallback_to_deepl(word_clean)
                
                # 2단계: 영어 정의 추출 (여러 의미 수집)
                definitions = []
                
                if isinstance(data, list) and len(data) > 0:
                    # 첫 번째 항목의 meanings에서 정의 추출
                    word_entry = data[0]
                    print(f"   📖 Word entry keys: {list(word_entry.keys()) if isinstance(word_entry, dict) else 'not a dict'}")
                    meanings = word_entry.get("meanings", [])
                    print(f"   📚 Found {len(meanings)} meaning group(s)")
                    
                    for idx, meaning in enumerate(meanings):
                        print(f"   📚 Meaning group {idx + 1}: {meaning.get('partOfSpeech', 'unknown')}")
                        defs = meaning.get("definitions", [])
                        print(f"      Found {len(defs)} definition(s) in this group")
                        for def_item in defs:
                            definition = def_item.get("definition", "").strip()
                            if definition:
                                definitions.append(definition)
                                print(f"      ✓ Added definition: {definition[:50]}...")
                elif isinstance(data, dict):
                    # dict 형태의 오류 응답인 경우 (예: {"title": "No Definitions Found"})
                    error_title = data.get("title", "")
                    error_message = data.get("message", "")
                    print(f"   ⚠️ Free Dictionary API error response: {error_title}")
                    if error_message:
                        print(f"      Message: {error_message}")
                    print(f"   🔄 Falling back to DeepL direct translation...")
                    # Free Dictionary API 오류 응답 시 DeepL로 직접 번역 (fallback)
                    return await self._fallback_to_deepl(word_clean)
                else:
                    print(f"   ⚠️ Unexpected data format: {type(data)}, length: {len(data) if isinstance(data, list) else 'N/A'}")
                    return await self._fallback_to_deepl(word_clean)
                
                if not definitions:
                    print(f"   ⚠️ No definitions found in Free Dictionary API for '{word_clean}'")
                    return await self._fallback_to_deepl(word_clean)
                
                # 최대 3개의 정의만 사용 (너무 많으면 길어짐)
                definitions = definitions[:3]
                print(f"   📝 Found {len(definitions)} definition(s)")
                
                # 3단계: 영어 정의들을 하나의 텍스트로 합치기
                # 예: "move at a speed faster than a walk. operate or function."
                english_definitions = ". ".join(definitions)
                print(f"   📄 English definitions: {english_definitions[:100]}...")
                
                # 4단계: DeepL로 한국어로 번역
                print(f"   🌐 Translating with DeepL...")
                korean_translation = await self.translation_service.translate(english_definitions, target_lang="KO")
                
                if not korean_translation or not korean_translation.strip():
                    print(f"   ❌ Translation returned empty, falling back to direct translation...")
                    return await self._fallback_to_deepl(word_clean)
                
                # 5단계: 사전식 형식으로 포맷팅
                # 번역 결과를 문장 단위로 분리하고 간결하게 정리
                korean_meaning = korean_translation.strip()
                
                # 마침표로 문장 분리
                sentences = [s.strip() for s in korean_meaning.split('.') if s.strip()]
                
                # 각 문장을 간결하게 정리 (불필요한 설명 제거)
                formatted_meanings = []
                for sentence in sentences:
                    # 너무 긴 문장은 앞부분만 사용 (50자 제한)
                    if len(sentence) > 50:
                        # 첫 번째 쉼표나 "또는", "그리고" 등으로 분리
                        if '또는' in sentence:
                            sentence = sentence.split('또는')[0].strip()
                        elif ',' in sentence:
                            sentence = sentence.split(',')[0].strip()
                        elif '그리고' in sentence:
                            sentence = sentence.split('그리고')[0].strip()
                        else:
                            sentence = sentence[:50].strip()
                    
                    # 문장이 유효하면 추가
                    if sentence and len(sentence) >= 2:
                        # 마지막이 동사형이 아니면 동사형으로 변환 시도
                        if not sentence.endswith(('다', '하다', '되다', '이다', '되다')):
                            # "~하는 것" 같은 표현 제거
                            if sentence.endswith('하는 것'):
                                sentence = sentence[:-3] + '하다'
                            elif sentence.endswith('하는'):
                                sentence = sentence[:-2] + '하다'
                        
                        formatted_meanings.append(sentence)
                
                if not formatted_meanings:
                    # 포맷팅 실패 시 원본 사용
                    formatted_meanings = [korean_meaning]
                
                # 최종 결과: "달리다. 작동하다. 운영하다." 형식
                result = ". ".join(formatted_meanings)
                
                # 쉼표나 세미콜론으로 구분된 뜻 필터링 (20글자 초과 제거)
                result = self._filter_long_meanings(result)
                
                # 마지막 마침표 확인
                if not result.endswith('.'):
                    result += "."
                
                print(f"✅ [DictionaryService] Final meaning: '{result}'")
                return result
                
        except httpx.TimeoutException:
            print(f"❌ [DictionaryService] Timeout fetching definition for '{word_clean}'")
            print(f"   🔄 Falling back to DeepL direct translation...")
            return await self._fallback_to_deepl(word_clean)
        except httpx.RequestError as e:
            print(f"❌ [DictionaryService] Request error for '{word_clean}': {str(e)}")
            print(f"   🔄 Falling back to DeepL direct translation...")
            return await self._fallback_to_deepl(word_clean)
        except json.JSONDecodeError as e:
            print(f"❌ [DictionaryService] JSON decode error for '{word_clean}': {str(e)}")
            print(f"   🔄 Falling back to DeepL direct translation...")
            return await self._fallback_to_deepl(word_clean)
        except Exception as e:
            print(f"❌ [DictionaryService] Error processing word '{word_clean}': {str(e)}")
            import traceback
            traceback.print_exc()
            print(f"   🔄 Falling back to DeepL direct translation...")
            return await self._fallback_to_deepl(word_clean)
    
    def _filter_long_meanings(self, meaning: str) -> str:
        """
        쉼표(,) 또는 세미콜론(;)으로 구분된 뜻 중 20글자 초과인 뜻을 제거합니다.
        3개 이상의 뜻이 있을 때만 필터링을 적용합니다.
        
        Args:
            meaning: 필터링할 뜻 문자열
            
        Returns:
            필터링된 뜻 문자열
        """
        if not meaning:
            return meaning
        
        # 쉼표나 세미콜론으로 분리하여 뜻 개수 확인
        # 먼저 세미콜론으로 분리
        parts_by_semicolon = meaning.split(';')
        all_meanings = []
        
        for part in parts_by_semicolon:
            # 각 부분을 쉼표로 다시 분리
            parts_by_comma = part.split(',')
            for subpart in parts_by_comma:
                subpart = subpart.strip()
                if subpart:
                    all_meanings.append(subpart)
        
        # 3개 미만이면 필터링하지 않음
        if len(all_meanings) < 3:
            return meaning
        
        # 3개 이상일 때만 필터링 적용
        filtered_meanings = []
        for meaning_item in all_meanings:
            # 20글자 이하인 것만 유지
            if len(meaning_item) <= 20:
                filtered_meanings.append(meaning_item)
        
        # 필터링된 뜻이 없으면 원본 반환
        if not filtered_meanings:
            return meaning
        
        # 원본에 세미콜론이 있었는지 확인하여 구분자 결정
        if ';' in meaning:
            return '; '.join(filtered_meanings)
        else:
            return ', '.join(filtered_meanings)
