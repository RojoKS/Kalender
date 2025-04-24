// ======================================================
// Initialisierung
// ======================================================

window.onload = function () {
  main();
};

function main() {
  changeTime(new Date().getTime());
}

// ======================================================
// Hauptfunktion zur Anzeige und Änderung des Datums
// ======================================================

function changeTime(timeToday) {
  let strDebug = "";
  let datToday = new Date(timeToday);
  let day = datToday.getDate();
  let month = datToday.getMonth() + 1;
  let sternzeichen = getSternzeichen(day, month);
  let datTodayGerman = getDateGerman(datToday);
  
  let weekday = datToday.getDay();
  let weekdayGerman = getWeekdayGerman(weekday);
  
  let wievielte = Math.floor((datToday.getDate() - 1) / 7) + 1;
  let wievielteGerman = getWievielteGerman(wievielte);
  
  let monthGerman = getMonthGerman(datToday.getMonth() + 1);
  
  let lastOfMonth = new Date(datToday.getFullYear(), datToday.getMonth() + 1, 0);
  let days = lastOfMonth.getDate();
  
  let holidayHTML = "";
  let holidayArray = getHolidayArrayHessen(datToday);
  if (holidayArray.includes(datToday.getTime())) {
    holidayHTML = "Der " + datTodayGerman + " ist ein gesetzlicher Feiertag.";
  } else {
    holidayHTML = "Der " + datTodayGerman + " ist kein gesetzlicher Feiertag. ";
  }
  
  document.title = "Kalenderblatt: " + datTodayGerman;
  document.getElementById("field_datum_d_1").innerHTML = datTodayGerman;
  document.getElementById("field_datum_d_2").innerHTML = datTodayGerman;
  document.getElementById("field_weekday_1").innerHTML = weekdayGerman;
  document.getElementById("field_weekday_2").innerHTML = weekdayGerman;
  document.getElementById("field_howmany_1").innerHTML = wievielteGerman;
  document.getElementById("field_month_1").innerHTML = monthGerman;
  document.getElementById("field_year_1").innerHTML = datToday.getFullYear();
  document.getElementById("field_days_1").innerHTML = days;
  document.getElementById("field_feiertag_1").innerHTML = holidayHTML;
  document.getElementById("geschichte").innerHTML = datTodayGerman;
  document.getElementById("sternzeichen").innerHTML = "Sternzeichen: " + sternzeichen;
  
  let htmlTabelle = getCalendarHTML(datToday, holidayArray);
  document.getElementById("kalenderblatt").innerHTML = htmlTabelle;
  
  let elDebug = document.getElementById("debug");
  if (elDebug != null) {
    elDebug.innerHTML = strDebug;
  } else {
    console.log("Debug-Element nicht gefunden.");
  }
  
  fetchGermanWikipediaEvents(datToday.getDate(), datToday.getMonth() + 1);
  showEventDetails(datToday);

}

function openPopup() {
  document.getElementById("popup").style.display = "flex";
}

function saveEvent() {
  const dateStr = document.getElementById("event-date").value;
  const title = document.getElementById("event-title").value;
  const description = document.getElementById("event-description").value;
  const date = new Date(dateStr).toLocaleDateString('de-DE');
  if (date && title) {
    
    localStorage.setItem(date, JSON.stringify({ title, description}));
    
    console.log("Neuer Termin:", {date, title, description});
    alert("Ereignis gespeichert fuer " + date + ": " + title);
    
   
    document.getElementById("event-date").value = "";
    document.getElementById("event-title").value = "";
    document.getElementById("event-description").value = "";
    
  } else {
    
    changeTime(new Date(date).getTime()); 
    
    alert("Neuer Termin wurde eingetragen");
    alert("Bitte Datum und Titel eingeben");
  } 
}

// ======================================================
// Kalender-Funktionen und Erstellung des Kalenders
// ======================================================

function getCalendarHTML(date, holidayArray) {
  let firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  let firstOfMonthWeekday = firstOfMonth.getDay();
  let howManyDaysBeforeFirst = firstOfMonthWeekday === 0 ? 6 : firstOfMonthWeekday - 1;
  let firstOfCalendar = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1 - howManyDaysBeforeFirst);
  
  let lastOfMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0);
  let howManyDaysAfterLast = lastOfMonth.getDay() === 0 ? 0 : 7 - lastOfMonth.getDay();
  let lastOfCalendar = new Date(lastOfMonth.getFullYear(), lastOfMonth.getMonth(), lastOfMonth.getDate() + howManyDaysAfterLast);
  
  let html = calendarHTML_head(firstOfMonth);
  
  for (let x = firstOfCalendar; x <= lastOfCalendar; x = new Date(x.getFullYear(), x.getMonth(), x.getDate() + 1)) {
    html += getDayHTML(x, date, holidayArray);
  }
  
  html += calendarHTML_footer();
  return html;
}

function calendarHTML_head(date) {
  let nameOfMonth = getMonthGerman(date.getMonth() + 1);
  let lastOfMonthBefore = new Date(date.getFullYear(), date.getMonth(), 0).getTime();
  let firstOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
  
  return `
    <table>
      <thead>
        <tr>
          <th class="selectable" onClick="changeTime(${lastOfMonthBefore})"><</th>
          <th colspan="6">${nameOfMonth}</th>
          <th class="selectable" onClick="changeTime(${firstOfNextMonth})">></th>
        </tr>
        <tr>
          <th class="kw">Kw</th>
          <th class="mo">Mo</th>
          <th class="di">Di</th>
          <th class="mi">Mi</th>
          <th class="do">Do</th>
          <th class="fr">Fr</th>
          <th class="sa">Sa</th>
          <th class="so">So</th>
        </tr>
      </thead>
      <tbody>`;
}

function calendarHTML_footer() {
  return "</tbody></table>";
}

function getDayHTML(date, today, holidayArray) {
  let html = "";
  let cssClass = "";
  let weekday = date.getDay(); // 0 = Sonntag, 1 = Montag, ...
  let event = localStorage.getItem(date.getTime());
  
  // Wenn ein Event vorhanden ist → Klasse hinzufügen
  if (event) {
    cssClass += "mitTermin ";
  }
  
  // Wenn Montag → neue Tabellenzeile starten und Kalenderwoche anzeigen
  if (weekday === 1) {
    html += "<tr>";
    html += '<td class="kw">' + getCalendarWeek(date) + "</td>";
  }
  
  // Wochentag-Klasse (z. B. mo, di, mi...)
  cssClass += getWeekdayShortGerman(weekday) + " ";

  // Feiertagsklasse hinzufügen, wenn Datum im Feiertags-Array enthalten ist
  if (holidayArray.includes(date.getTime())) cssClass += "feiertag ";

  // Heute-Klasse hinzufügen, wenn Datum heute ist
  if (date.getMonth() === today.getMonth() && date.getDate() === today.getDate()) {
    cssClass += "heute ";
  }

  // Wenn Tag **nicht** im aktuellen Monat → leere Zelle
  if (date.getMonth() !== today.getMonth()) {
    html += '<td class="leer">&nbsp;</td>';
  } else {
    // Korrekt eingebetteter HTML-String mit Datum und Klick-Events
    html += `<td class="${cssClass.trim()}" onClick="changeTime(${date.getTime()}); showEventDetails(${date.getTime()})">${date.getDate()}</td>`;
  }

  // Sonntag → Tabellenzeile beenden
  if (weekday === 0) html += "</tr>";

  return html;
}
// ======================================================
// Datum / Zeit Hilfsfunktionen
// ======================================================

function getDateGerman(date) {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  
  if (String(day).length === 1) day = "0" + day;
  if (String(month).length === 1) month = "0" + month;
  
  return day + "." + month + "." + year;
}

function getCalendarWeek(date) {
  let thursday = getThursday(date);
  let cwYear = thursday.getFullYear();
  let thursdayCw1 = getThursday(new Date(cwYear, 0, 4));
  
  let cw = Math.floor(1.5 + (thursday.getTime() - thursdayCw1.getTime()) / 86400000 / 7);
  return cw;
}

function getThursday(date) {
  return new Date(date.getTime() + (3 - ((date.getDay() + 6) % 7)) * 86400000);
}

function getSternzeichen (day, month) {
  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Wassermann ♒";
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Fische ♓";
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Widder ♈";
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Stier ♉";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Zwillinge ♊";
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Krebs ♋";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Löwe ♌";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Jungfrau ♍";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Waage ♎";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Skorpion ♏";
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Schütze ♐";
  return "Steinbock ♑";
}

// ======================================================
// Übersetzungen: Wochentage / Monate
// ======================================================

function getWeekdayGerman(weekdayIndex) {
  let arr = ["Sontag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  return arr[weekdayIndex];
}

function getWeekdayShortGerman(weekdayIndex) {
  let arr = ["so", "mo", "di", "mi", "do", "fr", "sa", "so"];
  return arr[weekdayIndex];
}

function getMonthGerman(monthIndex) {
  let arr = ["Fehler", "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return arr[monthIndex];
}

function getWievielteGerman(number) {
  let arr = ["erste", "zweite", "dritte", "vierte", "fünfte"];
  return arr[number - 1];
}

// ======================================================
// Feiertage für Hessen
// ======================================================

function getHolidayArrayHessen(date) {
  let year = date.getFullYear();
  let array = [];
  
  array.push(new Date(year - 1, 11, 25).getTime());
  array.push(new Date(year - 1, 11, 26).getTime());
  array.push(new Date(year, 0, 1).getTime());
  array.push(new Date(year, 4, 1).getTime());
  array.push(new Date(year, 9, 3).getTime());
  array.push(new Date(year, 11, 25).getTime());
  array.push(new Date(year, 11, 26).getTime());
  array.push(new Date(year + 1, 0, 1).getTime());
  
  let osterSonntag = getEasterSunday(year);
  array.push(osterSonntag.getTime());
  
  array.push(new Date(year, osterSonntag.getMonth(), osterSonntag.getDate() + 1).getTime());
  array.push(new Date(year, osterSonntag.getMonth(), osterSonntag.getDate() + 39).getTime());
  array.push(new Date(year, osterSonntag.getMonth(), osterSonntag.getDate() + 50).getTime());
  array.push(new Date(year, osterSonntag.getMonth(), osterSonntag.getDate() + 60).getTime());
  
  return array;
}

function getEasterSunday(Jahr) {
  if (Jahr < 1970 || Jahr > 2099) return null;
  
  let a = Jahr % 19;
  let d = (19 * a + 24) % 30;
  let Tag = d + ((2 * (Jahr % 4) + 4 * (Jahr % 7) + 6 * d + 5) % 7);
  
  if (Tag == 35 || (Tag == 34 && d == 28 && a > 10)) {
    Tag -= 7;
  }
  
  let OsterDatum = new Date(Jahr, 2, 22);
  OsterDatum.setTime(OsterDatum.getTime() + 86400000 * Tag);
  return OsterDatum;
}

function fetchGermanWikipediaEvents(day, month) {
  const url = `https://de.wikipedia.org/api/rest_v1/feed/onthisday/events/${pad(month)}/${pad(day)}`;
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 35;
  
  fetch(url)
  .then(response => response.json())
  .then(data => {
    const events = data.events.filter(event => event.year >= minYear);
    const container = document.getElementById("historik");
    
    if (container) {
      if (events.length === 0) {
        container.innerHTML = "<p>Keine historischen Ereignisse gefunden.</p>";
      } else {
        container.innerHTML = "<ul>" + events.slice(0, 5).map(event => `<li><strong>${event.year}:</strong> ${event.text}</li>`).join("") + "</ul>";
      }
    } else {
      console.warn("Element mit ID 'Historik' wurde nicht gefunden")
    }
  })
  .catch(err => {
    console.error("Fehler beim Abrufen der Wikipedia-Daten:", err);
  });
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function showEventDetails(date) {
  let event = localStorage.getItem(date.toLocaleDateString('de-DE'));
  console.log(event);
  if (event) {
    let eventData = JSON.parse(event);
    alert(`Termin: ${eventData.title}\nBeschreibung: ${eventData.description}`);
  } else {
    alert("Kein Termin an diesem Tag.");
  }
}

