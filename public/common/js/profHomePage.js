handleJWT()

function handleJWT() {
    console.log(`redirect@auth`)
    fetch('/api/user', {
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
                redirectToHomePage(json)
            }
        })
        .catch(err => { console.log(err) })
}

function redirectToHomePage(user) {
    console.log(`redirectToHomePage@auth`)
    fetch('/api/homepage', {
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
                buildUpHomePage(json.classes)
            }
        })
        .catch(err => { console.log(err) })
}

function buildUpHomePage(classes) {

    var parentElement = document.getElementById("myClasses")
    for (var i = 0; i < classes.length; i++) {
        console.log(classes[i].surname);
        console.log(classes[i].name);
        console.log(classes[i].title);

        var childElement = document.createElement('a')
        childElement.className = "classRect"
        childElement.href = "http://localhost:8888/teacher/html/profClass.html"
        childElement.classID = classes[i].id

        let topOfRect = document.createElement('div')
        topOfRect.className = "topOfRect"

        let className = document.createElement('p')
        className.className = "className"
        className.innerHTML = classes[i].title

        let teacher = document.createElement('p')
        teacher.className = "authorOfClassName"
        teacher.innerHTML = classes[i].name + " " + classes[i].surname


        let separator = document.createElement('div')
        separator.className = "classSeparator"

        topOfRect.appendChild(className)
        topOfRect.appendChild(teacher)
        topOfRect.appendChild(separator)

        let bottomOfRect = document.createElement('div')
        bottomOfRect.className = "bottomOfRect"

        childElement.appendChild(topOfRect)
        topOfRect.appendChild(bottomOfRect)

        parentElement.appendChild(childElement)
    }

    var myClasses = document.getElementById('myClasses')
    for (i = 0; i < myClasses.childNodes.length; i++) {
        console.log(myClasses.childNodes[i].classID)
        let classID = myClasses.childNodes[i].classID
        myClasses.childNodes[i].onclick = function () {
            console.log(`clicked class wiht id ` + classID)
            localStorage.setItem("class", classID)
        }
    }
}