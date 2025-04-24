"use strict"

window.onload = function() {
    main();
}

var datToday = new Date() ;

function main() {
    let strDebug = " ";
    strDebug += "Heute: " + datToday.toDateString() +"<br/>";
    let datTodayGerman = getDateGerman(datToday);
    strDebug += "Komplettes Datum: " + datTodayGerman + "<br/>";
    let dayArr = ["So","mo","di","mi", "do", "fr", "Sa"];
    console.log( document.getElementsByClassName(dayArr[datToday.getDay()]));
    let weekDays =  document.getElementsByClassName(dayArr[datToday.getDay()]);
    for(let i = 0;i < weekDays.length;i++){
        console.log(weekDays[i].innerHTML);
        console.log(datToday.getDate());
        if(weekDays[i].innerHTML==datToday.getDate()){
            weekDays[i].classList.add("heute");
        }
    }
   
    let weekday = datToday.getDay();

    strDebug += "Wochentag im Zahlformat: " + weekday + "<br/>";
    let weekdayGerman = getWeekdayGerman(weekday);
    strDebug += "Wochentag ausgeschrieben: " + weekdayGerman + "<br/>";

    document.getElementById("field1").innerHTML = datTodayGerman;
    document.getElementById("field2").innerHTML = datTodayGerman;
    document.getElementById("field3").innerHTML = datTodayGerman;
    document.getElementById("field4").innerHTML = weekdayGerman;
    document.getElementById("header").innerText = getMonthGerman(datToday.getMonth() + 1) + " " + datToday.getFullYear();

    let elDebug = document.getElementById("debug");
    if (elDebug != null) {
        elDebug.innerHTML = strDebug;
    } else {
        console.log("Debug-Element nicht gefunden.");
    }

    createCalendar();
}

function getDateGerman(date) {
    let day = date.getDate();
    let month = date.getMonth();
    month = month + 1;
    let year = date.getFullYear();
    if (String(day).length == 1) day = "0" + day;
    if (month < 10) {
        month = "0" + month;
    }
    let dateGerman = day + "." + month + "." + year;
    return dateGerman;
}

function getWeekdayGerman(weekdayIndex) {
    const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    return weekdays[weekdayIndex];
}

function getWeekdayClass(weekdayIndex) {
    const weekdayClasses = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];
    return weekdayClasses[weekdayIndex];
}

function calendarHTML(date) {
    let firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    let firstOfMonthWeekday = firstOfMonth.getDay();
    let offsetStart;
    if (firstOfMonthWeekday == 0) {
        offsetStart = 6;
    } else {
        offsetStart = firstOfMonthWeekday - 1;
    }
    let firstOfCalendar = new Date(firstOfMonth);
    firstOfMonth.setDate(firstOfCalendar.getDate() - offsetStart);
}

function getMonthGerman(monthIndex) {
        const arr = ["Fehler", "Januar","Februar","März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        return arr[monthIndex]; 
}

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
  }

function changeDate(newDate) {
    datToday = newDate;
    main();
}

function createCalendar() {
    let parent = document.getElementsByTagName("tbody")[0];
    parent.innerHTML = "";
    const daysInMonth = new Date(datToday.getFullYear(), datToday.getMonth() + 1, 0).getDate();
    console.log('daysInMonth: ' +  daysInMonth);
    let firstDayOfMonth = new Date(year, month, 1).getDate();
    if (firstDayOfMonth == 0) {
        firstDayOfMonth = 7;
    }

    let currentDay = 1;
    let tablerow;
    for (let i = 0; i < 6; i++) {
        tablerow = document.createElement("tr");
        for (let j = 0; j < 8; j++) {
            let currentDate = new Date(datToday.getFullYear(), datToday.getMonth(), currentDay);
            let tabledata = document.createElement("td");
            if (j == 0) {
                let week = currentDate.getWeek();
                tabledata.innerText = week;
                tabledata.classList = ['kw'];
            } else if (i == 0 && j <= firstDayOfMonth) {
                tabledata.innerText = "";
            } else if (currentDay > daysInMonth) {
                tabledata.innerText = "";
            } else {
                tabledata.innerText = currentDay;
                tabledata.classList = [getWeekdayClass(currentDate.getDay())];
                tabledata.onclick = () => {
                    changeDate(currentDate);
                };
                currentDay++;
            }
            tablerow.appendChild(tabledata);
        }
        parent.appendChild(tablerow);
        if (currentDay > daysInMonth) break;
    }
}

function previousMonth() {
    let newMonth = datToday.getMonth() -1;
    let newYear = datToday.getFullYear();

    if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    }

    datToday = new Date(newYear, newMonth, 1);
    main();
}

function nextMonth() {
    let newMonth = datToday.getMonth() + 1;
    let newYear = datToday.getFullYear();

    if(newMonth > 11) {
        newMonth = 0;
        newYear++;
    }
    datToday = new Date(newYear, newMonth, 1);
    main();
}