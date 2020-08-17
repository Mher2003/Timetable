const express = require('express')
const cors = require('cors')
const fs = require('fs')
const sha256 = require('sha256')
const bodyParser = require('body-parser')
const app = express()

const password =  'b9c950640e1b3740e98acb93e669c65766f6670dd1609ba91ff41052ba48c6f3'

let data = {}

const MIN_GRADE = 10
const MAX_GRADE = 12
const MAX_CLASS = 4
const WEEKDAYS = 6

async function loadData(){
    for(let i = MIN_GRADE;i <= MAX_GRADE;i++){
        try{
            data[i] = await JSON.parse(fs.readFileSync(`timetables/${i}.json`))
        }
        catch{
            console.log(`Grade ${i} not found`)
        }
    }
}

loadData()

app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.send('Backend working correctly')
})

app.get('/timetable', (req, res) => {
    let grade = Number(req.query.grade)
    let Class = Number(req.query.class)
    let day = Number(req.query.day)

    if (!Number.isInteger(grade) || !Number.isInteger(Class) || !Number.isInteger(day) || 
    grade < MIN_GRADE || grade > MAX_GRADE || Class <= 0 || Class > MAX_CLASS || day <= 0 || day > WEEKDAYS || 
    isNaN(grade) || isNaN(Class) || isNaN(day)) {
        res.send('Invalid grade, class or weekday')
        return
    }
    res.send(data[grade][Class-1][day-1])
})


app.post('/updateTimetable', (req, res) => {
    let grade = Number(req.body.grade)
    let Class = Number(req.body.class)
    let day = Number(req.body.day)

    let pass = req.body.password

    if(sha256(pass) != password){
        res.send('Wrong password, try again')
        return
    }

    if (!Number.isInteger(grade) || !Number.isInteger(Class) || !Number.isInteger(day) ||
    grade < MIN_GRADE || grade > MAX_GRADE || Class <= 0 || Class > MAX_CLASS || day <= 0 || day > WEEKDAYS ||
    isNaN(grade) || isNaN(Class) || isNaN(day)) {
        res.send('Invalid grade, class or weekday')
        return
    }

    req.body.data.forEach(u => u.forEach(v => v.replace(/>/gi, '&gt').replace(/</gi, '&lt')))

    newData = req.body.data

    for(let i = 0;i < newData.length;i++){
        for (let k = 0; k < newData[i].length; k++) {
            newData[i][k] = newData[i][k].replace(/>/gi, '&gt').replace(/</gi, '&lt')
        }
    }

    data[grade][Class-1][day-1] = newData
    fs.writeFileSync(`timetables/${grade}.json`, JSON.stringify(data[grade], null, 4))
    res.send('Good')
})


const port = process.env.PORT || 80
app.listen(port, console.log(`Server started on port ${port}`))