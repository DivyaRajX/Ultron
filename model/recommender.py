import os
import io
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from typing import List, Tuple
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from scipy.sparse import hstack
import numpy as np
import urllib.parse


class Recommender:
    """Content-based recommender for LeetCode problems.

    Features:
    - Builds TF-IDF on `title` + `topic_tags` and recommends similar problems.
    - Analyzes user's solved problems to find weak topics.
    - Appends new problems from user data into the system CSV if requested.
    """

    def __init__(self, system_csv: str = "cleaned_leetcode_dataset.csv"):
        self.system_csv = system_csv
        self.system_df = None
        self.vectorizer = None
        self.tfidf_matrix = None

    def load_data(self):
        # Resolve relative paths against the model package directory
        path = self.system_csv
        if not os.path.isabs(path):
            base = os.path.dirname(__file__)
            path = os.path.join(base, path)
        if not os.path.exists(path):
            raise FileNotFoundError(f"System CSV not found: {path}")
        self.system_df = pd.read_csv(path)
        # store resolved absolute path for future operations (append etc.)
        self.system_csv = path
        # Ensure required columns exist
        for c in ["title", "topic_tags"]:
            if c not in self.system_df.columns:
                self.system_df[c] = ""

    def build_vectorizer(self, max_features: int = 5000):
        # Create a combined text field
        df = self.system_df
        df = df.fillna("")
        df["_text"] = df["topic_tags"].astype(str) + " " + df.get("title", "").astype(str)
        self.vectorizer = TfidfVectorizer(max_features=max_features, stop_words="english")
        self.tfidf_matrix = self.vectorizer.fit_transform(df["_text"])

    def fit(self):
        """Load data and build vectorizer."""
        self.load_data()
        self.build_vectorizer()

    def _text_for_row(self, row: pd.Series) -> str:
        return str(row.get("topic_tags", "")) + " " + str(row.get("title", ""))

    def recommend(self, user_df: pd.DataFrame, top_n: int = 10) -> pd.DataFrame:
        """Recommend `top_n` problems for the user.

        Strategy:
        - If user dataframe contains solved problems, we compute user's weak topics and prioritize
          problems from those topics.
        - Otherwise we use the user's provided rows (if any) as queries and find similar problems.
        """
        if self.system_df is None or self.tfidf_matrix is None:
            self.fit()

        system = self.system_df.copy().reset_index(drop=True)

        # Coerce user_df to a DataFrame if it's not already (handle uploaded CSV content or None)
        if not isinstance(user_df, pd.DataFrame):
            try:
                if isinstance(user_df, str):
                    stream = io.StringIO(user_df)
                    user_df = pd.read_csv(stream)
                else:
                    user_df = pd.DataFrame()
            except Exception:
                user_df = pd.DataFrame()

        # Build user query text
        if user_df.empty:
            user_texts = []
        else:
            user_texts = user_df.apply(self._text_for_row, axis=1).tolist()
        if len(user_texts) == 0:
            # Fallback: recommend most common topics
            return system.head(top_n)

        user_corpus = [" ".join(user_texts)]
        user_vec = self.vectorizer.transform(user_corpus)

        # Compute cosine similarities
        cosine_similarities = linear_kernel(user_vec, self.tfidf_matrix).flatten()
        top_idx = cosine_similarities.argsort()[::-1]

        # Filter out problems already in user's data (by title)
        user_titles = set(user_df.get("title", pd.Series([], dtype=object)).astype(str).str.lower())
        recommendations = []
        for idx in top_idx:
            title = str(system.at[idx, "title"]).lower()
            if title in user_titles:
                continue
            recommendations.append((idx, cosine_similarities[idx]))
            if len(recommendations) >= top_n:
                break

        rec_indices = [i for i, _ in recommendations]
        recs = system.iloc[rec_indices].copy()
        recs["score"] = [s for _, s in recommendations]
        return recs

    def analyze_weak_topics(self, user_df: pd.DataFrame, top_k: int = 5) -> List[Tuple[str, float]]:
        """Return a list of (topic, score) where lower score means weaker for user.

        Heuristic:
        - If user_df has a column indicating solved/completed or accuracy, use it to compute per-topic proficiency.
        - Otherwise, topics not present in user_df are considered weak and ranked by system frequency.
        """
        # Ensure user_df is a DataFrame
        if not isinstance(user_df, pd.DataFrame):
            try:
                if isinstance(user_df, str):
                    stream = io.StringIO(user_df)
                    user_df = pd.read_csv(stream)
                else:
                    user_df = pd.DataFrame()
            except Exception:
                user_df = pd.DataFrame()

        # Normalize topic tags into lists
        def split_topics(x):
            try:
                return [t.strip().lower() for t in str(x).split(",") if t.strip()]
            except Exception:
                return []

        system = self.system_df.copy()
        system["_topics_list"] = system["topic_tags"].apply(split_topics)

        # Build global topic frequency
        from collections import Counter
        global_counter = Counter()
        for lst in system["_topics_list"]:
            global_counter.update(lst)

        # Build user topic stats
        user_df = user_df.fillna("")
        user_df["_topics_list"] = user_df.get("topic_tags", "").apply(split_topics)

        # Try to detect solved indicator
        solved_col = None
        for c in ["status", "solved", "is_solved", "result"]:
            if c in user_df.columns:
                solved_col = c
                break

        topic_scores = {}
        for topic in global_counter:
            # Collect user rows with this topic
            rows_with_topic = user_df[user_df["_topics_list"].apply(lambda L, t=topic: t in L)]
            if rows_with_topic.empty:
                # not attempted -> weak
                topic_scores[topic] = 0.0
            else:
                if solved_col:
                    # consider solved as truthy values like 1, True, 'solved'
                    solved_vals = rows_with_topic[solved_col].astype(str).str.lower()
                    success_count = solved_vals.apply(lambda x: x in ["1", "true", "t", "yes", "solved"]).sum()
                    topic_scores[topic] = success_count / len(rows_with_topic)
                else:
                    # presence implies some familiarity; assign a weak-medium score
                    topic_scores[topic] = 0.4 + min(0.5, len(rows_with_topic) / 50)

        # Sort by increasing score (weaker first)
        sorted_topics = sorted(topic_scores.items(), key=lambda x: x[1])
        return sorted_topics[:top_k]

    def gfg_link_for_topic(self, topic: str) -> str:
        """Return a GeeksforGeeks search/tag URL for the topic."""
        t = topic.strip().lower()
        if not t:
            return "https://www.geeksforgeeks.org/"
        t_enc = urllib.parse.quote_plus(t.replace(' ', '-'))
        # Tag pages on GfG often follow /tag/<topic>/, but not always. Fallback to site search.
        return f"https://www.geeksforgeeks.org/tag/{t_enc}/"

    def striver_search_link(self, topic: str) -> str:
        """Return a YouTube search URL for Striver content on the topic."""
        t = topic.strip()
        if not t:
            return "https://www.youtube.com/results?search_query=striver+dsa"
        q = urllib.parse.quote_plus(f"striver {t} dsa")
        return f"https://www.youtube.com/results?search_query={q}"

    def train_random_forest(self, user_df: pd.DataFrame, min_samples: int = 10) -> Tuple[bool, dict]:
        """Train a RandomForestClassifier using user-labeled solved/not-solved data.

        Returns (success_flag, info_dict). info_dict includes trained_model and training_size.
        """
        # Detect solved column
        solved_col = None
        for c in ["status", "solved", "is_solved", "result"]:
            if c in user_df.columns:
                solved_col = c
                break

        if solved_col is None:
            return False, {"reason": "No solved/status column found in user data."}

        # Map user labels to system rows by title
        system = self.system_df.copy()
        system["_title_norm"] = system.get("title", "").astype(str).str.lower().str.strip()
        user = user_df.copy()
        user["_title_norm"] = user.get("title", "").astype(str).str.lower().str.strip()

        merged = pd.merge(system.reset_index(), user[["_title_norm", solved_col]], on="_title_norm", how="inner")
        if merged.shape[0] < min_samples:
            return False, {"reason": f"Not enough matched labeled examples (found {merged.shape[0]}). Require >= {min_samples}."}

        # Prepare features: TF-IDF vectors + difficulty encoded
        text_feats = self.vectorizer.transform(merged["topic_tags"].astype(str) + " " + merged.get("title", "").astype(str))
        # Difficulty numeric
        diff_map = {"easy": 0, "medium": 1, "hard": 2}
        diffs = merged.get("difficulty", "").astype(str).str.lower().map(diff_map).fillna(-1).astype(int).values.reshape(-1, 1)
        X = hstack([text_feats, diffs])

        # Build labels
        y = merged[solved_col].astype(str).str.lower().apply(lambda x: 1 if x in ["1", "true", "t", "yes", "solved"] else 0).values

        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        clf.fit(X, y)

        return True, {"model": clf, "train_size": merged.shape[0], "merged_index": merged["index"].values}

    def recommend_with_rf(self, user_df: pd.DataFrame, top_n: int = 10) -> pd.DataFrame:
        """Use RF trained on user's solved labels to recommend problems (highest predicted probability of solvability).

        If training is not possible, returns empty dataframe.
        """
        if self.system_df is None or self.tfidf_matrix is None:
            self.fit()

        ok, info = self.train_random_forest(user_df)
        if not ok:
            # Fallback: empty
            return pd.DataFrame()

        clf = info["model"]

        system = self.system_df.copy().reset_index()
        # Exclude problems the user already has
        user_titles = set(user_df.get("title", pd.Series([], dtype=object)).astype(str).str.lower().str.strip())
        candidates = system[~system.get("title", "").astype(str).str.lower().str.strip().isin(user_titles)].reset_index(drop=True)

        text_feats = self.vectorizer.transform(candidates["topic_tags"].astype(str) + " " + candidates.get("title", "").astype(str))
        diff_map = {"easy": 0, "medium": 1, "hard": 2}
        diffs = candidates.get("difficulty", "").astype(str).str.lower().map(diff_map).fillna(-1).astype(int).values.reshape(-1, 1)
        X_cand = hstack([text_feats, diffs])

        probs = clf.predict_proba(X_cand)[:, 1]
        top_idx = np.argsort(probs)[::-1][:top_n]

        recs = candidates.iloc[top_idx].copy()
        recs["score"] = probs[top_idx]
        return recs

    def append_new_problems(self, user_df: pd.DataFrame) -> int:
        """Append new problems from user_df into the system CSV. Match by title (case-insensitive).

        Returns number of appended rows.
        """
        system = pd.read_csv(self.system_csv)
        existing_titles = set(system.get("title", pd.Series([], dtype=object)).astype(str).str.lower())

        to_append = []
        for _, row in user_df.iterrows():
            title = str(row.get("title", "")).strip()
            if not title:
                continue
            if title.lower() in existing_titles:
                continue
            to_append.append(row)

        if len(to_append) == 0:
            return 0

        append_df = pd.DataFrame(to_append)
        append_df.to_csv(self.system_csv, mode="a", header=False, index=False)
        return len(append_df)


if __name__ == "__main__":
    # Quick local sanity check when run directly
    r = Recommender()
    r.fit()
    print("Loaded system dataframe with shape:", r.system_df.shape)
