let registerForm = document.getElementById(`newClassForm`)
registerForm.onsubmit = async (e) => {
    e.preventDefault();
    createClass();
}

function createClass() {
    var e = document.getElementById("classDate");
    var day = e.options[e.selectedIndex].text;

    e = document.getElementById("classComponents")
    components = e.options[e.selectedIndex].text;

    let newClass = {
        className: document.getElementById("className").value,
        classDate: day,
        classHourStart: document.getElementById("classHourStart").value,
        classHourEnd: document.getElementById("classHourEnd").value,
        classLink: document.getElementById("classLink").value,
        classComponents: components,
        classFormula: document.getElementById("classFormula").value,
        classOtherPlatforms: document.getElementById("classOtherPlatforms").value
    }
    console.log(newClass)
    fetch('/api/create-class', {
        method: "POST",
        body: JSON.stringify(newClass),
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
            } else {
                console.log(json)
                // location.href = "http://localhost:8888/teacher/html/profHomePage.html"
            }
        })
        .catch(err => { console.log(err) })
}