function analyze() {
    let file = document.getElementById("resume").files[0];
    let role = document.getElementById("role").value;

    let formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    fetch("/analyze", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("result").innerHTML = `
            <h3>Score: ${data.score}</h3>
            <p><b>Missing Keywords:</b> ${data.missing_keywords.join(", ")}</p>
        `;
    });
}
