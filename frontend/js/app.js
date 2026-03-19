async function analyze() {
    const file = document.getElementById("resume").files[0];
    const jobDesc = document.getElementById("jobDesc").value;

    let formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDesc);

    const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    document.getElementById("result").innerHTML = `
        <h2>Match Score: ${data.match_score}%</h2>
        <p>Matched Skills: ${data.matched_skills.join(", ")}</p>
        <p>Missing Skills: ${data.missing_skills.join(", ")}</p>
    `;
}