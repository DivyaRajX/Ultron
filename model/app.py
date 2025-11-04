import os
import os
import threading
import json
from flask import Flask, request, render_template, jsonify
import pandas as pd
import io
from recommender import Recommender
from leetcode_client import LeetCodeClient
from llm_client import LLMClient
from dotenv import load_dotenv


BASE_DIR = os.path.dirname(__file__)
TEMPLATE_DIR = os.path.join(BASE_DIR, 'templates')
app = Flask(__name__, template_folder=TEMPLATE_DIR)

# Load .env file (if present) so environment variables like OPENAI_API_KEY are available
env_path = os.path.join(BASE_DIR, '.env')
load_dotenv(env_path)

# Use the cleaned CSV located in the model folder
system_csv = os.path.join(BASE_DIR, 'cleaned_leetcode_dataset.csv')
recommender = Recommender(system_csv=system_csv)
leetcode = LeetCodeClient()
llm = LLMClient()
HISTORY_PATH = os.path.join(BASE_DIR, 'user_history.json')
recommender_ready = False


def load_user_history():
    try:
        if os.path.exists(HISTORY_PATH):
            with open(HISTORY_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return {}


def save_user_history(hist):
    try:
        with open(HISTORY_PATH, 'w', encoding='utf-8') as f:
            json.dump(hist, f, indent=2)
    except Exception:
        pass


def get_user_history(username: str):
    if not username:
        return set()
    hist = load_user_history()
    items = hist.get(username, [])
    return set([t.lower().strip() for t in items])


def update_user_history(username: str, titles):
    if not username:
        return
    hist = load_user_history()
    cur = set(hist.get(username, []))
    cur.update([t for t in titles if t])
    hist[username] = list(cur)
    save_user_history(hist)


def _fit_background():
    global recommender_ready
    try:
        recommender.fit()
        recommender_ready = True
    except Exception:
        recommender_ready = False


# Start building vectorizer in background to improve responsiveness on first request
threading.Thread(target=_fit_background, daemon=True).start()


@app.route('/')
def index():
    return render_template('index.html')


def read_uploaded_csv(file_storage):
    try:
        stream = io.StringIO(file_storage.stream.read().decode("utf-8"))
        df = pd.read_csv(stream)
        return df, None
    except Exception as e:
        return None, str(e)


@app.route('/analyze', methods=['POST'])
def analyze():
    # First try LeetCode username
    username = request.form.get('leetcode_username')
    if username:
        try:
            user_df = leetcode.get_user_solved_problems(username)
        except Exception as e:
            return jsonify({"error": f"LeetCode API error: {e}"}), 400
    else:
        # Fall back to CSV upload
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded and no LeetCode username provided"}), 400
        file = request.files['file']
        user_df, err = read_uploaded_csv(file)
        if err:
            return jsonify({"error": err}), 400

    # Ensure recommender is ready (try background-loaded flag first)
    global recommender_ready
    if not recommender_ready:
        try:
            # fallback blocking fit if background thread hasn't finished
            recommender.fit()
            recommender_ready = True
        except Exception as e:
            return jsonify({"error": f"System data load error: {e}. Try again shortly."}), 500

    weak = recommender.analyze_weak_topics(user_df, top_k=8)
    rows = []
    for topic, score in weak:
        rows.append({
            "topic": topic,
            "proficiency_score": float(score),
            "gfg_link": recommender.gfg_link_for_topic(topic),
            "striver_link": recommender.striver_search_link(topic)
        })
    return jsonify({"weak_topics": rows})


@app.route('/recommend', methods=['POST'])
def recommend():
    # First try LeetCode username
    username = request.form.get('leetcode_username')
    if username:
        try:
            user_df = leetcode.get_user_solved_problems(username)
        except Exception as e:
            return jsonify({"error": f"LeetCode API error: {e}"}), 400
    else:
        # Fall back to CSV upload
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded and no LeetCode username provided"}), 400
        file = request.files['file']
        user_df, err = read_uploaded_csv(file)
        if err:
            return jsonify({"error": err}), 400

    try:
        recommender.fit()
    except Exception as e:
        return jsonify({"error": f"System data load error: {e}"}), 500

    # respect user history (previously recommended)
    history_titles = get_user_history(username) if username else set()

    # try RF first
    rf_recs = recommender.recommend_with_rf(user_df, top_n=12)
    if rf_recs is None or rf_recs.empty:
        recs = recommender.recommend(user_df, top_n=12)
    else:
        recs = rf_recs

    # Build recommended list
    recommended = []
    rec_titles = set()
    for _, row in recs.iterrows():
        topics = str(row.get('topic_tags', '')).split(',') if pd.notna(row.get('topic_tags', None)) else ['']
        primary_topic = topics[0].strip() if topics and topics[0] else ''
        title_norm = str(row.get('title', '')).lower().strip()
        # Skip if already recommended previously for this user
        if title_norm in history_titles:
            continue
        rec_titles.add(title_norm)
        recommended.append({
            'title': row.get('title', ''),
            'difficulty': row.get('difficulty', ''),
            'topic_tags': row.get('topic_tags', ''),
            'company': row.get('company', ''),
            'score': float(row.get('score', 0)),
            'gfg_link': recommender.gfg_link_for_topic(primary_topic) if primary_topic else '',
            'striver_link': recommender.striver_search_link(primary_topic) if primary_topic else ''
        })

    # Build non-recommended list (sample from system excluding user's solved and recommended)
    system = recommender.system_df.copy().reset_index(drop=True)
    user_titles = set(user_df.get('title', pd.Series([], dtype=object)).astype(str).str.lower().str.strip())
    exclude_titles = user_titles.union(rec_titles)
    candidates = system[~system.get('title', '').astype(str).str.lower().str.strip().isin(exclude_titles)].copy()
    # choose up to 20 non-recommended problems
    others = []
    if not candidates.empty:
        try:
            sample = candidates.sample(n=min(20, len(candidates)), random_state=42)
        except Exception:
            sample = candidates.head(20)
        for _, row in sample.iterrows():
            topics = str(row.get('topic_tags', '')).split(',') if pd.notna(row.get('topic_tags', None)) else ['']
            primary_topic = topics[0].strip() if topics and topics[0] else ''
            others.append({
                'title': row.get('title', ''),
                'difficulty': row.get('difficulty', ''),
                'topic_tags': row.get('topic_tags', ''),
                'company': row.get('company', ''),
                'gfg_link': recommender.gfg_link_for_topic(primary_topic) if primary_topic else '',
                'striver_link': recommender.striver_search_link(primary_topic) if primary_topic else ''
            })
    # Persist recommended titles to user history
    if username and rec_titles:
        update_user_history(username, list(rec_titles))

    return jsonify({"recommended": recommended, "others": others})


@app.route('/recommend/more', methods=['POST'])
def recommend_more():
    """Return additional recommendations excluding already-seen titles.

    Accepts JSON body: { leetcode_username: str, seen: [titles], page_size: int }
    Falls back to form/multipart like /recommend when JSON is not provided.
    """
    data = request.get_json(silent=True) or {}
    username = data.get('leetcode_username') or request.form.get('leetcode_username')
    seen = set([s.lower().strip() for s in (data.get('seen') or []) if s])
    page_size = int(data.get('page_size', 12))

    # load user_df same as /recommend
    if username:
        try:
            user_df = leetcode.get_user_solved_problems(username)
        except Exception as e:
            return jsonify({"error": f"LeetCode API error: {e}"}), 400
    else:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded and no LeetCode username provided"}), 400
        file = request.files['file']
        user_df, err = read_uploaded_csv(file)
        if err:
            return jsonify({"error": err}), 400

    # Ensure recommender is ready (non-blocking if possible)
    global recommender_ready
    if not recommender_ready:
        try:
            recommender.fit()
            recommender_ready = True
        except Exception as e:
            return jsonify({"error": f"System data load error: {e}. Try again shortly."}), 500

    # Get a larger pool and then filter
    pool = recommender.recommend(user_df, top_n=200)
    if pool is None or pool.empty:
        return jsonify({"recommended": []})

    history_titles = get_user_history(username) if username else set()
    user_titles = set(user_df.get('title', pd.Series([], dtype=object)).astype(str).str.lower().str.strip())

    filtered = []
    for _, row in pool.iterrows():
        title_norm = str(row.get('title', '')).lower().strip()
        if not title_norm or title_norm in seen or title_norm in history_titles or title_norm in user_titles:
            continue
        topics = str(row.get('topic_tags', '')).split(',') if pd.notna(row.get('topic_tags', None)) else ['']
        primary_topic = topics[0].strip() if topics and topics[0] else ''
        filtered.append({
            'title': row.get('title', ''),
            'difficulty': row.get('difficulty', ''),
            'topic_tags': row.get('topic_tags', ''),
            'company': row.get('company', ''),
            'score': float(row.get('score', 0)) if 'score' in row else 0.0,
            'gfg_link': recommender.gfg_link_for_topic(primary_topic) if primary_topic else '',
            'striver_link': recommender.striver_search_link(primary_topic) if primary_topic else ''
        })
        if len(filtered) >= page_size:
            break

    # persist these to history
    if username and filtered:
        update_user_history(username, [f['title'] for f in filtered])

    return jsonify({"recommended": filtered})


@app.route('/append', methods=['POST'])
def append():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    user_df, err = read_uploaded_csv(file)
    if err:
        return jsonify({"error": err}), 400

    try:
        count = recommender.append_new_problems(user_df)
        return jsonify({"appended": int(count)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json or {}
    message = data.get('message', '')
    username = data.get('leetcode_username')
    
    user_df = pd.DataFrame()
    if username:
        try:
            user_df = leetcode.get_user_solved_problems(username)
        except Exception as e:
            return jsonify({"error": f"LeetCode API error: {e}"}), 400
    else:
        file_content = data.get('file_content')
        if file_content:
            try:
                stream = io.StringIO(file_content)
                user_df = pd.read_csv(stream)
            except Exception:
                user_df = pd.DataFrame()

    lower = message.lower()
    if 'recommend' in lower or 'problems' in lower or 'practice' in lower:
        # Ensure recommender ready
        global recommender_ready
        if not recommender_ready:
            try:
                recommender.fit()
                recommender_ready = True
            except Exception as e:
                return jsonify({"error": f"System data load error: {e}. Try again shortly."}), 500

        try:
            history_titles = get_user_history(username) if username else set()
            rf_recs = recommender.recommend_with_rf(user_df, top_n=8)
            if rf_recs is None or rf_recs.empty:
                recs = recommender.recommend(user_df, top_n=8)
            else:
                recs = rf_recs
        except Exception as e:
            return jsonify({"error": str(e)}), 500

        # Build recommended list for chat response, skipping history
        recommended = []
        rec_titles = set()
        for _, row in recs.iterrows():
            topics = str(row.get('topic_tags', '')).split(',') if pd.notna(row.get('topic_tags', None)) else ['']
            primary_topic = topics[0].strip() if topics and topics[0] else ''
            title_norm = str(row.get('title', '')).lower().strip()
            if title_norm in history_titles:
                continue
            rec_titles.add(title_norm)
            recommended.append({
                'title': row.get('title', ''),
                'difficulty': row.get('difficulty', ''),
                'topic_tags': row.get('topic_tags', ''),
                'company': row.get('company', ''),
                'score': float(row.get('score', 0)),
                'gfg_link': recommender.gfg_link_for_topic(primary_topic) if primary_topic else '',
                'striver_link': recommender.striver_search_link(primary_topic) if primary_topic else ''
            })

        # Build others (non-recommended) similar to /recommend
        system = recommender.system_df.copy().reset_index(drop=True)
        user_titles = set(user_df.get('title', pd.Series([], dtype=object)).astype(str).str.lower().str.strip())
        exclude_titles = user_titles.union(rec_titles).union(history_titles)
        candidates = system[~system.get('title', '').astype(str).str.lower().str.strip().isin(exclude_titles)].copy()
        others = []
        if not candidates.empty:
            try:
                sample = candidates.sample(n=min(12, len(candidates)), random_state=42)
            except Exception:
                sample = candidates.head(12)
            for _, row in sample.iterrows():
                topics = str(row.get('topic_tags', '')).split(',') if pd.notna(row.get('topic_tags', None)) else ['']
                primary_topic = topics[0].strip() if topics and topics[0] else ''
                others.append({
                    'title': row.get('title', ''),
                    'difficulty': row.get('difficulty', ''),
                    'topic_tags': row.get('topic_tags', ''),
                    'company': row.get('company', ''),
                    'gfg_link': recommender.gfg_link_for_topic(primary_topic) if primary_topic else '',
                    'striver_link': recommender.striver_search_link(primary_topic) if primary_topic else ''
                })

        # Persist history for this user
        if username and rec_titles:
            update_user_history(username, list(rec_titles))

        # Also include a small conversational summary: weak topics and top 3 rec titles
        weak = recommender.analyze_weak_topics(user_df, top_k=3)
        # If an LLM is enabled, use it to craft a more natural reply
        reply_text = None
        try:
            if llm.is_enabled():
                reply_text = llm.generate_reply(user_message=message, context_text=None, recommendations=recommended, weak_topics=weak)
        except Exception:
            reply_text = None

        if not reply_text:
            weak_text = ', '.join([t for t, _ in weak]) if weak else ''
            top_titles = [r['title'] for r in recommended[:3]]
            reply = ''
            if weak_text:
                reply += f"Based on your profile I suggest focusing on: {weak_text}. "
            if top_titles:
                reply += f"Here are a few problems to start with: {', '.join(top_titles)}."
            if not reply:
                reply = f"Here are {len(recommended)} recommended problems."
        else:
            reply = reply_text

        return jsonify({"reply": reply, "recommended": recommended, "others": others})

    else:
        return jsonify({"reply": "I can recommend problems — try asking 'Recommend problems' or 'Give me problems to practice'"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8501, debug=True)
