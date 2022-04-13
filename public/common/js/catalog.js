retrieveCourseCatalog()

function retrieveCourseCatalog() {
    console.log(localStorage.getItem("class"))
    fetch('/api/catalog?class=' + localStorage.getItem("class"), {
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
                console.log('students data')
                console.log(json)
                buildCatalog(json)
            }
        })
        .catch(err => { console.log(err) })
}

function buildCatalog(res) {
    console.log(res.numberOfComponents)

    document.getElementById("myHeader").getElementsByTagName("b")[0].innerHTML = res.title

    var catalog = document.getElementById("catalog")

    var tr = document.createElement('tr')
    var th1 = document.createElement('th')
    th1.innerHTML = "Name"
    var th2 = document.createElement('th')
    th2.innerHTML = "Presences"
    tr.appendChild(th1)
    tr.appendChild(th2)

    for (let i = 1; i <= res.numberOfComponents; i++) {
        var th = document.createElement('th')
        th.innerHTML = "C" + i
        th.className = "c" + i
        tr.appendChild(th)
    }

    var th3 = document.createElement('th')
    th3.innerHTML = "Bonus"
    var th4 = document.createElement('th')
    th4.innerHTML = "Final Grade"
    tr.appendChild(th3)
    tr.appendChild(th4)

    catalog.appendChild(tr)

    for (let i = 0; i < res.numberOfStudents; i++) {
        var tr = document.createElement('tr')
        tr.id = i
        var td1 = document.createElement('td')
        td1.innerHTML = res.students[i].surname + " " + res.students[i].name
        td1.className = res.students[i].id_student
        var td2 = document.createElement('td')
        td2.innerHTML = res.students[i].presences
        tr.appendChild(td1)
        tr.appendChild(td2)

        for (let j = 1; j <= res.numberOfComponents; j++) {
            var td = document.createElement('td')
            td.contentEditable = 'true'
            if (j == 1) {
                td.innerHTML = res.students[i].c1
                td.className = 'c1'
            }
            if (j == 2) {
                td.innerHTML = res.students[i].c2
                td.className = 'c2'
            }
            if (j == 3) {
                td.innerHTML = res.students[i].c3
                td.className = 'c3'
            }
            if (j == 4) {
                td.innerHTML = res.students[i].c4
                td.className = 'c4'
            }
            if (j == 5) {
                td.innerHTML = res.students[i].c5
                td.className = 'c5'
            }

            tr.appendChild(td)
        }

        var td3 = document.createElement('td')
        td3.innerHTML = res.students[i].bonus
        td3.contentEditable = 'true'
        td3.className = 'bonus'
        var td4 = document.createElement('td')
        td4.innerHTML = 0
        td4.className = 'finalGrade'

        tr.appendChild(td3)
        tr.appendChild(td4)

        catalog.appendChild(tr)

        getFinalGrade(res.students[i], i)

        localStorage.setItem("numberOfStudents", res.numberOfStudents)
        localStorage.setItem("numberOfComponents", res.numberOfComponents)
    }
}

function saveCatalog() {

    var students = localStorage.getItem("numberOfStudents")
    var components = localStorage.getItem("numberOfComponents")

    //console.log(students)
    //console.log(components)

    var arrayOfStudents = new Array()

    for (let i = 0; i < students; i++) {
        var studentsValues = {
            id: undefined,
            c1: undefined,
            c2: undefined,
            c3: undefined,
            c4: undefined,
            c5: undefined,
            bonus: undefined
        }
        //console.log(document.getElementById(i).getElementsByTagName('td')[0])
        studentsValues.id = document.getElementById(i).getElementsByTagName('td')[0].className
        for (let j = 0; j < components; j++) {
            if (j == 0) {
                var value = document.getElementById(i).getElementsByClassName('c1')[0].innerHTML
                if (value != 0)
                    studentsValues.c1 = value
            }
            if (j == 1) {
                var value = document.getElementById(i).getElementsByClassName('c2')[0].innerHTML
                if (value != 0)
                    studentsValues.c2 = value
            }
            if (j == 2) {
                var value = document.getElementById(i).getElementsByClassName('c3')[0].innerHTML
                if (value != 0)
                    studentsValues.c3 = value
            }
            if (j == 3) {
                var value = document.getElementById(i).getElementsByClassName('c4')[0].innerHTML
                if (value != 0)
                    studentsValues.c4 = value
            }
            if (j == 4) {
                var value = document.getElementById(i).getElementsByClassName('c5')[0].innerHTML
                if (value != 0)
                    studentsValues.c5 = value
            }
        }
        studentsValues.bonus = document.getElementById(i).getElementsByClassName('bonus')[0].innerHTML
        if (studentsValues.bonus == 0) {
            studentsValues.bonus = undefined
        }
        //console.log(studentsValues)
        arrayOfStudents[i] = studentsValues
    }
    console.log(arrayOfStudents)


    fetch('/api/catalog/save?class=' + localStorage.getItem("class"), {
        method: "PUT",
        body: JSON.stringify(arrayOfStudents),
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
                console.log(json)
            }
        })
        .catch(err => { console.log(err) })

}

function getFinalGrade(student, i) {

    fetch('/api/catalog/calculateFinalGrade', {
        method: "POST",
        body: JSON.stringify(student),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
        .then(response => response.json())
        .then(json => {
            //console.log(json)
            if (json.error) {
                console.log(`error encountered`);
                console.log(json.error);
            } else {
                document.getElementById(i).getElementsByClassName('finalGrade')[0].innerHTML = json.result
            }
        })
        .catch(err => { console.log(err) })
}

function exportCSV() {
    var csv = [];
    var rows = document.querySelectorAll("table tr");

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);

        csv.push(row.join(","));
    }

    // Download CSV file
    filename = "Catalog_" + document.getElementById("myHeader").getElementsByTagName("b")[0].innerHTML + ".csv"
    console.log(filename)
    downloadCSV(csv.join("\n"), filename);
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], { type: "text/csv" });

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

function exportPDF() {
    var doc = new jsPDF('p', 'pt', 'letter');
    var htmlstring = '';
    var tempVarToCheckPageHeight = 0;
    var pageHeight = 0;
    pageHeight = doc.internal.pageSize.height;
    margins = {
        top: 150,
        bottom: 60,
        left: 40,
        right: 40,
        width: 600
    };
    var y = 20;
    doc.setLineWidth(2);
    doc.autoTable({
        html: '#catalog',
        startY: 70,
        theme: 'grid',
        columnStyles: {
            0: {
                cellWidth: 100,
            },
            1: {
                cellWidth: 100,
            }
        },
        styles: {
            minCellHeight: 20
        },
    })
    doc.save("Catalog_" + document.getElementById("myHeader").getElementsByTagName("b")[0].innerHTML + ".pdf");
}

function exportHTML() {
    var elHtml = document.getElementById("catalog").innerHTML;
    var link = document.createElement('a');
    mimeType = 'text/plain';

    link.setAttribute('download', "Catalog_" + document.getElementById("myHeader").getElementsByTagName("b")[0].innerHTML + ".html");
    link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(elHtml));
    link.click();
}