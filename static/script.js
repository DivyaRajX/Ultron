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
    .then(res => {
        console.log(res)

        document.getElementById("result").innerHTML = `
            <h2>Message: ${res.message}</h2>
            <h3>Score: ${res.score}</h3>
            <p><b>Missing Keywords:</b> ${res.missing_keywords.join(", ")}</p>
        `;
    });
}
