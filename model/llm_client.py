import os


class LLMClient:
    """Minimal LLM client wrapper. Currently supports OpenAI via OPENAI_API_KEY.

    Usage:
      - Set environment variable OPENAI_API_KEY to enable OpenAI usage.
      - Optionally set LLM_MODEL to use a different model (default: gpt-3.5-turbo).

    This wrapper provides generate_reply(...) which returns a string reply.
    If no API key is present, the client will be disabled and generate_reply will return None.
    """

    def __init__(self):
        self.provider = os.environ.get('LLM_PROVIDER', 'openai').lower()
        self.api_key = os.environ.get('OPENAI_API_KEY')
        self.model = os.environ.get('LLM_MODEL', 'gpt-3.5-turbo')
        self.enabled = bool(self.api_key and self.provider == 'openai')
        self._client = None
        if self.enabled:
            try:
                import openai
                openai.api_key = self.api_key
                self._client = openai
            except Exception:
                self.enabled = False

    def is_enabled(self):
        return self.enabled

    def generate_reply(self, user_message: str, context_text: str = '', recommendations=None, weak_topics=None) -> str:
        """Generate a conversational reply using the LLM.

        - user_message: original user chat message
        - context_text: short context (like user weak topics summary)
        - recommendations: list of dicts with 'title' and optional fields
        - weak_topics: list of strings

        Returns a string reply or None if LLM is disabled.
        """
        if not self.enabled or self._client is None:
            return None

        # Build a concise prompt using system/user messages
        try:
            # Build messages for chat completion
            rec_titles = []
            if recommendations:
                for r in recommendations[:6]:
                    title = r.get('title') if isinstance(r, dict) else str(r)
                    if title:
                        rec_titles.append(title)

            weak_text = ''
            if weak_topics:
                if isinstance(weak_topics, (list, tuple)):
                    weak_text = ', '.join([t if isinstance(t, str) else str(t[0]) for t in weak_topics[:5]])
                else:
                    weak_text = str(weak_topics)

            system_prompt = (
                "You are a helpful coding tutor assistant. Be concise and actionable. "
                "When a user asks for problem recommendations, provide a short study plan (2-3 steps), "
                "explain why the recommended problems help, and list the top recommended problem titles. "
                "Do not invent problem content; only reference titles provided in context." 
            )

            user_prompt = f"User message: {user_message}\n"
            if weak_text:
                user_prompt += f"Weak topics: {weak_text}\n"
            if rec_titles:
                user_prompt += f"Candidate problems: {', '.join(rec_titles)}\n"

            # Use the OpenAI ChatCompletion API
            resp = self._client.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=300,
                temperature=0.7,
            )
            text = ''
            if resp and 'choices' in resp and len(resp['choices']) > 0:
                text = resp['choices'][0].get('message', {}).get('content', '')
            return text
        except Exception:
            # If the LLM call fails, silently return None so the app falls back
            return None
