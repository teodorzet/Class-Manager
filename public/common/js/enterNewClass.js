document.querySelector('input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        console.log(document.getElementById("enterNewClass").value)

        let classId = {
            class: document.getElementById("enterNewClass").value
        }

        fetch('/api/enter-new-class', {
            method: "POST",
            body: JSON.stringify(classId),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then(response => response.json())
            .then(json => {
                console.log(json)
                if (json.error) {
                    if (json.error == "no auth") {
                        location.href = "http://localhost:8888"
                    }
                    console.log(json.error);
                    document.getElementById("requestMessage").innerHTML = json.error
                    document.getElementById("requestMessage").style = "color : red;"
                } else {
                    console.log(`registered request`)
                    document.getElementById("requestMessage").innerHTML = json.message
                    document.getElementById("requestMessage").style = "color : green;"
                }
            })
            .catch(err => { console.log(err) })
        document.getElementById("enterNewClass").value = ""
    }
});