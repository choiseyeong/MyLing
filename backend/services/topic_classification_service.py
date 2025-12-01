"""
키워드 기반 + Zero-shot Classification 하이브리드 주제 분류 서비스
"""
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)

# Zero-shot classification 모델 (선택적)
try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("transformers 라이브러리가 설치되지 않았습니다. 키워드 기반 분류만 사용됩니다.")

# 주제별 키워드 리스트
humanities_keywords = [
    # History / Philosophy / Literature
    'history', 'historical', 'civilization', 'ancient', 'philosophy',
    'ethics', 'morality', 'epistemology', 'metaphysics', 'existential',
    'aristotle', 'plato', 'socrates', 'kant', 'nietzsche',
    'literature', 'novel', 'poetry', 'poet', 'narrative', 'hermeneutics',

    # Social Science / Psychology / Politics / Law
    'sociology', 'social science', 'anthropology', 'psychology',
    'cognitive bias', 'behavioral',
    'politics', 'democracy', 'ideology', 'political science',
    'government', 'policy',
    'law', 'legal', 'constitution', 'judicial', 'jurisdiction',

    # Education / Religion
    'education', 'pedagogy', 'curriculum',
    'religion', 'theology', 'bible', 'quran', 'buddhism', 'christianity'
]

science_keywords = [
    # Physics
    'physics', 'quantum', 'relativity', 'thermodynamics', 'optics',
    'particle', 'electromagnetism', 'gravity', 'inertia',

    # Chemistry
    'chemistry', 'chemical', 'molecule', 'molecular', 'reaction',
    'compound', 'organic chemistry', 'inorganic chemistry',
    'periodic table',

    # Biology
    'biology', 'genetics', 'cell', 'evolution', 'ecology',
    'microbiology', 'biochemistry', 'dna', 'rna', 'organism',
    'photosynthesis',

    # Earth Science
    'geology', 'earth science', 'climate', 'meteorology',
    'ecosystem', 'seismology', 'mineral', 'atmosphere',

    # Mathematics
    'mathematics', 'algebra', 'calculus', 'geometry', 'probability',
    'statistics', 'topology', 'differential equation',

    # AI (자연과학에 포함)
    'artificial intelligence', 'ai', 'machine learning', 'deep learning',
    'neural network', 'neural networks', 'algorithm', 'data science',
    'natural language processing', 'nlp', 'computer vision', 'robotics',
    'automation', 'intelligent system', 'cognitive computing'
]

engineering_keywords = [
    # Computer Science / Software / General Tech
    'computer science', 'software engineering', 'programming', 'coding',
    'data structure', 'database', 'compiler', 'operating system',
    'networking', 'cybersecurity', 'encryption',
    'web development', 'backend', 'frontend', 'api',
    'docker', 'kubernetes',

    # Electrical / Electronics / Signals
    'electrical engineering', 'electronics', 'semiconductor',
    'circuit', 'microcontroller', 'embedded system',
    'signal processing', 'telecommunication', 'wireless', 'rf',
    'ic design',

    # Mechanical / Industrial / Materials
    'mechanical engineering', 'manufacturing', 'automation system',
    'robotics hardware',
    'cad', 'cam',
    'material science', 'nanotechnology', '3d printing'
]

arts_keywords = [
    # Music
    'music', 'melody', 'rhythm', 'composer', 'composition',
    'orchestra', 'instrument', 'vocal', 'harmony',

    # Visual Art
    'art', 'painting', 'drawing', 'sketch',
    'modern art', 'abstract', 'oil painting', 'watercolor',
    'illustration',

    # Film / Video
    'film', 'cinema', 'director', 'screenplay',
    'storyboard', 'editing', 'animation', 'visual arts',

    # Culture / Media
    'culture', 'cultural studies', 'heritage', 'folk', 'festival',
    'pop culture', 'media studies',

    # Design
    'design', 'graphic design', 'typography', 'ux', 'ui'
]

# 주제 매핑
TOPIC_MAPPING = {
    'humanities': '인문',
    'natural_science': '자연과학',
    'engineering': '공학·기술',
    'arts': '예술·문화'
}

# Zero-shot classification용 라벨 (영어)
ZERO_SHOT_LABELS = [
    'Humanities and Social Sciences',
    'Natural Sciences',
    'Engineering and Technology',
    'Arts and Culture'
]

# Zero-shot 라벨과 내부 주제 매핑
ZERO_SHOT_TO_TOPIC = {
    'Humanities and Social Sciences': 'humanities',
    'Natural Sciences': 'natural_science',
    'Engineering and Technology': 'engineering',
    'Arts and Culture': 'arts'
}

# 키워드 그룹
KEYWORD_GROUPS = {
    'humanities': humanities_keywords,
    'natural_science': science_keywords,
    'engineering': engineering_keywords,
    'arts': arts_keywords
}


class TopicClassificationService:
    """키워드 기반 + Zero-shot Classification 하이브리드 주제 분류 서비스"""
    
    def __init__(self, use_model: bool = True, keyword_weight: float = 0.7, model_weight: float = 0.3):
        """
        Args:
            use_model: Zero-shot 모델 사용 여부
            keyword_weight: 키워드 점수 가중치 (0.0 ~ 1.0)
            model_weight: 모델 점수 가중치 (0.0 ~ 1.0)
        """
        # 키워드를 소문자로 변환하여 저장
        self.keyword_groups = {
            topic: [kw.lower() for kw in keywords]
            for topic, keywords in KEYWORD_GROUPS.items()
        }
        
        # Zero-shot classifier 초기화
        self.classifier = None
        self.use_model = use_model and TRANSFORMERS_AVAILABLE
        self.keyword_weight = keyword_weight
        self.model_weight = model_weight
        
        if self.use_model:
            try:
                # 더 가벼운 모델 사용 (빠른 처리)
                self.classifier = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",
                    device=-1  # CPU 사용 (-1), GPU가 있으면 0으로 변경 가능
                )
                logger.info("Zero-shot classification 모델이 성공적으로 로드되었습니다.")
            except Exception as e:
                logger.warning(f"Zero-shot 모델 로드 실패: {e}. 키워드 기반 분류만 사용됩니다.")
                self.use_model = False
    
    def _calculate_keyword_scores(self, text: str) -> Dict[str, float]:
        """키워드 기반 점수 계산"""
        text_lower = text.lower()
        scores = {}
        
        for topic, keywords in self.keyword_groups.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
            # 정규화: 키워드 개수로 나누어 0~1 사이로 정규화
            scores[topic] = score / len(keywords) if keywords else 0
        
        return scores
    
    def _calculate_model_scores(self, text: str) -> Optional[Dict[str, float]]:
        """Zero-shot 모델 기반 점수 계산"""
        if not self.use_model or not self.classifier:
            return None
        
        try:
            result = self.classifier(text, ZERO_SHOT_LABELS)
            
            # 모델 결과를 내부 주제 형식으로 변환
            scores = {}
            for label, score in zip(result['labels'], result['scores']):
                topic = ZERO_SHOT_TO_TOPIC.get(label)
                if topic:
                    scores[topic] = score
            
            return scores
        except Exception as e:
            logger.warning(f"모델 분류 실패: {e}")
            return None
    
    def classify(self, text: str) -> str:
        """
        텍스트를 분석하여 주제를 분류합니다 (키워드 + 모델 하이브리드).
        
        Args:
            text: 분류할 텍스트
            
        Returns:
            분류된 주제 (한글): '인문', '자연과학', '공학·기술', '예술·문화', '기타'
        """
        if not text or not text.strip():
            return '기타'
        
        # 1. 키워드 기반 점수 계산
        keyword_scores = self._calculate_keyword_scores(text)
        
        # 2. 모델 기반 점수 계산 (선택적)
        model_scores = self._calculate_model_scores(text)
        
        # 3. 하이브리드 점수 계산
        if model_scores:
            # 키워드와 모델 점수 결합
            final_scores = {}
            for topic in keyword_scores.keys():
                keyword_score = keyword_scores.get(topic, 0)
                model_score = model_scores.get(topic, 0)
                final_scores[topic] = (
                    self.keyword_weight * keyword_score +
                    self.model_weight * model_score
                )
        else:
            # 모델이 없으면 키워드만 사용
            final_scores = keyword_scores
        
        # 4. 최고 점수 찾기
        max_score = max(final_scores.values()) if final_scores else 0
        
        # 점수가 너무 낮으면 '기타' 반환 (임계값: 0.1)
        if max_score < 0.1:
            return '기타'
        
        # 5. 최고 점수를 가진 주제 찾기
        best_topic = max(final_scores.items(), key=lambda x: x[1])[0]
        
        # 한글 주제명으로 변환
        return TOPIC_MAPPING.get(best_topic, '기타')

