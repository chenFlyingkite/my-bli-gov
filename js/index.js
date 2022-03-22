//import TicTac from "js/TicTac";
// import { powNK } from "./util";

//-- Base implementation
const allClicks = new Map();
function addClickListeners() {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
    allClicks.forEach(function(value, key, map) {
        const e = document.getElementById(key);
        //console.log(`${key[0]} -> ${value}`);
        if (e) {
            e.addEventListener("click", value);
        } else {
            console.error(`Cannot find dom : key = ${key}, v = ${value}`);
        }
    });
}

function callOnClick(domID) {
    let e = document.getElementById(domID);
    if (e) {
        console.log(`id = ${domID}, e = ${e}, ${e.onclick}, ${e.onkeyup}`);
        if (typeof e.onclick === "function") {
            e.onclick.apply(e);
        }
    }
}

//----
// constants
const fixedDigit = 1;
const MOD = powNKA(10, fixedDigit);
const COLOR_LEVEL = [1_500_000, 1_000_000, 500_000, 100_000, 10_000, -10_000, -100_000, -500_000, -1_000_000];
const COLOR_CLASS = ["P5", "P4", "P3", "P2", "P1", "N1", "N2", "N3", "N4", "N5"];

//-------
class TicTac {
    constructor() {
        // time stack
        this.tictac = [];
        this.tag = "TicTac";
        this.log = true;
        this.enable = true;
    }

    tic() {
        if (!this.enable) {
            return -1;
        } else {
            const tic = this.now();
            this.tictac.push(tic);
            return tic;
        }
    }

    tacL() {
        if (!this.enable) {
            return -1;
        } else {
            const tac = this.now();
            if (this.tictac.length < 1) {
                return -1; // underflow
            } else {
                const tic = this.tictac.pop();
                return tac - tic;
            }
        }
    }

    // get tictac() {
    //     return this.tictac;
    // }

    tac(msg) {
        if (!this.enable) {
            return -1;
        } else {
            const tac = this.now();
            if (this.tictac.empty()) {
                this.logError(tac, msg);
                return -1;
            } else {
                const tic = this.tictac.pop();
                sb = "";
                for (let i = 0; i < this.tictac.length; i++) {
                    sb += " ";
                }
                sb += `[${tac-tic}] : ${msg}`;
                this.logTac(sb.toString());
                return tac - tic;
            }
        }
    }

    reset() {
        this.tictac.clear();
    }

    logError(tac, msg) {
        console.log(`X_X Omitted. tic = N/A, tac = ${getTime(tac)} : ${msg}`);
    }

    logTac(msg) {
        if (this.log) {
            console.log(msg);
        }
    }

    //static
    getTime(timeMS) {
        return new Date(timeMS).toISOString();
    }

    toString() {
        return `tictac.size() = ${this.tictac.length()}`;
    }

    //static
    now() {
        return new Date().getTime();// .currentTimeMillis;
    }
}
const tictac = new TicTac();

//---

// Define functions
function clock(domID) {
    // Get today's date and time
    let d = new Date();
    //var now = d.getTime(); // long value
    //var now = d.toISOString(); // yyyy-mm-ddThh:MM:ss.SSSZ like 2022-03-14T10:26:34
    var now = d.toLocaleString();// Date = 2022/3/15, Time = 上午10:47:46, Locale = Date + Time
    document.getElementById(domID).innerHTML = "現在時間: " + now;
}

// Run methods and main
function setupTimer() {
    const run = function () {
        clock("clock");
    }
    run();
    setInterval(run, 1000);
}

// Define events, id, function
// id : function

allClicks.set("deceaseBtn", function (e) {
    const year = parseDom("year");
    const rate = parseDom("rateOfReturn");
    const pay = parseDom("deceasePay");
    console.log(`deceaseBtn, y = ${year}, r = ${rate}`);
    tictac.tic();
    const table = evalDeceasePension(pay, year, rate);
    makeTable("eval", table);
    let ms = tictac.tacL();
    const name = e.target.innerText;
    showSpent(`計算 ${name} ${ms}`);
});

allClicks.set("survivorBtn", function (e) {
    const year = parseDom("year");
    const rate = parseDom("rateOfReturn");
    const pay = parseDom("survivorPay");
    console.log(`survivorPay, y = ${year}, r = ${rate}`);
    tictac.tic();
    const table = evalSurvivalPension(pay, year, rate);
    makeTable("eval", table);
    let ms = tictac.tacL();
    const name = e.target.innerText;
    showSpent(`計算 ${name} ${ms}`);
});

allClicks.set("deceaseMinusSurvivorBtn", function (e) {
    const year = parseDom("year");
    const rate = parseDom("rateOfReturn");
    const dpay = parseDom("deceasePay");
    const spay = parseDom("survivorPay");
    console.log(`decease - survivor, y = ${year}, r = ${rate}`);
    tictac.tic();
    // const deceaseTable = evalDeceasePension(dpay, year, rate);
    // const survivorTable = evalSurvivalPension(spay, year, rate);
    // eval deceaseTable[1,2:] - survivorTable[1,2:]
    let ans = makeData(year, rate);
    let m = rate;
    let n = year;
    console.log(`decease - survivor, m = ${m}, n = ${n}`);
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            let val = evalDeceasePay(dpay, i, j) - evalSurvivalPay(spay, i, j);
            ans[i][1+j] = val;
        }
    }

    makeTable("eval", ans, true);
    let ms = tictac.tacL();
    const name = e.target.innerText;
    showSpent(`計算 ${name} ${ms}`);
});

function showSpent(ms) {
    document.getElementById("spent").innerText = `${ms} ms`;
}

function parseDom(domID) {
    const e = document.getElementById(domID);
    if (e) {
        return e.value;
        //return parseInt(e.value, 10);
    } else {
        return 0;
    }
}

// deceaseTable
// 本人死亡給付 = A(1+r)^N
function evalDeceasePension(oneA, year, rate) {
    let ans = makeData(year, rate);
    let m = ans.length;
    let n = ans[0].length;
    m = rate;
    n = year;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            ans[i][1+j] = evalDeceasePay(oneA, i, j);
        }
    }
    return ans;
}

function evalDeceasePay(oneA, rateAt, yearAt) {
    const nf = MOD; // %.1f
    const r = rateAt;
    const N = yearAt;
    let val = 0.0;
    val = oneA * Math.pow((100 + r) / 100, N);
    val = Math.round(val * nf) / nf;
    return val;
}

// survivorTable
//遺屬年金給付 = M * ((1 + r/12)^(12*N) - 1) / (r/12)
function evalSurvivalPension(oneM, year, rate) {
    const nf = MOD; // %.1f
    let ans = makeData(year, rate);
    let m = ans.length;
    let n = ans[0].length;
    m = rate;
    n = year;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            ans[i][1+j] = evalSurvivalPay(oneM, i, j);
        }
    }
    return ans;
}

function evalSurvivalPay(oneM, rateAt, yearAt) {
    const nf = MOD; // %.1f
    const r = rateAt;
    const N = yearAt;
    const r12 = (r) / 1200; // = if r = 3, 1 + 3% / 12
    let val = 0.0;
    val = oneM * (Math.pow(1 + r12, N * 12) - 1) / r12;
    val = Math.round(val * nf) / nf;
    return val;
}

function matrixMxN(m, n) {
    let ans = [];
    for (let i = 0; i < m; i++) {
        ans[i] = [];
        for (let j = 0; j < n; j++) {
            ans[i][j] = '';
        }
    }
    return ans;
}

// base table
function makeData(year, rate) {
    // https://www.delftstack.com/zh-tw/howto/javascript/javascript-2d-array/
    // mxn array = let arr = Array.from(Array(m), () => new Array(n)); // failed
    //let ans = Array.from(Array(rate + 1), ()=>(new Array(year + 2)));// new Array(rate + 1);//<Array<string>>;

    // make ans[rate+1][year+2]
    let ans = matrixMxN(rate + 1, year + 2);
    // const m = rate + 1;
    // const n = year + 2;
    // let ans = [];
    // for (let i = 0; i < m; i++) {
    //     ans[i] = [];
    // }
    // fill in first row
    ans[0][0] = "年利率 = r";
    ans[0][1] = "1 + r";
    for (let i = 1; i <= year; i++) {
        ans[0][i+1] = i;
    }
    // fill in two columns
    for (let i = 1; i <= rate; i++) {
        ans[i][0] = i;
        ans[i][1] = (100 + i) / 100;
    }
    return ans;
}

function makeTable(rootID, data, color) {
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');

    let row;
    let n = data.length;
    if (n > 0) {
        row = makeRow("tr", "th", data[0], color);
        thead.appendChild(row);
    }
    for (let i = 1; i < n; i++) {
        row = makeRow("tr", "td", data[i], color);
        tbody.appendChild(row);
    }
    table.appendChild(thead);
    table.appendChild(tbody);
    //table.style.border = "1px solid black";

    // Adding the entire table to the body tag
    const root = document.getElementById(rootID);
    removeChildDom(rootID);
    root.appendChild(table);
}

// Adding the entire table to the body tag
function removeChildDom(rootID) {
    const it = document.getElementById(rootID);
    it.innerHTML = "";
    // while (it.firstChild) {
    //     it.firstChild.remove();
    // }
    return it;
}

function getColorClass(v) {
    const level = COLOR_LEVEL;
    const clazz = COLOR_CLASS;
    let n = clazz.length;
    for (let i = 0; i < n; i++) {
        if (v >= level[i]) {
            return clazz[i];
        }
    }
    return clazz[n-1];
}

// (tr, th) or (tr, td) on content as a
function makeRow(rowTag, itemTag, a, color) {
    // Creating and adding data to first row of the table
    let row = document.createElement(rowTag);
    for (let i = 0; i < a.length; i++) {
        let ai = document.createElement(itemTag);
        //ai.innerHTML = a[i].toLocaleString();// ok
        let s = a[i].toLocaleString();
        ai.innerHTML = s;
        if (color) {
            if (typeof a[i] === 'number') {
                let cls = getColorClass(a[i]);
                ai.classList.add(cls);
            }
        }
        row.appendChild(ai);
    }
    return row;
}

function applyMom() {
    const monthlyPay = 9606; // 遺屬年金給付 每月
    const sixMonthInsured = 44533; // 6個月之平均月投保薪資
    document.getElementById("monthlyInsured").value = sixMonthInsured;
    document.getElementById("funeralPay").value = 5 * sixMonthInsured; // 222665;
    document.getElementById("deceasePay").value = 30 * sixMonthInsured; //1335990;
    document.getElementById("survivorPay").value = monthlyPay;
}

// integer n, integer k, return n^k
function powNKA(n, k) {
    let x = n, y = k;
    let ans = 1; // n^0
    while (y > 0) {
        if (y & 0x1 == 1) { // y % 2 == 1
            ans = ans * x;
        }
        x = x * x;
        y /= 2;
    }
    return ans;
}

function enterToClick(keyUpDomID, clickDomID) {
    const e = document.getElementById(keyUpDomID);
    if (e) {
        e.onkeyup = function (e) {
            if (e.keyCode === 13) {
                // Enter = 13
                allClicks.get(clickDomID).apply(e);
            }
        }
    } else {
        console.log(`Element not found for ${keyUpDomID}`);
    }
}

function makeColorTable() {
    const data = COLOR_LEVEL;
    const rootID = "colorTable";
    //makeTable("colorTable", table, true);
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let row = makeRow("tr", "th", data, true);
    thead.appendChild(row);
    table.appendChild(thead);
    const root = document.getElementById(rootID);
    removeChildDom(rootID);
    root.appendChild(table);
    //makeRow("tr", "th", table, true);
}

function addListeners() {
    addClickListeners();
    enterToClick("funeralPay", "funeralBtn");
    enterToClick("survivorPay", "survivorBtn");
}

function main() {
    setupTimer();
    addListeners();
    makeColorTable();
    applyMom();
    callOnClick("funeralTable");
}

window.onload = function() {
    console.log("onload");
    main();
}
