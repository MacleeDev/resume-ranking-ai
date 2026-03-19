from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

# Import your utils
from utils.parser import extract_text_from_pdf
from utils.matcher import calculate_match, extract_skills, compare_skills
from utils.cleaner import clean_text

app = FastAPI()

# -----------------------------
# CORS: allow frontend calls
# -----------------------------
origins = [
    "http://127.0.0.1:5500",  # your frontend local server
    "http://localhost:5500",
    # "*"  # you can use "*" for testing (all origins)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Analyze endpoint
# -----------------------------
@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...), job_description: str = Form(...)
):
    # Step 1: extract text from PDF
    resume_text = extract_text_from_pdf(file.file)

    # Step 2: clean text
    resume_text = clean_text(resume_text)
    job_text = clean_text(job_description)

    # Step 3: calculate match score
    score = calculate_match(resume_text, job_text)

    # Step 4: extract and compare skills
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_text)

    matched, missing = compare_skills(resume_skills, job_skills)

    # Step 5: return JSON response
    return {
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "suggestions": [f"Add {skill} to your resume" for skill in missing],
    }


@app.get("/")
def home():
    return {"message": "Resume AI API is running 🚀"}
