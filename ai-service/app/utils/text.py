import re

def clean_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'[^a-zA-ZÀ-ÿ0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_keywords(text: str) -> list[str]:
    stop_words = {'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'de', 'du', 'à', 'est', 'ce', 'se', 'je', 'tu', 'il', 'nous', 'vous', 'ils', 'a', 'pour', 'par', 'sur', 'dans', 'en', 'avec', 'que', 'qui', 'quoi', 'comment', 'pourquoi', 'quand', 'où'}
    words = clean_text(text).split()
    return [w for w in words if len(w) > 2 and w not in stop_words]
