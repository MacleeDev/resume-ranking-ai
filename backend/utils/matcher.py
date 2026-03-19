from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")


def calculate_match(resume_text, job_text):
    embeddings = model.encode([resume_text, job_text])

    score = util.cos_sim(embeddings[0], embeddings[1]).item()

    return round(score * 100, 2)


SKILLS_DB = [
    "python",
    "java",
    "c++",
    "c",
    "sql",
    "mysql",
    "fastapi",
    "flask",
    "django",
    "javascript",
    "react",
    "node",
    "express",
    "html",
    "css",
    "bootstrap",
    "machine learning",
    "deep learning",
    "nlp",
    "data analysis",
    "pandas",
    "numpy",
    "git",
    "github",
    "docker",
    "kubernetes",
    "linux",
    "api",
    "rest",
    "mongodb",
]


def extract_skills(text):
    text = text.lower()
    found = []

    for skill in SKILLS_DB:
        if skill in text:
            found.append(skill)

    return list(set(found))


def compare_skills(resume_skills, job_skills):
    matched = list(set(resume_skills) & set(job_skills))
    missing = list(set(job_skills) - set(resume_skills))

    return matched, missing
