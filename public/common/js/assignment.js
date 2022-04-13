assignmentInfo()

function assignmentInfo() {
    fetch('/api/assignment?id=' + localStorage.getItem("assignment"), {
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
                console.log(json)
                fillAssignmentInfo(json)
            }
        })
        .catch(err => { console.log(err) })
}

async function downloadFile(data, filename) {
    let encoding = await data.arrayBuffer()
    let blob = new Blob([encoding])
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    if (filename) {
        a.download = filename.split("=")[1];
    } else {
        a.download = "attachment.zip";
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setTimeout(() => URL.revokeObjectURL(a.href), 7000);
}

function fetchFile(assignmentId) {
    var url = new URL('http://localhost:8888/api/download')
    var params = { assignmentId: assignmentId }
    url.search = new URLSearchParams(params).toString()
    fetch(url, {
        method: "GET"
    })
        .then((response) => {
            console.log('resp', response);
            return response
        }).then((data) => {
            downloadFile(data, data.headers.get(`Content-Disposition`))
        }).catch(err => console.error(err));
}

function fillAssignmentInfo(assignment) {

    var header = document.getElementById('assignmentTitle')
    header.innerHTML = assignment.title

    var author = document.getElementById('teacher')
    author.innerHTML = assignment.teacher

    var postedAt = document.getElementById('postedAt')
    postedAt.innerHTML = assignment.created_at

    var deadline = document.getElementById('deadline')
    deadline.innerHTML = assignment.deadline

    var extra = document.getElementById('assignmentBody')
    extra.innerHTML = assignment.body

    var parentElement = document.getElementById("assignmentInfo")
    if (assignment.files != null && assignment.files != '') {
        console.log(`create button`)
        var button = document.createElement('button')
        button.className = "downloadButton"
        button.innerHTML = "Download "
        button.id = "downloadAssignment"
        var icon = document.createElement('i')
        icon.className = "fa fa-download"
        button.append(icon)
        parentElement.appendChild(button)
        document.getElementById("downloadAssignment").onclick = function () { fetchFile(localStorage.getItem("assignment")) }
    }
}

const upload = (file, assignmentId, assignmentText, fileName) => {
    var url = new URL('http://localhost:8888/api/upload')
    var params = { assignmentId: assignmentId, assignmentText: assignmentText, fileName: fileName }
    url.search = new URLSearchParams(params).toString();
    fetch(url, {
        method: 'POST',
        body: file // file object
    }).then(
        response => response.json()
    ).then(
        success => {
            console.log(success)
            if (success.message) {
                document.getElementById("requestMessage").innerHTML = success.message
                document.getElementById("requestMessage").style = "color : green; font-size: 20px"
            } else {
                document.getElementById("requestMessage").innerHTML = success.error
                document.getElementById("requestMessage").style = "color : red; font-size: 20px"
            }
        }
    ).catch(
        error => {
            console.log(error)
        }
    );
};

let submitForm = document.getElementById(`assignmentForm`)
let assignmentTextField = document.getElementById(`assignmentText`)
let fileInput = document.getElementById(`fileInput`)
submitForm.onsubmit = async (e) => {
    e.preventDefault();
    console.log(`form submit`)
    let assignmentId = localStorage.getItem(`assignment`)
    upload(fileInput.files[0], assignmentId, assignmentTextField.value, fileInput.value);
}