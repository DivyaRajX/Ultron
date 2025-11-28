from flask import Flask, request, jsonify, send_from_directory
from utils import extract_text_from_pdf, analyze_resume
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return send_from_directory("", "index.html")

@app.route("/static/<path:path>")
def send_static(path):
    return send_from_directory("static", path)

@app.route("/analyze", methods=["POST"])
def analyze():
    if "resume" not in request.files or "role" not in request.form:
        return jsonify({"error": "Missing input"}), 400

    pdf_file = request.files["resume"]
    role = request.form["role"]

    pdf_path = "uploaded_resume.pdf"
    pdf_file.save(pdf_path)

    text = extract_text_from_pdf(pdf_path)
    result = analyze_resume(text, role)

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
