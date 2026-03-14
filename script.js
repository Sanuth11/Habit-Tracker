const days = 31;

const headerRow = document.getElementById("headerRow");
const habitBody = document.getElementById("habitBody");

let chart;

/* ---------- HABIT ICONS ---------- */

const habitIconMap = {
coding: "💻",
dsa: "🧠",
gym: "🏋️",
workout: "🏋️",
water: "💧",
sleep: "😴",
diet: "🥗",
eating: "🍽️",
reading: "📚",
meditation: "🧘",
running: "🏃",
walking: "🚶"
};

/* ---------- MONTH RESET ---------- */

const currentMonth = new Date().getMonth();

const storedMonth = localStorage.getItem("habitMonth");

if(storedMonth === null){
localStorage.setItem("habitMonth", currentMonth);
}
else if(parseInt(storedMonth) !== currentMonth){
localStorage.removeItem("habitData");
localStorage.setItem("habitMonth", currentMonth);
}

/* ---------- MONTH TITLE ---------- */

const monthNames = [
"January","February","March","April","May","June",
"July","August","September","October","November","December"
];

document.getElementById("chartTitle").innerText =
"📊 " + monthNames[currentMonth] + " Habit Progress";

/* ---------- LOAD DATA ---------- */

let habits = JSON.parse(localStorage.getItem("habitData")) || [];

/* ---------- CREATE DAY HEADERS ---------- */

for(let i = 1; i <= days; i++){

const th = document.createElement("th");
th.textContent = i;

headerRow.appendChild(th);

}

/* STREAK COLUMN */

const streakHeader = document.createElement("th");
streakHeader.textContent = "Streak";
headerRow.appendChild(streakHeader);

/* REMOVE COLUMN */

const deleteHeader = document.createElement("th");
deleteHeader.textContent = "Remove";
headerRow.appendChild(deleteHeader);

/* ---------- ADD HABIT ---------- */

function addHabit(){

const input = document.getElementById("habitInput");

if(input.value.trim() === "") return;

const habit = {
name: input.value,
days: new Array(days).fill(false)
};

habits.push(habit);

input.value = "";

saveData();

renderHabits();

}

/* ---------- SAVE DATA ---------- */

function saveData(){

localStorage.setItem("habitData", JSON.stringify(habits));

}

/* ---------- STREAK FUNCTION ---------- */

function calculateStreak(daysArray){

let streak = 0;

for(let i = daysArray.length - 1; i >= 0; i--){

if(daysArray[i]){
streak++;
}else{
break;
}

}

return streak;

}

/* ---------- RENDER HABITS ---------- */

function renderHabits(){

habitBody.innerHTML = "";

const today = new Date().getDate() - 1;

habits.forEach((habit,index)=>{

const row = document.createElement("tr");

/* HABIT NAME + ICON */

const nameCell = document.createElement("td");

const icon = habitIconMap[habit.name.toLowerCase()] || "✅";

const formattedName =
habit.name.charAt(0).toUpperCase() + habit.name.slice(1);

nameCell.textContent = icon + " " + formattedName;

row.appendChild(nameCell);

/* DAYS */

for(let d = 0; d < days; d++){

const td = document.createElement("td");

const checkbox = document.createElement("input");

checkbox.type = "checkbox";

checkbox.checked = habit.days[d];

if(checkbox.checked){
td.classList.add("checkedCell");
}

if(d !== today){
checkbox.disabled = true;
}

checkbox.addEventListener("change",()=>{

habit.days[d] = checkbox.checked;

saveData();

renderHabits();

});

td.appendChild(checkbox);

row.appendChild(td);

}

/* STREAK */

const streakCell = document.createElement("td");

const streak = calculateStreak(habit.days);

streakCell.textContent = "🔥 " + streak;

row.appendChild(streakCell);

/* DELETE BUTTON */

const deleteCell = document.createElement("td");

const deleteBtn = document.createElement("button");

deleteBtn.textContent = "🗑";

deleteBtn.style.background = "red";
deleteBtn.style.color = "white";
deleteBtn.style.border = "none";
deleteBtn.style.cursor = "pointer";
deleteBtn.style.padding = "4px 8px";
deleteBtn.style.borderRadius = "4px";

deleteBtn.addEventListener("click",()=>{

const confirmDelete = confirm("Delete '"+habit.name+"' habit?");

if(confirmDelete){

habits.splice(index,1);

saveData();

renderHabits();

}

});

deleteCell.appendChild(deleteBtn);

row.appendChild(deleteCell);

habitBody.appendChild(row);

});

updateProgress();

updateChart();

updateWeeklyStats();

}

/* ---------- DAILY PROGRESS ---------- */

function updateProgress(){

const today = new Date().getDate() - 1;

let total = habits.length;

let completed = 0;

habits.forEach(habit=>{
if(habit.days[today]) completed++;
});

let percent = 0;

if(total > 0){
percent = Math.round((completed/total)*100);
}

document.getElementById("progress").style.width = percent + "%";

document.getElementById("progressText").innerText =
percent + "% habits completed today";

}

/* ---------- MONTHLY CHART ---------- */

function updateChart(){

const dataPoints = [];

for(let d = 0; d < days; d++){

let completed = 0;

habits.forEach(habit=>{
if(habit.days[d]) completed++;
});

let percent = 0;

if(habits.length > 0){
percent = Math.round((completed/habits.length)*100);
}

dataPoints.push({
x: d+1,
y: percent
});

}

if(chart){
chart.destroy();
}

chart = new Chart(document.getElementById("progressChart"),{

type:"scatter",

data:{
datasets:[{
label:"Daily Progress %",
data:dataPoints,
showLine:true,
borderColor:"#4CAF50",
backgroundColor:"#2196F3",
pointRadius:6,
tension:0.3
}]
},

options:{

scales:{

x:{
title:{
display:true,
text:"Days of Month"
},
min:1,
max:31
},

y:{
title:{
display:true,
text:"Progress %"
},
min:0,
max:100,
ticks:{
stepSize:10
}
}

}

}

});

}

/* ---------- WEEKLY ANALYTICS ---------- */

function updateWeeklyStats(){

const statsDiv = document.getElementById("weeklyStats");

if(!statsDiv) return;

let weeks = [
[0,6],
[7,13],
[14,20],
[21,27],
[28,30]
];

let html = "";

weeks.forEach((range,index)=>{

let completed = 0;
let total = 0;

for(let d = range[0]; d <= range[1]; d++){

habits.forEach(habit=>{

if(habit.days[d]) completed++;

total++;

});

}

let percent = total ? Math.round((completed/total)*100) : 0;

html += `
<div class="week-card">
<div class="week-label">Week ${index+1}</div>

<div class="week-bar">
<div class="week-fill" style="width:${percent}%"></div>
</div>

<div class="week-percent">${percent}%</div>
</div>
`;

});

statsDiv.innerHTML = html;

/* ---------- STREAK ANALYTICS ---------- */

}
function calculateStreak(daysArray){

const today = new Date().getDate() - 1;

let streak = 0;

for(let i = today; i >= 0; i--){

if(daysArray[i]){
streak++;
}else{
break;
}

}

return streak;

}
/* ---------- INITIAL LOAD ---------- */

renderHabits();