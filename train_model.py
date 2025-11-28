import os
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer

DATA_DIR = "job_descriptions"
OUT_DIR = "model_artifacts"

os.makedirs(OUT_DIR, exist_ok=True)

def load_role_texts():
    data = {}
    for file in os.listdir(DATA_DIR):
        if file.endswith(".txt"):
            role = file.replace(".txt", "")
            with open(os.path.join(DATA_DIR, file), "r", encoding="utf-8") as f:
                data[role] = f.read()
    return data

def train():
    role_texts = load_role_texts()

    corpus = list(role_texts.values())
    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    X = vectorizer.fit_transform(corpus)

    role_profiles = {}
    i = 0
    for role in role_texts.keys():
        role_profiles[role] = X[i]
        i += 1

    pickle.dump(vectorizer, open(f"{OUT_DIR}/vectorizer.pkl", "wb"))
    pickle.dump(role_profiles, open(f"{OUT_DIR}/role_profiles.pkl", "wb"))

    print("Model training complete!")

if __name__ == "__main__":
    train()
