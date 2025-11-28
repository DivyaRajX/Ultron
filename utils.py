import nltk
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import PyPDF2

VECTOR_PATH = "model_artifacts/vectorizer.pkl"
PROFILE_PATH = "model_artifacts/role_profiles.pkl"

vectorizer = pickle.load(open(VECTOR_PATH, "rb"))
role_profiles = pickle.load(open(PROFILE_PATH, "rb"))

def extract_text_from_pdf(path):
    text = ""
    with open(path, "rb") as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def clean(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    return text

def analyze_resume(resume_text, role):
    resume_text = clean(resume_text)

    resume_vec = vectorizer.transform([resume_text])
    role_vec = role_profiles[role]

    score = cosine_similarity(resume_vec, role_vec)[0][0] * 100

    resume_words = set(resume_text.split())
    role_keywords = vectorizer.get_feature_names_out()[role_vec.toarray().argmax():role_vec.toarray().argmax()+20]

    missing_keywords = [kw for kw in role_keywords if kw not in resume_words]

    return {
        "score": round(score, 2),
        "missing_keywords": missing_keywords,
        "message": "Analysis complete"
    }
