retrieveCourseData()

function retrieveCourseData() {
    fetch('/api/course/load?class=' + localStorage.getItem("class"), {
        method: "GET",
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
                console.log(`error encountered`);
                console.log(json.error);
            } else {
                //console.log('requests')
                console.log(json)
                buildClassInfo(json)
            }
        })
        .catch(err => { console.log(err) })
}

function buildClassInfo(json) {
    document.getElementById("className").value = json.classInfo[0].title
    document.getElementById("classDate").value = json.classInfo[0].day_of_occurence
    document.getElementById("classHourStart").value = json.classInfo[0].start_class
    document.getElementById("classHourEnd").value = json.classInfo[0].end_class
    document.getElementById("classLink").value = json.classInfo[0].course_site_link
    document.getElementById("classComponents").value = json.classInfo[0].no_components
    document.getElementById("classFormula").value = json.classInfo[0].formula
    document.getElementById("classOtherPlatforms").value = json.classInfo[0].other_platforms
}

let update = document.getElementById(`updateClass`)
update.onsubmit = async (e) => {
    e.preventDefault();
    updateClass();
}

function updateClass() {

    var classInfo = {
        classId: localStorage.getItem("class"),
        className: document.getElementById("className").value,
        classDate: document.getElementById("classDate").value,
        classHourStart: document.getElementById("classHourStart").value,
        classHourEnd: document.getElementById("classHourEnd").value,
        classLink: document.getElementById("classLink").value,
        classComponents: document.getElementById("classComponents").value,
        classFormula: document.getElementById("classFormula").value,
        classOtherPlatforms: document.getElementById("classOtherPlatforms").value
    }

    console.log(classInfo)

    fetch('/api/update/class', {
        method: "POST",
        body: JSON.stringify(classInfo),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json)
            if (json.error) {
                console.log(json.error);
                document.getElementById("requestMessage").innerHTML = json.error
                document.getElementById("requestMessage").style = "color : red; text-align: center"
            } else {
                console.log(`update done`)
                document.getElementById("requestMessage").innerHTML = json.message
                document.getElementById("requestMessage").style = "color : green; text-align: center"
            }
        })
        .catch(err => { console.log(err) })
}