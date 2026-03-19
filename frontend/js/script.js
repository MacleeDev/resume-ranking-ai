// Get elements
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const analyzeBtn = document.getElementById("analyze-btn");
const jobDesc = document.getElementById("job-desc");
const resultsDiv = document.getElementById("results");
const scoreFill = document.getElementById("score-fill");
const matchScoreSpan = document.getElementById("match-score");
const matchedSkillsList = document.getElementById("matched-skills");
const missingSkillsList = document.getElementById("missing-skills");
const downloadBtn = document.getElementById("download-btn");

let uploadedFile = null;

// Drag & drop
dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => uploadedFile = e.target.files[0]);
dropArea.addEventListener("dragover", (e) => e.preventDefault());
dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadedFile = e.dataTransfer.files[0];
});

// Analyze
analyzeBtn.addEventListener("click", async () => {
    if (!uploadedFile) return alert("Please upload a PDF!");
    if (!jobDesc.value) return alert("Please enter a job description!");

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("job_description", jobDesc.value);

    try {
        const res = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        showResults(data);
    } catch (err) {
        console.error(err);
        alert("Error fetching API. Make sure backend is running and CORS is enabled.");
    }
});

// Show results
function showResults(data) {
    resultsDiv.classList.remove("hidden");

    // Match score
    matchScoreSpan.textContent = data.match_score.toFixed(2);
    scoreFill.style.width = `${data.match_score}%`;

    // Matched skills
    matchedSkillsList.innerHTML = "";
    data.matched_skills.forEach(skill => {
        const li = document.createElement("li");
        li.textContent = skill;
        li.style.color = "green";
        matchedSkillsList.appendChild(li);
    });

    // Missing skills
    missingSkillsList.innerHTML = "";
    data.missing_skills.forEach(skill => {
        const li = document.createElement("li");
        li.textContent = skill;
        li.style.color = "red";
        missingSkillsList.appendChild(li);
    });

    // Show download button
    downloadBtn.classList.remove("hidden");

    // Download PDF
    downloadBtn.onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text("Resume AI Analysis", 14, 20);

        // Match score
        doc.setFontSize(14);
        doc.text(`Match Score: ${data.match_score.toFixed(2)}%`, 14, 35);

        // Progress bar
        const barWidth = 180;
        const barHeight = 10;
        const filledWidth = (data.match_score / 100) * barWidth;
        doc.setDrawColor(0);
        doc.rect(14, 40, barWidth, barHeight);
        doc.setFillColor(40, 167, 69);
        doc.rect(14, 40, filledWidth, barHeight, "F");

        let yPos = 60;

        // Matched skills
        doc.setTextColor(0, 128, 0);
        doc.text("Matched Skills:", 14, yPos);
        yPos += 7;
        data.matched_skills.forEach(skill => { doc.text(`- ${skill}`, 20, yPos); yPos += 7; });

        // Missing skills
        yPos += 5;
        doc.setTextColor(255, 0, 0);
        doc.text("Missing Skills:", 14, yPos);
        yPos += 7;
        data.missing_skills.forEach(skill => { doc.text(`- ${skill}`, 20, yPos); yPos += 7; });

        // Suggestions
        yPos += 5;
        doc.setTextColor(0, 0, 255);
        doc.text("Suggestions:", 14, yPos);
        yPos += 7;
        data.suggestions.forEach(s => { doc.text(`- ${s}`, 20, yPos); yPos += 7; });

        doc.save("resume_analysis.pdf");
    };
}