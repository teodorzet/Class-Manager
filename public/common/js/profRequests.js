retrieveCourseRequests()

function retrieveCourseRequests() {
    fetch('/api/requests?class=' + localStorage.getItem("class"), {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json)
            if (json.error) {
                console.log(`error encountered`);
                console.log(json.error);
            } else {
                //console.log('requests')
                //console.log(json)
                buildRequests(json)
            }
        })
        .catch(err => { console.log(err) })
}

function buildRequests(json) {
    if (json.requests.length == 0) {
        let p = document.createElement('p')
        p.innerHTML = "There are no requests."
        p.style = "text-align: center"

        document.getElementById("listOfRequests").appendChild(p)
    }

    for (let i = 0; i < json.requests.length; i++) {
        console.log("adding request")
        /*             < div class="request" >
                        <p>Zet Teodor</p>
                        <form>
                            <button class="acceptRequest">
                                Accept
                            </button>
        
                            <button class="declineRequest">
                                Decline
                            </button>
                        </form>
        
                    </div > */

        let div = document.createElement('div')
        div.className = "request"
        div.id = json.requests[i].id

        let form = document.createElement("form")
        let p = document.createElement("p")
        p.innerHTML = json.requests[i].name + " " + json.requests[i].surname
        let buttonAccept = document.createElement("button")
        buttonAccept.className = "acceptRequest"
        buttonAccept.innerHTML = "Accept"
        buttonAccept.type = "submit"
        buttonAccept.addEventListener("click", function () {
            processRequest(true, json.requests[i].id_student, div.id)
        })

        let buttonDecline = document.createElement("button")
        buttonDecline.className = "declineRequest"
        buttonDecline.innerHTML = "Decline"
        buttonDecline.type = "submit"
        buttonDecline.addEventListener("click", function () {
            processRequest(false, json.requests[i].id_student, div.id)
        })

        form.appendChild(buttonAccept)
        form.appendChild(buttonDecline)
        div.appendChild(p)
        div.appendChild(form)

        document.getElementById("listOfRequests").appendChild(div)

    }
}

function processRequest(res, idStudent, idRequest) {
    console.log(res, idStudent)
    let req = {
        answer: res,
        idStudent: idStudent,
        idRequest: idRequest
    }

    fetch('/api/request?class=' + localStorage.getItem("class"), {
        method: "DELETE",
        body: JSON.stringify(req),
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
            }
        })
        .catch(err => { console.log(err) })
}