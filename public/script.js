let gradeSelector = document.getElementById('grade')
let classSelector = document.getElementById('class')
let daySelector = document.getElementById('day')

let timeDiv = document.getElementById('timeDiv')

let url = window.location.href.replace(/[^/]*$/, '')

let len = 0
let wid = 0

const gradeValue = () => gradeSelector.options[gradeSelector.selectedIndex].value
const classValue = () => classSelector.options[classSelector.selectedIndex].value
const dayValue = () => daySelector.options[daySelector.selectedIndex].value

const weekdays = [
    "Երկուշաբթի",
    "Երեքշաբթի",
    "Չորեքշաբթի",
    "Հինգշաբթի",
    "Ուրբաթ",
    "Շաբաթ"
]

const selectChange = (editMode) => {
    if(gradeValue() != 0 && classValue() != 0 && dayValue() != 0){
        getTimetable(gradeValue(), classValue(), dayValue(), editMode)
    }
}

async function getTimetable(Grade, Class, Day, EditMode){
    await fetch(`${url}timetable?grade=${Grade}&class=${Class}&day=${Day}`).then(res => res.json()).then(res => data = res)
    let timetable = `<h2 id="weekday">${weekdays[Day-1]}</h2>`
    timetable += "<table id='time'>"
    
    if(!EditMode){
        let skip = 0;
        for (let i = 0; i < data.length; i++) {
            let f = i
            timetable += "<tr>"
            timetable += `<td>${data[i][0]}</td>`
            if (skip) {
                skip--
            } else {
                while (f < data.length - 1 && data[f][1] == data[f + 1][1]) {
                    skip++
                    f++
                }

                if (skip) {
                    timetable += `<td rowspan="${skip + 1}">${data[i][1]}</td>`
                } else {
                    timetable += `<td>${data[i][1]}</td>`
                }
            }
            timetable += "</tr>"
        }
    } else {
        data.forEach((v, i) => {
            timetable += "</tr>"
            v.forEach((u, k) => {
                // timetable += `<td><input class="item" type="text" id="${i}${k}" value="${u}"></td>`
                timetable += `<td><textarea class="item" id="${i}${k}">${u}</textarea></td>`
            });
            timetable += "</tr>"
        });

        timetable += "</table>"
        let submit = "<div id='iden'>"
        submit += "<label id='response'></label>"
        submit += `Password:<input type='password' id='pass' placeholder='Enter password' autocomplete='off' readonly onfocus ="this.removeAttribute('readonly');" ><br>`
        submit += "<button id='submit' onClick='updateTimetable()'>Update Timetable</button>"
        submit += "</div>"

        timetable += submit
    }

    len = data.length
    wid = data[0].length

    document.getElementById('timeDiv').innerHTML = timetable
}

async function updateTimetable() {
    let newData = []
    for(let i = 0;i < len;i++){
        let row = []
        for(let k = 0;k < wid;k++){
            row.push(document.getElementById(`${i}${k}`).value)
        }
        newData.push(row)
    }


    let fetchResponse = ''
    await fetch(`${url}updateTimetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "grade": gradeValue(),
            "class": classValue(),
            "day": dayValue(),
            "password": document.getElementById('pass').value,
            "data": newData
        }),
    }).then(res => res.text()).then(res => fetchResponse = res)
    
    if(fetchResponse == 'Good'){
        alert('Timetable updated')
        location.reload()
    }else if(fetchResponse){
        document.getElementById('pass').value = ''
        document.getElementById('response').innerHTML = "<p>Wrong password</p>"
    }
}