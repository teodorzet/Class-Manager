console.log("a intrat")

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

async function download(assignmentId) {
    try {
        var url = new URL('http://localhost:8888/api/download')
        var params = { assignmentId: assignmentId }
        url.search = new URLSearchParams(params).toString();
        const res = await fetch(url, {
            method: 'GET'
        })
        const content = await res.body;
        const reader = content.getReader()



        // const stream = new content.Readable() // any Node.js readable stream
        // const blob = await streamToBlob(stream)
        // console.log(blob)
        // console.log(`data retrieved is  ${blob}`)

        // const newBlob = new Blob([blob]);
        // const blobUrl = window.URL.createObjectURL(newBlob);


        // const link = document.createElement('a');
        // link.href = blobUrl;
        // link.setAttribute('download', `file.txt`);
        // // link.setAttribute('download', `${filename}.${extension}`);
        // document.body.appendChild(link);
        // link.click();
        // link.parentNode.removeChild(link);
        // window.URL.revokeObjectURL(blob);

    } catch (error) {
        console.error(error)
    }
}

async function downloadFile(data, filename) {
    let encoding = await data.arrayBuffer()
    let blob = new Blob([encoding]) //{ type: 'text/plain'}
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

function fetchFile(assignmentId, type) {
    var url = new URL('http://localhost:8888/api/download')
    var params = {
        assignmentId: assignmentId,
        type : type
}
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
        document.getElementById("downloadAssignment").onclick = function () { fetchFile(localStorage.getItem("assignment"), "teacher") }
    }
}
