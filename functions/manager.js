const Request = require('request')

const Constants = require('./constants')
const Shared = require('./shared')
const Errors = require('./error.js')

let showManagerHome = (req, res) => {
    if (Shared.notLoggedIn()) {
        res.render("error", Errors.notLoggedIn)
    } else if (Shared.wrongUserType("manager")) {
        res.render("error", Errors.incorrectUserType)
    } else {
        let completion = (summarylist) => {
            res.render("manager/home", {
                summary: summarylist
            })
        }
        getMainSummaryList(res, completion)    
    }
}

function getMainSummaryList(response, completion) {
    Request(Constants.serverURL + 'manager/stats', (error, res, body) => {
        if (error) {
            console.log(error)
            response.render("error", Errors.backendRequestError)
            return
        }
        var summarylist = JSON.parse(body);
        completion(summarylist)
    })
}

let showAreaStats = (req, res) => {
    if (Shared.notLoggedIn()) {
        res.render("error", Errors.notLoggedIn)
    } else if (Shared.wrongUserType("manager")) {
        res.render("error", Errors.incorrectUserType)
    } else {
        let completion = (arealist) => {
            res.render("manager/areaSummary", {
                summary: arealist
            })
        }
        getAreaSummaryList(res, completion)    
    }
}

function getAreaSummaryList(response, completion) {
    Request(Constants.serverURL + 'manager/areastats', (error, res, body) => {
        if (error) {
            console.log(error)
            response.render("error", Errors.backendRequestError)
            return
        }
        var arealist = JSON.parse(body);
        completion(arealist)
    })
}

let showRiderStats = (request, response) => {
    if (Shared.notLoggedIn()) {
        response.render("error", Errors.notLoggedIn)
    } else if (Shared.wrongUserType("manager")) {
        response.render("error", Errors.incorrectUserType)
    } else {
        let completion = (riderlist) => {
            response.render("manager/riderSummary", {
                summary: riderlist
            })
        }
        getRiderStatsList(response, completion)    
    }
}

function getRiderStatsList(response, completion) {
    Request(Constants.serverURL + 'manager/riderstats', (error, res, body) => {
        if (error) {
            console.log(error)
            response.render("error", Errors.backendRequestError)
            return
        }
        var riderlist = JSON.parse(body);

        for (item in riderlist) {
            let currentItem = riderlist[item]

            if (currentItem.time != null) {
                let currentTime = currentItem.time
                let string = ""
                if (currentTime.hours != null) {
                    string = string + currentTime.hours + ' hours '
                }
                if (currentTime.minutes != null) {
                    string = string + currentTime.minutes + ' minutes '
                }
                riderlist[item].time = string
            }
        }

        completion(riderlist)
    })
}

const createCustPromo = (request, response) => {
    let code = request.body.code
    let discount = request.body.discount
    let minSpend = request.body.minSpend
    let startDate = request.body.startDate
    let endDate = request.body.endDate
    let cid = request.body.cid

    let options = {
        url: Constants.serverURL + 'custPromo', 
        form: {
            code: code, 
            amount: discount, 
            minSpend: minSpend,
            startDate: startDate,
            endDate: endDate,
            cid: cid
        }
    }

    Request.post(options, (error, res, body) => {

        if (error) {
            response.render("error", Errors.backendRequestError)
        }
        if(res.statusCode == 500) {
            response.render("error",  {errorMessage: "promo code already exists! Try again?" })
        } else if (res.statusCode == 200) {
            response.redirect(302, "/manager/home")
        } else {
            response.render("error")
        }
    })
}

module.exports = {
    showManagerHome,
    showAreaStats,
    showRiderStats,
    createCustPromo
}