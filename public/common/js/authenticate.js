let authForm = document.getElementById(`authForm`)
authForm.onsubmit = async (e) => {
    e.preventDefault();
    authenticateUser();
}

function authenticateUser() {
    let account = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    }
    fetch('/api/auth', {
        method: "POST",
        body: JSON.stringify(account),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json)
            if (json.error) {
                if (json.error == "no auth") {
                    location.href = "http://localhost:8888"
                }
                console.log(`error encountered`);
                console.log(json.error);

                var invalidDataError = document.getElementById('invalidData')
                invalidDataError.className += " display"
                document.getElementById("invalidData").innerHTML = json.error.split('.')[0]
            } else {
                console.log(`redirecting`)
                location.href = json.redirect
            }
        })
        .catch(err => { console.log(err) })
}