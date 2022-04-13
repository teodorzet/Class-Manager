getAssignments()

function getAssignments() {
    fetch('/api/assignment/assignments?assignment=' + localStorage.getItem("assignment"), {
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
                buildAssignments(json)
            }
        })
        .catch(err => { console.log(err) })
}

function buildAssignments(json) {
    console.log(json)
    for (let i = 0; i < json.rowCount; i++) {
        //console.log(i)
        /*         <a href="../others/922020e567654f5aa59ea53b7b16826b-removebg-preview.png" download>
                    <div class="request">
        
                        <br>
        
                            <p><b>Zet Teodor</b></p>
        
                            <br>
        
                                <p>Laboratorul din saptamana a 8-a</p>
        
                                <br>
        
                                    <p class="click">Click to download the attachment</p>
        
                                    <br>
                        </div>
                    </a> */
        if (json.rows[i].files != 0 && json.rows[i].files != null) {
            //console.log("are download")
            let a = document.createElement('a')
            let div = document.createElement('div')
            div.className = "request"
            let br1 = document.createElement('br')
            let br2 = document.createElement('br')
            let br3 = document.createElement('br')
            let br4 = document.createElement('br')

            let pName = document.createElement('p')
            pName.innerHTML = json.rows[i].name.bold() + " " + json.rows[i].surname.bold()

            let pBody = document.createElement('p')
            pBody.innerHTML = json.rows[i].body

            if (json.rows[i].body == null)
                pBody.innerHTML = "The assignment is empty."

            div.appendChild(br1)
            div.appendChild(pName)
            div.appendChild(br2)
            div.appendChild(pBody)
            div.appendChild(br3)

            let pClick = document.createElement('p')
            pClick.className = "click"
            pClick.innerHTML = "Click to download the attachment"
            div.appendChild(pClick)
            div.appendChild(br4)

            a.appendChild(div)

            a.onclick = function () {
                fetchFile(json.rows[i].id, "student")
            }

            document.getElementById("listOfRequests").appendChild(a)
        } else {
            //console.log("nu are download")
            /* <div class="request">

                <br>

                    <p><b>Popa Ionel</b></p>

                    <br>

                        <p>Imi pare rau dar nu am reusit sa rezolv laboratorul. Promit sa il trimit pe urmatorul.</p>

                        <br>
            </div> */
            let div = document.createElement('div')
            div.className = "request"
            let br1 = document.createElement('br')
            let br2 = document.createElement('br')
            let br3 = document.createElement('br')


            let pName = document.createElement('p')
            pName.innerHTML = json.rows[i].name.bold() + " " + json.rows[i].surname.bold()

            let pBody = document.createElement('p')
            pBody.innerHTML = json.rows[i].body

            if (json.rows[i].body == null)
                pBody.innerHTML = "The assignment is empty."

            div.appendChild(br1)
            div.appendChild(pName)
            div.appendChild(br2)
            div.appendChild(pBody)
            div.appendChild(br3)

            document.getElementById("listOfRequests").appendChild(div)
        }

    }
}

function fetchFile(assignmentId, type) {
    var url = new URL('http://localhost:8888/api/download')
    var params = {
        assignmentId: assignmentId,
        type: type
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