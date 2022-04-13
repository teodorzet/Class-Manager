retrieveCourseData()

function retrieveCourseData() {
    fetch('/api/course?class=' + localStorage.getItem("class"), {
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
                buildUpCourse(json, localStorage.getItem("class"))
            }
        })
        .catch(err => { console.log(err) })
}

function buildUpCourse(classInfo, classId) {
    document.getElementById("courseTitle").innerHTML = classInfo.title
    document.getElementById("teacherSite").innerHTML = classInfo.teacher_site
    document.getElementById("platforms").innerHTML = classInfo.other_platforms
    document.getElementById("schedule").innerHTML = classInfo.schedule
    document.getElementById("classId").innerHTML = classId
    document.getElementById("code").innerHTML = classInfo.enter_code
}

function getCode(classId) {
    var url = new URL('http://localhost:8888/api/start')
    var params = { class: classId }
    url.search = new URLSearchParams(params).toString();
    fetch(url, {
        method: 'PUT',
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.code)
            document.getElementById("code").innerHTML = data.code
        })
        .catch(
            error => console.log(error)
        );
}

let startButton = document.getElementById('startClass')
startButton.onsubmit = async (e) => {
    e.preventDefault();
    getCode(localStorage.getItem("class"))
}