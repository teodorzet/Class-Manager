let newsTitle = document.getElementById(`newsTitle`)
let newsDescription = document.getElementById("newsBodyInput")
let fileInput = document.getElementById(`fileInput`)
let newsForm = document.getElementById(`newsForm`)
newsForm.onsubmit = async (e) => {
    e.preventDefault();
    upload(fileInput, fileInput.value, newsTitle.value, newsDescription.value, localStorage.getItem("class"));
}

const upload = (file, fileName, title, description, classId) => {
    var url = new URL('http://localhost:8888/api/upload')
    var params = { classId: classId, fileName: fileName, title: title, description: description }
    url.search = new URLSearchParams(params).toString();
    console.log(url);
    fetch(url, { // Your POST endpoint
        method: 'POST',
        body: file
    }).then(
        response => response.json()
    ).then(
        success => {
            console.log(success)
            if (success.message) {
                document.getElementById("requestMessage").innerHTML = success.message
                document.getElementById("requestMessage").style = "color : green; font-size: 20px"
            } else {
                if (success.error == "no auth") {
                    location.href = "http://localhost:8888"
                }
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