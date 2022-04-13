const fs = require('fs')
const { checkIfUsernameExists } = require('../utils/database')
const conn = require('../utils/database')
const schemas = require(`../models/models`)
const { StatusCodes, MOVED_PERMANENTLY } = require('http-status-codes')
const json = require(`../utils/handleJson`)
const jwt = require('jsonwebtoken');
const config = require(`../utils/config`)
const parseCookies = require(`../utils/cookieParser`)
const math = require('mathjs')
const { getUploadFile, sendDownloadFile } = require('../utils/handleFiles')
var moment = require('moment');

function decryptToken(req) {
    var token = parseCookies.parseCookies(req);
    var data;
    try {
        data = jwt.verify(token.myCookie, config.secret)
    } catch (error) {
        console.log(`no token provied. data: ${JSON.stringify(data)}`)
        return undefined
    }
    return data
}

function register(req, res) {
    json.requestJSON(req, res, function(recievedJSON) {
        const { error, value } = schemas.accountModel.validate(recievedJSON)
        if (error) {
            res.statusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, {
                error: error.message
            })
            return
        }
        conn.checkIfUserExists(recievedJSON, function(err, data) {
            if (err) {
                res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
                json.responseJSON(res, {
                    error: err.message
                })
                console.log(err.message)
                return
            } else {
                console.log("result from db is : ", data.rowCount);
                if (data.rowCount == 1) {
                    res.statusCode = 300;
                    json.responseJSON(res, {
                        registered: false,
                        error: "Unavailable username"
                    })
                    return
                } else {
                    conn.saveUser(recievedJSON, res)
                }
            }
        });
    })
}

function authenticate(req, res) {
    json.requestJSON(req, res, function(recievedJSON) {
        const { error, account } = schemas.authModel.validate(recievedJSON)
        if (error) {
            res.statusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, {
                error: error.message
            })
            return
        } else {
            conn.checkAuthData(recievedJSON, res)
        }
    })
}

function identifyUser(req, res) {
    let data = decryptToken(req)
    conn.returnUserById(data.id, res)
}

function homepage(req, res) {
    let data = decryptToken(req);
    conn.findUserById(data.id, function(err, user) {
        if (err) {
            res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            json.responseJSON(res, {
                error: err.message
            })
            console.log(err.message)
            return
        } else {
            conn.findUserClassesByUserId(user.rows[0].id, res);
        }
    })
}

function courseInfo(req, res) {
    if (!req.parameters.class) {
        res.statusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Class parameter required!` })
        return
    }
    decryptToken(req);
    conn.findCourseInfoById(req.parameters.class, res)
}

function getStudentGrades(req, res) {
    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Class parameter required!` })
        return
    }
    let data = decryptToken(req);
    conn.getStudentGradesById(data.id, req.parameters.class, res)
}

function settingsAccount(req, res) {

    let dataUser = decryptToken(req);
    json.requestJSON(req, res, function(recievedJSON) {
        const { error, account } = schemas.updateAccountModel.validate(recievedJSON)
        if (error) {
            res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            json.responseJSON(res, {
                error: error.message
            })
            return
        } else {
            //update checks
            conn.checkIfUsernameExists(recievedJSON, function(err, data) {
                if (err) {
                    res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
                    json.responseJSON(res, {
                        error: err.message
                    })
                    console.log(err.message)
                    return
                } else {
                    console.log("result from db is : ", data.rowCount);
                    if (data.rowCount == 1) {
                        if (data.rows[0].id != dataUser.id) {
                            res.statusCode = StatusCodes.NOT_ACCEPTABLE;
                            json.responseJSON(res, {
                                update: false,
                                error: "Unavailable username"
                            })
                            return
                        }
                    }
                    conn.checkIfEmailExists(recievedJSON, function(err, data) {
                        if (err) {
                            res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
                            json.responseJSON(res, {
                                error: err.message
                            })
                            console.log(err.message)
                            return
                        } else {
                            console.log("result from db is : ", data.rowCount);
                            if (data.rowCount == 1) {
                                if (data.rows[0].id != dataUser.id) {
                                    res.statusCode = StatusCodes.NOT_ACCEPTABLE;
                                    json.responseJSON(res, {
                                        update: false,
                                        error: "Unavailable mail"
                                    })
                                    return
                                }
                            }
                            conn.updateUserInfo(recievedJSON, dataUser.id, res)
                        }
                    });
                }
            });
        }
    })
}

function logout(req, res) {
    res.statusCode = 200;
    let date = new Date();
    // date.setDate(date.getDate() + 1); //cookie expires in a day
    res.setHeader('Set-cookie', `myCookie=0; HttpOnly; Secure; expires = Mon May 17 2000 19:46:22 GMT; Max-Age=; Domain=localhost; Path=/; overwrite=true`)
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({
        authenticate: false,
        message: `logged out`,
        redirect: '/',
    }))
    res.end()
}

function enterNewClass(req, res) {
    dataUser = decryptToken(req)
    json.requestJSON(req, res, function(recievedJSON) {
        if (isNaN(`${recievedJSON.class}` + 1)) {
            res.statusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, {
                error: 'Invalid class code'
            })
            return
        } else {
            conn.checkIfRequestExists(dataUser.id, recievedJSON.class, res, function(err, data) {
                if (err) {
                    res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
                    json.responseJSON(res, {
                        error: err.message
                    })
                    console.log(err.message)
                    return
                }
                if (data.rowCount == 0) {
                    conn.addRequestForClassSignUp(dataUser.id, recievedJSON.class, res)
                } else {
                    res.StatusCode = StatusCodes.BAD_REQUEST
                    json.responseJSON(res, { error: `Request has already been sent` })
                    return
                }
            })
        }
    })
}

function getClassAssignments(req, res) {
    dataUser = decryptToken(req)
    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: 'Class paramter required!' })
        return
    }
    conn.getClassAssignments(dataUser.id, req.parameters.class, res)
}

function checkCorecnessOfForumla(formula, components) {
    try {
        components = components - 1 + 1
        switch (components) {
            case 1:
                formula = formula.replace('a', '0')
                math.evaluate(formula)
                return true;
            case 2:
                formula = formula.replace('a', '0')
                formula = formula.replace('b', '0')
                math.evaluate(formula)
                return true;
            case 3:
                formula = formula.replace('a', '0')
                formula = formula.replace('b', '0')
                formula = formula.replace('c', '0')
                math.evaluate(formula)
                return true;
            case 4:
                formula = formula.replace('a', '0')
                formula = formula.replace('b', '0')
                formula = formula.replace('d', '0')
                formula = formula.replace('c', '0')
                math.evaluate(formula)
                return true;
            case 5:
                formula = formula.replace('a', '0')
                formula = formula.replace('b', '0')
                formula = formula.replace('c', '0')
                formula = formula.replace('d', '0')
                formula = formula.replace('e', '0')
                math.evaluate(formula)
                return true;
            default:
                return false;
        }
    } catch (error) {
        console.log(error)
        return false;
    }
}

function createNewClass(req, res) {
    let auth = decryptToken(req)
    if (auth.userType === `student`) {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, {
            error: `ACCESS UNAUTHORIZED`
        })
        return
    }
    json.requestJSON(req, res, function(recievedJSON) {
        const { error, newClass } = schemas.classModel.validate(recievedJSON)
        if (error) {
            res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            json.responseJSON(res, {
                error: error.message
            })
            return
        }
        let isCorrect = checkCorecnessOfForumla(recievedJSON.classFormula, recievedJSON.classComponents)
        if (!isCorrect) {
            res.StatusCode = StatusCodes.BAD_REQUEST
            return json.responseJSON(res, {
                error: `invalid formula`
            })
        }
        conn.createNewClass(auth.id, recievedJSON, res)
    })
}

function getAssignment(req, res) {
    if (!req.parameters.id) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter id required!` })
        return
    }
    let data = decryptToken(req)
    conn.getAssignmentInfo(req.parameters.id, res)
}

function getAllStudentAssignment(req, res) {
    let user = decryptToken(req)
    if (user.userType == `profesor`) {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, {
            error: `Students only - acces unauthorized`
        })
        return
    }
    conn.getStudentAssignments(user.id, res)
}

function getClassCatalog(req, res) {

    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter class required!` })
        return
    }
    let user = decryptToken(req)
    conn.getClassCatalog(user.id, req.parameters.class, res)
}

/////////////////////////////////////////

function saveCatalog(req, res) {
    let user = decryptToken(req)
    if (user.userType != 'profesor') {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, { error: 'UNAUTHORIZED - Teachers only' })
        return
    }
    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter class required!` })
        return
    }

    json.requestJSON(req, res, function(recievedJSON) {
        console.log(recievedJSON)
        conn.saveCatalog(recievedJSON, req.parameters.class, res)
    })
}

function calculateFinalGrade(req, res) {
    let user = decryptToken(req)
    if (user.userType != 'profesor') {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, { error: 'UNAUTHORIZED - Teachers only' })
        return
    }
    json.requestJSON(req, res, function(recievedJSON) {
        console.log(recievedJSON)
        conn.calculateFinalGrade(recievedJSON, res)

    })
}

function getRequests(req, res) {
    let user = decryptToken(req)
    if (user.userType != 'profesor') {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, { error: 'UNAUTHORIZED - Teachers only' })
        return
    }
    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter class required!` })
        return
    }
    console.log("requests...")
    conn.getRequests(req.parameters.class, res)
}

function processRequest(req, res) {
    let user = decryptToken(req)
    if (user.userType != 'profesor') {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, { error: 'UNAUTHORIZED - Teachers only' })
        return
    }
    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter class required!` })
        return
    }
    console.log("request processed")
    json.requestJSON(req, res, function(recievedJSON) {
        console.log(recievedJSON)
        conn.processRequest(req.parameters.class, recievedJSON.answer, recievedJSON.idStudent, recievedJSON.idRequest, res)
    })

}

function loadCourseInfo(req, res) {
    let user = decryptToken(req)
    if (user.userType != 'profesor') {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, { error: 'UNAUTHORIZED - Teachers only' })
        return
    }
    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter class required!` })
        return
    }
    console.log("getting course " + req.parameters.class)
    conn.loadCourseInfo(req.parameters.class, res)
}

function updateClass(req, res) {
    let user = decryptToken(req)
    if (user.userType != 'profesor') {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, { error: 'UNAUTHORIZED - Teachers only' })
        return
    }
    console.log("Class is being updated")
    json.requestJSON(req, res, function(recievedJSON) {
        if (checkCorecnessOfForumla(recievedJSON.classFormula, recievedJSON.classComponents)) {
            if (recievedJSON.className.length <= 30)
                if (moment(recievedJSON.classHourStart, 'seconds').isSame(moment(recievedJSON.classHourEnd, 'seconds'))) {
                    console.log(moment.duration(recievedJSON.classHourStart, 'seconds') + " " + moment.duration(recievedJSON.classHourEnd, 'seconds'))
                    res.StatusCode = StatusCodes.BAD_REQUEST
                    return json.responseJSON(res, {
                        error: `Class's start and end hours can't be equal`
                    })
                } else {
                    conn.updateClass(recievedJSON.classId, recievedJSON.className, recievedJSON.classDate, recievedJSON.classHourStart, recievedJSON.classHourEnd, recievedJSON.classLink, recievedJSON.classComponents, recievedJSON.classFormula, recievedJSON.classOtherPlatforms, res)
                }
            else {
                res.StatusCode = StatusCodes.BAD_REQUEST
                return json.responseJSON(res, {
                    error: `Class name should not be longer than 30 characters`
                })
            }
        } else {
            res.StatusCode = StatusCodes.BAD_REQUEST
            return json.responseJSON(res, {
                error: `Invalid formula`
            })
        }

    })
}

function getAssignmentsFromAssignment(req, res) {
    let user = decryptToken(req)
    if (user.userType != 'profesor') {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, { error: 'UNAUTHORIZED - Teachers only' })
        return
    }
    if (!req.parameters.assignment) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter assignment required!` })
        return
    }

    conn.getAssignmentsFromAssignment(req.parameters.assignment, res)
}

function getNews(req, res) {
    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter class required!` })
        return
    }
    let user = decryptToken(req)
    conn.getClassNews(req.parameters.class, res)
}

function validatePresence(req, res) {

    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter class required!` })
        return
    }
    let user = decryptToken(req)
    if (user.userType === `student`) {
        json.requestJSON(req, res, function(recievedJSON) {
            conn.validatePresenceCode(user.id, recievedJSON.code, req.parameters.class, res)
        })
    } else {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, { error: `Student only request` })
        return
    }
}

async function newUpload(req, res) {

    var user = decryptToken(req)
    var fileName = req.parameters.fileName.substr(req.parameters.fileName.lastIndexOf("\\") + 1)
        // fileName = await verifyIfFileExists(fileName)

    console.log(`fileName is ${fileName}`)
    if (user.userType === `student`) { //only assignments
        if (!(req.parameters.assignmentId)) {
            res.StatusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, { error: `Parameter assignmentId required!` })
            return
        }
        if (fileName === '') {
            if (req.parameters.assignmentText == '') {
                res.StatusCode = StatusCodes.BAD_REQUEST
                json.responseJSON(res, {
                    error: `Cannot send empty assignment...`
                })
                return
            }
            conn.turnInAssignment(user.id, req.parameters.assignmentId, req.parameters.assignmentText, fileName, res)
            return
        } else
        if (getUploadFile(req, res, fileName)) {
            console.log(req.parameters.assignmentText)
            conn.turnInAssignment(user.id, req.parameters.assignmentId, req.parameters.assignmentText, fileName, res)
            return
        }
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: 'turning in assignment went wrong...try again' })
        return
    }

    if (user.userType === `profesor`) {
        if (!req.parameters.classId) {
            res.StatusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, { error: `Parameter classId required!` })
            return
        }
        if (!req.parameters.title) {
            res.StatusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, { error: `Parameter title required!` })
            return
        }
        if (!req.parameters.description) {
            res.StatusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, { error: `Parameter description required!` })
            return
        }

        if ((!req.parameters.deadline_date && req.parameters.deadline_hour) || (req.parameters.deadline_date && !req.parameters.deadline_hour)) {
            res.StatusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, { error: `Parameter deadline_date or deadline_hour missing!` })
            return
        }

        if (req.parameters.deadline_date && req.parameters.deadline_hour) {
            //assignment
            var assignment = {
                title: req.parameters.title,
                description: req.parameters.description,
                deadline_date: req.parameters.deadline_date,
                deadline_hour: req.parameters.deadline_hour
            }
            const { error, value } = schemas.assignmentModel.validate(assignment)
            if (error) {
                res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
                json.responseJSON(res, {
                    error: error.message
                })
                return
            }

            var deadline = req.parameters.deadline_date + ' ' + req.parameters.deadline_hour + ':00'
            if (fileName === '') {
                if (req.parameters.description === '') {
                    res.StatusCode = StatusCodes.BAD_REQUEST
                    json.responseJSON(res, {
                        error: `Cannot create empty assignment...`
                    })
                    return
                }
                conn.createAssignment(req.parameters.classId, user.id, req.parameters.title, req.parameters.description, deadline, fileName, res)
                return
            } else
            if (getUploadFile(req, res, fileName)) {
                conn.createAssignment(req.parameters.classId, user.id, req.parameters.title, req.parameters.description, deadline, fileName, res)
                return
            }
            res.StatusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, { error: 'creating assignment went wrong...try again' })
            return
        }

        //news
        if (fileName === '') {
            if (req.parameters.description === '') {
                res.StatusCode = StatusCodes.BAD_REQUEST
                json.responseJSON(res, {
                    error: `Cannot post empty news...`
                })
                return
            }
            conn.postNews(req.parameters.classId, req.parameters.title, req.parameters.description, fileName, res)
            return
        } else
        if (getUploadFile(req, res, fileName)) {
            conn.postNews(req.parameters.classId, req.parameters.title, req.parameters.description, fileName, res)
            return
        }
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: 'Posting news went wrong...try again' })
        return
    }
}

// function verifyIfFileExists(fileName) {
//     try {
//         if (fs.existsSync(`./user_files/${fileName}`)) {
//             fileName = Math.random().toString(36).slice(-5) + "_" + fileName
//         }
//     } catch (err) {
//         console.error(err)
//     }
//     return fileName
// }

function downloadFile(req, res) {
    let user = decryptToken(req)

    if (!req.parameters.assignmentId && !req.parameters.newsId) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Parameter assignmentId or newsId required!` })
        return
    }

    if (req.parameters.assignmentId) {
        if (user.userType === `student`) {
            conn.getFileName(req.parameters.assignmentId, `assignment`, 'teacher', function(err, data) {
                if (err) {
                    console.log(err.message)
                    res.StatusCode = StatusCodes.INTERNAL_SERVER_ERROR
                    json.responseJSON(res, { error: err.message })
                    return
                }
                if (data.rowCount == 0) {
                    res.StatusCode = StatusCodes.NOT_FOUND
                    json.responseJSON(res, { error: `Assignemnt with id ${req.parameters.assignmentId} not found` })
                    return
                }
                if (data.rows[0].files == null || data.rows[0].files === '') {
                    res.StatusCode = StatusCodes.NOT_FOUND
                    json.responseJSON(res, { error: 'No files' })
                    return
                }
                res.setHeader(`Content-Disposition`, `filename=${data.rows[0].files}`)
                sendDownloadFile(req, res, data.rows[0].files)
                return
            })
        }
        conn.getFileName(req.parameters.assignmentId, `assignment`, req.parameters.type, function(err, data) {
            if (err) {
                console.log(err.message)
                res.StatusCode = StatusCodes.INTERNAL_SERVER_ERROR
                json.responseJSON(res, { error: err.message })
                return
            }
            if (data.rowCount == 0) {
                res.StatusCode = StatusCodes.NOT_FOUND
                json.responseJSON(res, { error: `Assignemnt with id ${req.parameters.assignmentId} not found` })
                return
            }
            if (data.rows[0].files == null || data.rows[0].files === '') {
                res.StatusCode = StatusCodes.NOT_FOUND
                json.responseJSON(res, { error: 'No files' })
                return
            }
            res.setHeader(`Content-Disposition`, `filename=${data.rows[0].files}`)
            sendDownloadFile(req, res, data.rows[0].files)
            return
        })
    }
    if (req.parameters.newsId) {
        conn.getFileName(req.parameters.newsId, `news`, '', function(err, data) {
            if (err) {
                console.log(err.message)
                res.StatusCode = StatusCodes.INTERNAL_SERVER_ERROR
                json.responseJSON(res, { error: err.message })
                return
            }
            if (data.rowCount == 0) {
                res.StatusCode = StatusCodes.NOT_FOUND
                json.responseJSON(res, { error: `Assignemnt with id ${req.parameters.assignmentId} not found` })
                return
            }
            if (data.rows[0].files == null || data.rows[0].files === '') {
                res.StatusCode = StatusCodes.NOT_FOUND
                json.responseJSON(res, { error: 'No files' })
                return
            }
            res.setHeader(`Content-Disposition`, `filename=${data.rows[0].files}`)
            sendDownloadFile(req, res, data.rows[0].files)
        })
    }
}

function start(req, res) {
    user = decryptToken(req)
    if (user.userType != 'profesor') {
        res.StatusCode = StatusCodes.FORBIDDEN
        json.responseJSON(res, { error: 'UNAUTHORIZED - Teachers only' })
        return
    }
    if (!req.parameters.class) {
        res.StatusCode = StatusCodes.BAD_REQUEST
        json.responseJSON(res, { error: `Paramter class required!` })
        return
    }
    conn.changeCode(req.parameters.class, Math.random().toString(36).slice(-5), res)
}

module.exports = {
    register,
    authenticate,
    identifyUser,
    homepage,
    courseInfo,
    settingsAccount,
    logout,
    enterNewClass,
    getStudentGrades,
    getClassAssignments,
    createNewClass,
    getAssignment,
    getAllStudentAssignment,
    getClassCatalog,
    getNews,
    validatePresence,
    downloadFile,
    newUpload,
    start,
    saveCatalog,
    calculateFinalGrade,
    getRequests,
    processRequest,
    loadCourseInfo,
    updateClass,
    getAssignmentsFromAssignment
}