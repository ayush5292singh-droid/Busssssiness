let game={
started:false,

player:"",
company:"",
industry:"",

cash:10000,
companyValue:10000,

day:1,
minutes:0,

revenue:0,
expenses:0,

inventory:100,
inventoryCapacity:100,

productionLevel:1,
marketingLevel:1,
researchLevel:1,

reputation:50,
demand:100,

level:1,
xp:0,

debt:0,
loanAge:0,
loanOverdue:false,

employees:[],

market:100,
economy:100,

risk:0,

sound:true,

stocks:{
NOVA:{price:120,shares:0},
APEX:{price:85,shares:0},
VOLT:{price:155,shares:0},
ORBT:{price:65,shares:0},
CYBR:{price:210,shares:0}
},

news:[],

competitors:[
{
name:"NOVA INDUSTRIES",
ticker:"NOVA",
value:850000,
power:72
},
{
name:"APEX CORPORATION",
ticker:"APEX",
value:620000,
power:64
},
{
name:"VOLT ENERGY",
ticker:"VOLT",
value:1100000,
power:82
},
{
name:"ORBIT GROUP",
ticker:"ORBT",
value:480000,
power:58
},
{
name:"CYBERCORE",
ticker:"CYBR",
value:930000,
power:77
}
]
};


/* =========================
   SAVE / LOAD
========================= */

function saveGame(){

localStorage.setItem(
"tycoonXSave",
JSON.stringify(game)
);

}


function loadGame(){

const saved=
localStorage.getItem("tycoonXSave");

if(!saved)return;

try{

game=JSON.parse(saved);

document
.getElementById("startScreen")
.classList.add("hidden");

document
.getElementById("game")
.classList.remove("hidden");

updateUI();

}catch(e){

localStorage.removeItem("tycoonXSave");

}

}


/* =========================
   START
========================= */

function createCompany(){

const player=
document
.getElementById("playerName")
.value.trim();

const company=
document
.getElementById("companyName")
.value.trim();

if(!player||!company){

toast("ENTER CEO AND COMPANY NAME");

return;

}

game.player=player;
game.company=company;

game.industry=
document.getElementById("industry").value;

game.started=true;

game.news=[
"Company successfully initialized.",
"Market systems online.",
"Competitors detected.",
"Automatic production started."
];

document
.getElementById("startScreen")
.classList.add("hidden");

document
.getElementById("game")
.classList.remove("hidden");

toast(
company+
" IS NOW OPERATIONAL"
);

saveGame();

updateUI();

}


/* =========================
   MONEY
========================= */

function money(number){

return "$"+
Math.round(number)
.toLocaleString();

}


/* =========================
   UI
========================= */

function updateUI(){

document
.getElementById("companyNameUI")
.textContent=game.company;

document
.getElementById("welcome")
.textContent=
"Welcome, "+
game.player;

document
.getElementById("industryText")
.textContent=
game.industry+
" corporation • AUTOMATIC OPERATIONS ACTIVE";

document
.getElementById("cash")
.textContent=
money(game.cash);

document
.getElementById("day")
.textContent=
game.day;

document
.getElementById("level")
.textContent=
game.level;

document
.getElementById("companyValue")
.textContent=
money(game.companyValue);

document
.getElementById("reputation")
.textContent=
Math.round(game.reputation);

updateBusiness();

updateLevel();

updateMarket();

updateStocks();

updateBank();

updateEmployees();

updateRivals();

updateRisk();

updateObjective();

}


/* =========================
   AUTOMATIC BUSINESS
========================= */

function automaticBusiness(){

if(!game.started)return;


/*
Production depends on:
production upgrade
research
employees
*/

let production=
100+
(game.productionLevel-1)*35;

production+=
game.researchLevel*15;

production+=
game.employees.length*10;


/*
If inventory is too low,
company cannot operate normally.
*/

if(game.inventory<=0){

addNews(
"🚨 PRODUCTION STOPPED — INVENTORY EMPTY"
);

return;

}


/*
Actual production
*/

let units=
Math.min(
production,
game.inventory
);

game.inventory-=
units;


/*
Market determines sales.
*/

let demandMultiplier=
game.demand/100;

let marketMultiplier=
game.market/100;

let sales=
Math.round(
units*
demandMultiplier*
marketMultiplier
);


/*
Revenue
*/

let revenuePerUnit=
8+
game.marketingLevel*1.5+
game.researchLevel*.8;

let revenue=
Math.round(
sales*revenuePerUnit
);


/*
Operating costs
*/

let salaries=
game.employees.reduce(
(total,e)=>total+e.salary,
0
);

let productionCost=
Math.round(
units*
(2.5-
Math.min(
1.2,
game.researchLevel*.1
))
);

let expenses=
productionCost+
salaries;


/*
Money changes automatically.
*/

game.revenue+=revenue;
game.expenses+=expenses;

game.cash+=
revenue-expenses;

game.companyValue+=
Math.round(
(revenue-expenses)*.35
);


/*
Experience
*/

game.xp+=
Math.max(
1,
Math.round(
(revenue-expenses)/100
)
);


/*
Reputation
*/

if(revenue>expenses){

game.reputation+=.15;

}else{

game.reputation-=.25;

}


/*
Inventory warning
*/

if(
game.inventory<
game.inventoryCapacity*.2
){

addNews(
"⚠ INVENTORY CRITICAL — RESTOCK REQUIRED"
);

}


/*
If company has no cash and inventory
cannot be purchased, business suffers.
*/

if(
game.cash<500 &&
game.inventory<
game.inventoryCapacity*.2
){

addNews(
"🚨 CASH CRISIS — COMPANY CANNOT RESTOCK"
);

}


/*
Low cash creates risk.
*/

if(game.cash<2000){

game.risk+=.5;

}


/*
Loan pressure.
*/

if(game.debt>0){

game.risk+=.1;

}


/*
Random business events.
*/

if(Math.random()<.025){

randomBusinessEvent();

}

}


/* =========================
   INVENTORY
========================= */

function buyInventory(){

let amount=
game.inventoryCapacity-
game.inventory;

if(amount<=0){

toast("INVENTORY ALREADY FULL");

return;

}

let price=
Math.round(
amount*
(2+
Math.random()*2)
);

if(game.cash<price){

toast(
"NOT ENOUGH CASH TO RESTOCK"
);

addNews(
"🚨 RESTOCK FAILED — CASH SHORTAGE"
);

return;

}

game.cash-=price;

game.inventory=
game.inventoryCapacity;

game.expenses+=price;

game.xp+=5;

toast(
"INVENTORY RESTOCKED — "+
money(price)
);

addNews(
"Inventory shipment received."
);

updateUI();

}


/* =========================
   UPGRADES
========================= */

function upgradeProduction(){

let cost=
Math.round(
2500*
Math.pow(
1.55,
game.productionLevel-1
)
);

if(game.cash<cost){

toast("NOT ENOUGH CASH");

return;

}

game.cash-=cost;

game.expenses+=cost;

game.productionLevel++;

game.inventoryCapacity+=25;

game.companyValue+=
Math.round(cost*.8);

game.xp+=20;

addNews(
"🏭 Production facility expanded."
);

toast("PRODUCTION UPGRADED");

updateUI();

}


function marketingCampaign(){

let cost=
Math.round(
1800*
Math.pow(
1.45,
game.marketingLevel-1
)
);

if(game.cash<cost){

toast("NOT ENOUGH CASH");

return;

}

game.cash-=cost;

game.expenses+=cost;

game.marketingLevel++;

game.demand+=8;

game.reputation+=5;

game.xp+=15;

addNews(
"📢 Marketing campaign launched."
);

toast("MARKETING SUCCESSFUL");

updateUI();

}


function research(){

let cost=
Math.round(
2500*
Math.pow(
1.5,
game.researchLevel-1
)
);

if(game.cash<cost){

toast("NOT ENOUGH CASH");

return;

}

game.cash-=cost;

game.expenses+=cost;

game.researchLevel++;

game.companyValue+=
Math.round(cost*.9);

game.xp+=25;

game.demand+=3;

addNews(
"🧠 New technology discovered."
);

toast("RESEARCH BREAKTHROUGH");

updateUI();

}


/* =========================
   EMPLOYEES
========================= */

function hireEmployee(){

let price=
1000+
game.employees.length*400;

if(game.cash<price){

toast("NOT ENOUGH CASH");

return;

}

game.cash-=price;

game.employees.push({

name:
"Employee #"+
(game.employees.length+1),

salary:
250+
game.employees.length*50

});

game.companyValue+=500;

game.xp+=10;

toast("EMPLOYEE HIRED");

updateUI();

}


function fireEmployee(index){

let employee=
game.employees[index];

if(!confirm(
"Fire "+employee.name+"?"
))return;

game.employees.splice(
index,
1
);

toast("EMPLOYEE REMOVED");

updateUI();

}


/* =========================
   MARKET
========================= */

function marketTick(){

let movement=
Math.random()*8-4;

game.market+=movement;

game.market=
Math.max(
45,
Math.min(
155,
game.market
)
);

let economicMove=
Math.random()*5-2.5;

game.economy+=
economicMove;

game.economy=
Math.max(
30,
Math.min(
150,
game.economy
)
);

game.demand+=
(game.market-100)*.015+
(Math.random()*4-2);

game.demand=
Math.max(
40,
Math.min(
160,
game.demand
)
);


/*
Market crash
*/

if(game.market<65){

addNews(
"📉 MARKET CRASH — DEMAND COLLAPSING"
);

game.reputation-=.2;

}


/*
Market boom
*/

if(game.market>135){

addNews(
"📈 MARKET BOOM — INVESTORS ARE BUYING"
);

game.reputation+=.2;

}

}


/* =========================
   STOCK MARKET
========================= */

function updateStocksPrices(){

Object
.entries(game.stocks)
.forEach(([ticker,stock])=>{

let movement=
Math.random()*.12-.06;


/*
Company stock follows
company performance for
the fictional company.
*/

stock.price*=
1+movement;

stock.price=
Math.max(
5,
Math.round(
stock.price*100
)/100
);

});


/*
Player company's fictional stock
represented by company value indirectly.
*/

if(game.companyValue<1000){

addNews(
"🚨 COMPANY STOCK VALUE CRITICAL"
);

}

}


function buyStock(){

let ticker=
document
.getElementById("stockTicker")
.value
.trim()
.toUpperCase();

let amount=
parseInt(
document
.getElementById("stockAmount")
.value
);

if(!game.stocks[ticker]){

toast("TICKER NOT FOUND");

return;

}

if(!amount||amount<1){

toast("INVALID SHARE AMOUNT");

return;

}

let stock=
game.stocks[ticker];

let total=
Math.round(
stock.price*amount
);

if(game.cash<total){

toast("NOT ENOUGH CASH");

return;

}

game.cash-=total;

stock.shares+=amount;

toast(
"BOUGHT "+
amount+
" "+ticker+
" SHARES"
);

updateUI();

}


function sellStock(){

let ticker=
document
.getElementById("stockTicker")
.value
.trim()
.toUpperCase();

let amount=
parseInt(
document
.getElementById("stockAmount")
.value
);

if(!game.stocks[ticker]){

toast("TICKER NOT FOUND");

return;

}

let stock=
game.stocks[ticker];

if(stock.shares<amount){

toast("NOT ENOUGH SHARES");

return;

}

stock.shares-=amount;

game.cash+=
Math.round(
stock.price*amount
);

toast(
"SOLD "+
amount+
" "+ticker
);

updateUI();

}


/* =========================
   LOANS
========================= */

function takeLoan(amount){

if(game.debt>0){

toast(
"YOU ALREADY HAVE A LOAN"
);

return;

}

game.cash+=amount;

game.debt=
Math.round(
amount*1.08
);

game.loanAge=0;

game.loanOverdue=false;

game.companyValue+=
Math.round(amount*.2);

addNews(
"🏦 BANK APPROVED "+
money(amount)+
" BUSINESS LOAN"
);

toast("LOAN APPROVED");

updateUI();

}


function repayLoan(){

if(game.debt<=0){

toast("NO ACTIVE LOAN");

return;

}

let amount=
Math.min(
5000,
game.debt
);

if(game.cash<amount){

toast(
"NOT ENOUGH CASH"
);

return;

}

game.cash-=amount;

game.debt-=amount;

if(game.debt<=0){

game.debt=0;
game.loanAge=0;
game.loanOverdue=false;

toast("🎉 DEBT COMPLETELY PAID");

addNews(
"Company became debt free."
);

}else{

toast(
"LOAN PAYMENT "+
money(amount)
);

}

updateUI();

}


/* =========================
   DAY / NIGHT
========================= */

function worldClock(){

if(!game.started)return;

game.minutes++;


/*
1 real second = 1 game minute.

300 minutes = 5 real minutes.

5 minutes day.
5 minutes night.
*/

let total=
game.minutes%1440;

let hour=
Math.floor(total/60);

let minute=
total%60;

document
.getElementById("clock")
.textContent=
String(hour).padStart(2,"0")+
":"+
String(minute).padStart(2,"0");


let cycle=
game.minutes%600;

let dayTime=
cycle<300;

document
.getElementById("phase")
.textContent=
dayTime?"DAY":"NIGHT";


/*
Every 600 seconds = new game day.
*/

if(
game.minutes>0 &&
game.minutes%600===0
){

newDay();

}

}


/* =========================
   NEW DAY
========================= */

function newDay(){

game.day++;

game.loanAge++;


/*
Employees get paid.
*/

let salaries=
game.employees.reduce(
(total,e)=>total+e.salary,
0
);

if(salaries>0){

game.cash-=salaries;

game.expenses+=salaries;

}


/*
Loan deadline.
*/

if(
game.debt>0 &&
game.loanAge>=2
){

game.loanOverdue=true;

game.risk+=15;

game.debt=
Math.round(
game.debt*1.03
);

addNews(
"🚨 LOAN OVERDUE — BANK PENALTY APPLIED"
);

toast(
"⚠ LOAN OVERDUE"
);

}


/*
Daily economy.
*/

marketTick();

updateStocksPrices();

randomBusinessEvent();

checkLevel();

checkBankruptcy();

saveGame();

updateUI();

}


/* =========================
   RANDOM EVENTS
========================= */

function randomBusinessEvent(){

let events=[

function(){

game.demand+=12;

addNews(
"📈 DEMAND SURGE — CUSTOMERS ARE BUYING"
);

},

function(){

game.demand-=12;

addNews(
"📉 CUSTOMER DEMAND DROPPED"
);

},

function(){

let cost=1200;

if(game.cash>=cost){

game.cash-=cost;

game.expenses+=cost;

addNews(
"⚠ SUPPLIER PRICES INCREASED"
);

}else{

game.inventory-=10;

addNews(
"🚨 SUPPLIER CRISIS — INVENTORY LOST"
);

}

},

function(){

game.reputation+=5;

game.xp+=10;

addNews(
"⭐ YOUR COMPANY WENT VIRAL"
);

},

function(){

game.reputation-=6;

addNews(
"⚠ COMPETITOR DAMAGED YOUR MARKET SHARE"
);

},

function(){

game.market+=10;

addNews(
"📊 INVESTOR CONFIDENCE RISING"
);

}

];

events[
Math.floor(
Math.random()*events.length
)
]();

}


/* =========================
   COMPETITORS
========================= */

function competitorsTick(){

game.competitors.forEach(c=>{

let change=
Math.random()*0.035-.012;

c.value+=
c.value*change;

c.value=
Math.max(
50000,
c.value
);


/*
Strong rivals steal demand.
*/

if(
Math.random()<.05 &&
c.value>game.companyValue
){

game.demand-=1;

addNews(
"⚔ "+c.name+
" captured market share."
);

}

});

}


/* =========================
   LEVEL SYSTEM
========================= */

function checkLevel(){

let required=
100+
game.level*100;

if(game.xp>=required){

game.xp-=required;

game.level++;

game.companyValue+=
game.level*1500;

game.reputation+=3;

toast(
"🏆 LEVEL "+
game.level+
" REACHED"
);

addNews(
"Company advanced to level "+
game.level+"."
);

}

}


function updateLevel(){

let required=
100+
game.level*100;

let percent=
Math.min(
100,
game.xp/required*100
);

document
.getElementById("xpBar")
.style.width=
percent+"%";

document
.getElementById("xpText")
.textContent=
game.xp+
" / "+
required+
" XP";

let ranks=[

"STARTUP",
"SMALL BUSINESS",
"GROWING COMPANY",
"CORPORATION",
"INDUSTRY LEADER",
"GLOBAL COMPANY",
"BUSINESS TITAN",
"MEGA EMPIRE"

];

document
.getElementById("rank")
.textContent=
ranks[
Math.min(
game.level-1,
ranks.length-1
)
];

}


/* =========================
   RISK
========================= */

function calculateRisk(){

let risk=0;

if(game.cash<5000)
risk+=15;

if(game.cash<2000)
risk+=20;

if(game.inventory<
game.inventoryCapacity*.2)
risk+=20;

if(game.debt>0)
risk+=15;

if(game.loanOverdue)
risk+=25;

if(game.reputation<30)
risk+=10;

if(game.demand<60)
risk+=10;

if(game.companyValue<5000)
risk+=15;

game.risk=
Math.min(
100,
Math.round(risk)
);

}


function updateRisk(){

calculateRisk();

document
.getElementById("risk")
.textContent=
"RISK "+
game.risk+
"%";

let bar=
document.getElementById("alertBar");

if(game.risk>=70){

bar.style.color="#ff6666";

document
.getElementById("alertMessage")
.textContent=
"🚨 CRITICAL COMPANY RISK";

}else if(game.risk>=40){

bar.style.color="#e5c768";

document
.getElementById("alertMessage")
.textContent=
"⚠ COMPANY UNDER PRESSURE";

}else{

bar.style.color="#769098";

document
.getElementById("alertMessage")
.textContent=
"● OPERATIONS STABLE";

}


/*
Health
*/

let health=
100-game.risk;

document
.getElementById("health")
.textContent=
health+"%";

document
.getElementById("healthText")
.textContent=

health>=75
?"Company operating normally."

:
health>=45
?"Financial pressure is increasing."

:
"⚠ Your company is in serious danger.";

}


/* =========================
   BANKRUPTCY
========================= */

function checkBankruptcy(){

/*
If company loses more than
$100,000 it collapses.
*/

if(
game.cash<=-100000 ||
game.companyValue<=-100000
){

alert(
"💀 BANKRUPTCY\n\n"+
game.company+
" HAS COLLAPSED.\n\n"+
"Your losses exceeded $100,000.\n\n"+
"THE EMPIRE HAS BEEN RESET."
);

localStorage.removeItem(
"tycoonXSave"
);

location.reload();

return;

}


/*
Critical inventory + zero money
can stop business.
*/

if(
game.cash<=0 &&
game.inventory<=0
){

game.companyValue-=100;

}

}


/* =========================
   NEWS
========================= */

function addNews(text){

game.news.unshift(text);

game.news=
game.news.slice(0,6);

}


/* =========================
   UI BUSINESS
========================= */

function updateBusiness(){

let production=
100+
(game.productionLevel-1)*35+
game.researchLevel*15+
game.employees.length*10;

document
.getElementById("production")
.textContent=
Math.round(production);

document
.getElementById("productionBar")
.style.width=
Math.min(
100,
production/300*100
)+"%";

document
.getElementById("inventory")
.textContent=
Math.round(
game.inventory/
game.inventoryCapacity*
100
)+"%";

document
.getElementById("inventoryBig")
.textContent=
Math.round(
game.inventory/
game.inventoryCapacity*
100
)+"%";

document
.getElementById("inventoryBar")
.style.width=
Math.min(
100,
game.inventory/
game.inventoryCapacity*
100
)+"%";

document
.getElementById("prodLevel")
.textContent=
game.productionLevel;

document
.getElementById("marketingLevel")
.textContent=
game.marketingLevel;

document
.getElementById("researchLevel")
.textContent=
game.researchLevel;


/*
Approximate current cycle economics.
*/

let revenue=
Math.round(
production*
(game.demand/100)*
(game.market/100)*
(8+game.marketingLevel*1.5)
);

let salaries=
game.employees.reduce(
(t,e)=>t+e.salary,
0
);

let expense=
Math.round(
production*2.5+
salaries
);

document
.getElementById("revenueCycle")
.textContent=
money(revenue);

document
.getElementById("expenseCycle")
.textContent=
money(expense);

document
.getElementById("cashFlow")
.textContent=
money(revenue-expense);

}


/* =========================
   MARKET UI
========================= */

function updateMarket(){

document
.getElementById("marketIndex")
.textContent=
Math.round(game.market);

document
.getElementById("demand")
.textContent=
Math.round(game.demand)+"%";

document
.getElementById("economy")
.textContent=
Math.round(game.economy)+"%";

let distance=
Math.abs(game.market-100);

document
.getElementById("volatility")
.textContent=
distance>30
?"EXTREME"
:
distance>15
?"HIGH"
:
"LOW";

document
.getElementById("marketCondition")
.textContent=

game.market>130
?"📈 MARKET BOOM"

:
game.market<70
?"📉 MARKET CRASH"

:
"STABLE MARKET";

drawGraph();

}


/* =========================
   GRAPH
========================= */

function drawGraph(){

let graph=
document.getElementById("graph");

graph.innerHTML="";

for(let i=0;i<40;i++){

let dot=
document.createElement("div");

dot.className="graph-dot";

dot.style.left=
(i*2.5)+"%";

dot.style.top=
(
50+
Math.sin(i*.65)*25+
Math.random()*12
)+"%";

graph.appendChild(dot);

}

}


/* =========================
   STOCK UI
========================= */

function updateStocks(){

let box=
document.getElementById("stockList");

box.innerHTML=
Object.entries(game.stocks)
.map(([ticker,stock])=>`

<div class="stock">

<small>${ticker}</small>

<strong>
${money(stock.price)}
</strong>

<span class="green">
● MARKET ACTIVE
</span>

</div>

`)
.join("");


let portfolio=
document.getElementById("portfolio");

let owned=
Object.entries(game.stocks)
.filter(([a,b])=>b.shares>0);

if(!owned.length){

portfolio.innerHTML=
"<p>No investments yet.</p>";

return;

}

portfolio.innerHTML=
owned
.map(([ticker,stock])=>`

<div class="employee">

<span>
${ticker}
— ${stock.shares} shares
</span>

<strong>
${money(stock.price*stock.shares)}
</strong>

</div>

`)
.join("");

}


/* =========================
   BANK UI
========================= */

function updateBank(){

document
.getElementById("loan")
.textContent=
money(game.debt);

document
.getElementById("loanAge")
.textContent=
game.debt>0
?game.loanAge+" DAYS"
:"0 DAYS";

document
.getElementById("loanStatus")
.textContent=
game.debt<=0
?"NO LOAN"
:
game.loanOverdue
?"OVERDUE"
:"ACTIVE";

let debtPercent=
Math.min(
100,
game.debt/100000*100
);

document
.getElementById("debtBar")
.style.width=
debtPercent+"%";

document
.getElementById("bankWarning")
.textContent=

game.loanOverdue
?"🚨 BANK PENALTIES ACTIVE. REPAY THE LOAN."
:
game.debt>0
?"Loan active. Missing repayment increases risk."
:
"Your company has no outstanding business loan.";

}


/* =========================
   EMPLOYEES
========================= */

function updateEmployees(){

let box=
document.getElementById("employees");

if(!game.employees.length){

box.innerHTML=
"<p>No employees hired.</p>";

return;

}

box.innerHTML=
game.employees
.map((e,i)=>`

<div class="employee">

<span>
👤 ${e.name}
<br>
<small>
Salary ${money(e.salary)}/day
</small>
</span>

<button onclick="fireEmployee(${i})">
FIRE
</button>

</div>

`)
.join("");

}


/* =========================
   RIVALS
========================= */

function updateRivals(){

let box=
document.getElementById("rivals");

box.innerHTML=
game.competitors
.map(c=>`

<div class="rival">

<div class="rival-logo">
${c.ticker}
</div>

<div>

<h3>${c.name}</h3>

<p>
Market Power ${c.power}/100
</p>

</div>

<div class="rival-value">

<strong>
${money(c.value)}
</strong>

<span class="${
game.companyValue>c.value
?"green"
:"red"
}">
${
game.companyValue>c.value
?"YOU ARE WINNING"
:"RIVAL AHEAD"
}
</span>

</div>

</div>

`)
.join("");

}


/* =========================
   OBJECTIVE
========================= */

function updateObjective(){

let target=
50000;

let percent=
Math.min(
100,
game.companyValue/target*100
);

document
.getElementById("objectiveBar")
.style.width=
percent+"%";

document
.getElementById("objective")
.textContent=

game.companyValue>=target
?"🏆 TARGET COMPLETE — BUILD A $250K EMPIRE."
:
"Build your first $50,000 company.";

}


/* =========================
   PAGE SYSTEM
========================= */

function showPage(id,button){

document
.querySelectorAll(".page")
.forEach(page=>
page.classList.remove("active")
);

document
.getElementById(id)
.classList.add("active");

document
.querySelectorAll("nav button")
.forEach(btn=>
btn.classList.remove("active")
);

button.classList.add("active");

}


/* =========================
   SETTINGS
========================= */

function openSettings(){

document
.getElementById("settings")
.classList.remove("hidden");

}

function closeSettings(){

document
.getElementById("settings")
.classList.add("hidden");

}


function toggleSound(){

game.sound=!game.sound;

document
.getElementById("sound")
.textContent=
game.sound?"ON":"OFF";

saveGame();

}


function resetGame(){

let first=
confirm(
"⚠ WARNING ⚠\n\n"+
"Your entire company will be deleted."
);

if(!first)return;

let second=
confirm(
"FINAL WARNING\n\n"+
"Cash, stocks, employees, loans, upgrades and levels will ALL be lost.\n\n"+
"RESET COMPANY?"
);

if(!second)return;

localStorage.removeItem(
"tycoonXSave"
);

location.reload();

}


/* =========================
   TOAST
========================= */

function toast(message){

let box=
document.getElementById("toast");

box.textContent=message;

box.classList.add("show");

setTimeout(()=>{
box.classList.remove("show");
},2300);

}


/* =========================
   AUTOMATIC SIMULATION
========================= */

/*
Every 5 seconds:
Business operates automatically.
*/

setInterval(()=>{

if(!game.started)return;

automaticBusiness();

competitorsTick();

checkLevel();

checkBankruptcy();

updateUI();

saveGame();

},5000);


/*
Every 1 second:
world clock.
*/

setInterval(()=>{

if(!game.started)return;

worldClock();

},1000);


/*
Every 15 seconds:
stock market changes.
*/

setInterval(()=>{

if(!game.started)return;

updateStocksPrices();

updateStocks();

},15000);


/*
Every 20 seconds:
market changes.
*/

setInterval(()=>{

if(!game.started)return;

marketTick();

updateUI();

},20000);


/* LOAD EXISTING GAME */

loadGame();
