retrieveCourseData()

function retrieveCourseData() {

    console.log(localStorage.getItem("class"))
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
                retrieveStudentGrades(json)
            }
        })
        .catch(err => { console.log(err) })
}

function retrieveStudentGrades(classInfo) {
    console.log(localStorage.getItem("class"))
    fetch('/api/grades?class=' + localStorage.getItem("class"), {
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
                buildUpCourse(classInfo, json)
            }
        })
        .catch(err => { console.log(err) })
}

function buildUpCourse(classInfo, studentGrades) {

    var enterCodeBox = document.createElement('input')

    enterCodeBox.className = "classCode"
    enterCodeBox.id = "classCode"
    enterCodeBox.type = "text"

    document.getElementById("courseTitle").innerHTML = classInfo.title
    document.getElementById("teacher").innerHTML = classInfo.teacher
    document.getElementById("teacherSite").innerHTML = classInfo.teacher_site
    document.getElementById("platforms").innerHTML = classInfo.other_platforms
    document.getElementById("schedule").innerHTML = classInfo.schedule + "  -  mark as present "

    let grades = ""

    if (studentGrades.c1 != null) {
        grades += studentGrades.c1
    }
    if (studentGrades.c2 != null) {
        grades += ', '
        grades += studentGrades.c2
    }
    if (studentGrades.c3 != null) {
        grades += ', '
        grades += studentGrades.c3
    }
    if (studentGrades.c4 != null) {
        grades += ', '
        grades += studentGrades.c3
    }
    if (studentGrades.c5 != null) {
        grades += ', '
        grades += studentGrades.c3
    }
    if (studentGrades.bonus != null) {
        grades += ', '
        grades += studentGrades.bonus
        grades += '(bonus)'
    }
    document.getElementById("grades").innerHTML = grades
    document.getElementById("schedule").appendChild(enterCodeBox)

    document.querySelector('input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log(`tryna mark as present worked`)
            let classEnterCode = {
                code: document.getElementById("classCode").value
            }

            console.log(classEnterCode)
            fetch('/api/present?class=' + localStorage.getItem("class"), {
                    method: "POST",
                    body: JSON.stringify(classEnterCode),
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
                        document.getElementById("requestMessage").style = "color : red; "
                    } else {
                        console.log(`registered request`)
                        document.getElementById("requestMessage").innerHTML = json.message
                        document.getElementById("requestMessage").style = "color : green;"
                    }
                })
                .catch(err => { console.log(err) })
            document.getElementById("classCode").value = ""
        }
    });
}

retrieveAssignmentsData()

function retrieveAssignmentsData() {
    fetch('/api/assignments?class=' + localStorage.getItem("class"), {
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
                buildUpAssignmentsPart(json)
            }
        })
        .catch(err => { console.log(err) })

}

function buildUpAssignmentsPart(assignments) {
    console.log(`build assignments`)
    console.log(assignments.assignments.length)
    var parentElement = document.getElementById("myAssignments")
    parentElement.className = "assignments"
    for (var i = 0; i < assignments.assignments.length; i++) {

        var childElement = document.createElement('a')
        childElement.className = "assignment_container"
        childElement.href = "http://localhost:8888/student/html/assignment.html"
        childElement.assignmentID = assignments.assignments[i].id


        let assignmentTitle = document.createElement('div')
        if (assignments.assignments[i].status == 0) {
            assignmentTitle.className = "assignmentTitleToDo"
        } else {
            assignmentTitle.className = "assignmentTitleDone"
        }

        let assignmentName = document.createElement('p')
        assignmentName.className = "assignmentName"
        let titleContent = document.createElement('b')
        titleContent.innerHTML = assignments.assignments[i].title

        assignmentName.appendChild(titleContent)
        assignmentTitle.appendChild(assignmentName)

        let assignmentInfoBody = document.createElement('div')
        if (assignments.assignments[i].status == 0) {
            assignmentInfoBody.className = "assignmentInfoToDo"
        } else {
            assignmentInfoBody.className = "assignmentInfoDone"
        }

        let author = document.createElement('p')
        author.innerHTML = `Author : ` + assignments.assignments[i].teacher
        author.id = "author"
        let postedAt = document.createElement('p')
        postedAt.innerHTML = `Posted at : ` + assignments.assignments[i].created_at
        postedAt.id = "postedAt"
        let deadline = document.createElement('p')
        deadline.innerHTML = `Deadline: ` + assignments.assignments[i].deadline
        deadline.id = "deadline"

        assignmentInfoBody.appendChild(author)
        assignmentInfoBody.appendChild(postedAt)
        assignmentInfoBody.appendChild(deadline)

        childElement.appendChild(assignmentTitle)
        childElement.appendChild(assignmentInfoBody)

        parentElement.appendChild(childElement)
    }

    var myAssignments = document.getElementById('myAssignments')
    for (i = 0; i < myAssignments.childNodes.length; i++) {
        let assignmentID = myAssignments.childNodes[i].assignmentID
        myAssignments.childNodes[i].onclick = function() {
            console.log(`clicked assignment with id ` + assignmentID)
            localStorage.setItem("assignment", assignmentID)
        }
    }

}