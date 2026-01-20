// http://127.0.0.1:5500/?e=NrBEGMHsDtsgnUAaUAFAts0BlZBmAOgFYkBGUgJgoIA4B2JG0ggThbIAYAWAjvMriwC6SMAFkAluAAWAUwA282VgxZcSIsSR0AbNQokiNLXk0UuZPHhFgAwgEMAzrICeKzCgBCyTYZaauHSRAgiskCg5Oa1EIewBXe3csACNkHhJQCN4OLFIWAh0cm1B4F3toJJRUjRRzbKwKZl1QYoAXexd5BErQaR8UUh16oSEgA#

const BARBACK_TIP_PERCENT = 0.04; // 4% tip out for barbacks
const HOST_TIP_PERCENT = 0.01; // 1% tip out for hosts
let employees = [];
let jobTypes = { 'S': 'Server', 'B': 'Bartender', 'b': 'Barback', 'h': 'Host' };


window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    employees = JSON.parse(LZString.decompressFromEncodedURIComponent(params.get("e")));
}

function copyLink(getemployees = true) {
    let tempEmployees = []
    for (emp of employees) {
        tempEmployees.push(emp.slice(0, Math.min(emp.length, 8)));
    }
    if (getemployees) {
        if (!addEmployees()) {
            return;
        }
    }
    let allVars = '?e=' + LZString.compressToEncodedURIComponent(JSON.stringify(tempEmployees));
    const link = window.location.href.replace('#', '').split('?')[0] + allVars;

    navigator.clipboard.writeText(link).then(() => {
        const copyBtn = document.getElementById('shareBtn');
        const originalText = copyBtn.textContent;
        copyBtn.blur();
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function truncTo2(num, numDecimals = 2) {
    const match = num.toString().match(new RegExp("^\\d+(\\.\\d{0," + numDecimals + "})?"));
    return parseFloat(match ? match[0] : num);
}

function sortEmployeeList() {
    employees.sort((a, b) => {
        const jobOrder = { 'S': 1, 'B': 2, 'b': 3, 'h': 4 };
        return jobOrder[a[2]] - jobOrder[b[2]];
    });
}

function showTipOutInfo(tableHTML) {
    sortEmployeeList()
    for (let emp of employees) {
        let cash, cc, totalTips;
        if (emp[2] === 'b' || emp[2] === 'h') {
            cash = parseFloat(emp[4]);
            cc = parseFloat(emp[5]);
            totalTips = ((cc || 0) * 100 + (cash * 100)) / 100;
        } else {//if (emp[2] === 'S' || emp[2] === 'B') {
            cash = parseFloat(emp[14]);
            cc = parseFloat(emp[15]);
            totalTips = ((cc || 0) * 100 + (cash * 100)) / 100;
        }
        tableHTML += `<tr><td>${emp[0]}</td><td>${emp[2]}</td><td>$${cash}</td><td>$${cc || 0}</td><td>$${totalTips}</td></tr>`;
    }
    tableHTML += `</tbody></table><br/>`;

    document.getElementById('TipsOutList').innerHTML += tableHTML;
}

function splitTipsEvenly(cashPool, ccPool, employeeChar) {
    let hours = 0;
    for (let emp of employees.filter(emp => [...employeeChar].includes(emp[2]))) { hours += emp[3]; }
    let tipHourCash = cashPool / hours;
    let tipHourCC = ccPool / hours;

    for (let emp of employees.filter(emp => [...employeeChar].includes(emp[2]))) {
        let earningsCash = truncTo2(emp[3] * tipHourCash, 0)//.toFixed(2);
        let earningsCC = truncTo2(emp[3] * tipHourCC);
        emp.push(earningsCash);//emp[4]
        emp.push(earningsCC);//emp[5]
    }
}

function redistributeLeftoverCC(leftoverCC, employeeLst, ccIndex) {
    if (leftoverCC > 0) {

        const splitAmount = truncTo2(leftoverCC / employeeLst.length);
        let remainder = leftoverCC - (splitAmount * employeeLst.length);

        employeeLst.forEach(({ index }) => {
            employees[index][ccIndex] = (parseFloat(employees[index][ccIndex]) + splitAmount).toFixed(2);
        });

        if (remainder > 0) {
            const minHoursServer = employeeLst.reduce((min, curr) =>
                curr.emp[3] < min.emp[3] ? curr : min
            );
            employees[minHoursServer.index][ccIndex] = (parseFloat(employees[minHoursServer.index][ccIndex]) + remainder).toFixed(2);
        }
    }
}

function redistributeLeftoverCash(leftoverCash, employeeLst, cashIndex) {
    while (leftoverCash > 0 && employeeLst.length > 0) {
        // console.log('Leftover cash to distribute: $', leftoverCash);
        for (emp of employeeLst) {
            if (leftoverCash <= 0) {
                return;
            }
            employees[emp.index][cashIndex] = (parseFloat(employees[emp.index][cashIndex]) + 1).toFixed(2);
            leftoverCash -= 1;
            // console.log('Distributing $1 to', employees[emp.index][0], ', leftover now: $', leftoverCash);
        }
    }
}

function redistributeLeftoverTips(employeeLst, cashTipIndex, ccTipIndex, poolCash, poolCC) {
    let tempCash = 0;
    let tempCC = 0;
    for (let emp of employeeLst.map(e => e.emp)) {
        tempCash += parseFloat(emp[cashTipIndex] || 0);
        tempCC += parseFloat(emp[ccTipIndex] || 0);
    }
    let leftoverCash = poolCash - tempCash;
    let leftoverCC = truncTo2(poolCC - tempCC);

    redistributeLeftoverCC(leftoverCC, employeeLst, ccTipIndex);
    redistributeLeftoverCash(leftoverCash, employeeLst, cashTipIndex);
    return [leftoverCC, leftoverCash];
}

function addEmployees() {
    if (document.getElementById('addBarbackModal').classList.contains('d-none')) {
        // Server or Bartender
        let name = document.getElementById('serverName').value;
        let job = document.getElementById('serverType').textContent.charAt(0);
        let shift = document.querySelector('input[name="serverShift"]:checked').value;
        let hours = parseFloat(document.getElementById('serverHours').value);
        let sales = parseFloat(document.getElementById('grossSales').value);
        let tax = parseFloat(document.getElementById('salesTax').value);
        let ccTips = parseFloat(document.getElementById('creditTip').value);
        let cashTips = parseFloat(document.getElementById('cashTip').value);
        name = name.charAt(0).toUpperCase() + name.slice(1);
        if ([name, shift, job, hours, sales, tax, ccTips, cashTips].includes('')) {
            alert('Please fill in all fields for the employee.');
            return false;
        }
        employees.push([name, shift, job, hours, sales, tax, ccTips, cashTips]);
    }
    else {
        // Barback or Host
        let name = document.getElementById('BarbackName').value;
        let job = document.getElementById('BarbackType').textContent.charAt(0).toLowerCase();
        let shift = document.querySelector('input[name="bbshift"]:checked').value;
        let hours = parseFloat(document.getElementById('bbHours').value);
        name = name.charAt(0).toUpperCase() + name.slice(1);
        if ([name, shift, job, hours].includes('')) {
            alert('Please fill in all fields for the employee.');
            return false;
        }
        employees.push([name, shift, job, hours]); // Percent is fixed at 4% for barbacks and 1% for hosts

    }

    // Clear the input fields
    document.getElementById('serverName').value = '';
    document.getElementById('serverHours').value = '';
    document.getElementById('grossSales').value = '';
    document.getElementById('salesTax').value = '';
    document.getElementById('creditTip').value = '';
    document.getElementById('cashTip').value = '';
    document.getElementById('BarbackName').value = '';
    document.getElementById('bbHours').value = '';
    return true;
}

window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const employeeData = JSON.parse(params.get('employees') || '[]');
    employeeData.forEach(emp => {
        // console.log(emp);

        if (emp[2] == 'S' || emp[2] == 'B') {
            employees.push([emp[0], emp[1], emp[2], emp[3], emp[4], emp[5], emp[6], emp[7]]);
        } else {
            employees.push([emp[0], emp[1], emp[2], emp[3]]);
        }

    });

});

document.getElementById('editHoursBtn').addEventListener('click', function () {
    sortEmployeeList()
    document.getElementById('editEmployeeTableBody').innerHTML = ''; // Clear existing rows
    employees.forEach(emp => {
        let employeeNumber = employees.indexOf(emp);

        let row = document.createElement('tr');
        let jobFull = jobTypes[emp[2]];
        if (emp[2] == 'S' || emp[2] == 'B') {
            row.innerHTML = `<td>${emp[0]}</td><td>${emp[2]}</td><td>${emp[1]}</td><td>${emp[3]}</td><td>${emp[4]}</td><td>${emp[5]}</td><td>${emp[6]}</td><td>${emp[7]}</td>`;
        } else {
            row.innerHTML = `<td>${emp[0]}</td><td>${emp[2]}</td><td>${emp[1]}</td><td>${emp[3]}</td><td>N/A</td><td>N/A</td><td>N/A</td><td>N/A</td>`;
        }
        row.style.cursor = 'pointer';
        row.onclick = () => editEmployee(employeeNumber);
        document.getElementById('editEmployeeTableBody').appendChild(row);
    });
});

function editEmployee(index) {

    emp = employees[index]; // Access the employee data

    switch (emp[2]) {
        case 'S':
            document.getElementById('addServerBtn').click();
            document.getElementById('serverName').value = emp[0];
            document.querySelector(`input[name="serverShift"][value="${emp[1]}"]`).checked = true;
            document.getElementById('serverHours').value = emp[3];
            document.getElementById('grossSales').value = emp[4];
            document.getElementById('salesTax').value = emp[5];
            document.getElementById('creditTip').value = emp[6];
            document.getElementById('cashTip').value = emp[7];
            break;
        case 'B':
            document.getElementById('addBartenderBtn').click();
            document.getElementById('serverName').value = emp[0];
            document.querySelector(`input[name="serverShift"][value="${emp[1]}"]`).checked = true;
            document.getElementById('serverHours').value = emp[3];
            document.getElementById('grossSales').value = emp[4];
            document.getElementById('salesTax').value = emp[5];
            document.getElementById('creditTip').value = emp[6];
            document.getElementById('cashTip').value = emp[7];
            break;
        case 'b':
            document.getElementById('addBarbackBtn').click();
            document.getElementById('BarbackName').value = emp[0];
            document.querySelector(`input[name="bbshift"][value="${emp[1]}"]`).checked = true;
            document.getElementById('bbHours').value = emp[3];
            break;
        case 'h':
            document.getElementById('addHostBtn').click();
            document.getElementById('BarbackName').value = emp[0];
            document.querySelector(`input[name="bbshift"][value="${emp[1]}"]`).checked = true;
            document.getElementById('bbHours').value = emp[3];
            break;
    }

    employees.splice(index, 1);

}

function calculateTips() {
    // alert('Tip calculation functionality is not yet implemented for AM/PM split.');

    for (let emp of employees) {
        // Reset any previous calculations
        if (emp[2] === 'S' || emp[2] === 'B') {
            emp.splice(8); // Remove any calculated fields beyond index 7
        } else {
            emp.splice(4); // Remove any calculated fields beyond index 3
        }
    }

    let bbCashPool = 0;
    let bbCCPool = 0;
    let hostTipPool = 0;
    let serverCCTipPool = 0;
    let serverCashTipPool = 0;
    let tableHTML = '';

    const servers = employees.filter(emp => emp[2] === 'S' || emp[2] === 'B').map((emp) => ({ emp, index: employees.indexOf(emp) }));
    const barbacks = employees.filter(emp => emp[2] === 'b').map((emp) => ({ emp, index: employees.indexOf(emp) }));
    const hosts = employees.filter(emp => emp[2] === 'h').map((emp) => ({ emp, index: employees.indexOf(emp) }));

    for (let emp of employees.filter(emp => emp[2] === 'S' || emp[2] === 'B')) {
        let cash, cc;
        let netSales = (emp[4] - emp[5] - emp[6]).toFixed(2); // grossSales - salesTax - ccTips, rounded to 2 decimals
        let bbCut = Math.trunc((netSales * BARBACK_TIP_PERCENT) * 100) / 100;
        // console.log('barback cut for', emp[0], ': $', bbCut);
        let HostCut = 0;
        emp.push(parseFloat(netSales));//emp[8]

        if (emp[7] > 0) {
            cash = Math.floor(bbCut / 2);
            cc = truncTo2(bbCut - cash);
            if (cash < truncTo2(cc, 0)) {
                cash += 1;
                cc = truncTo2(bbCut - cash);
            }
        } else {
            cash = truncTo2(0);
            cc = truncTo2(bbCut);
        }
        emp.push(cash);//emp[9] cash
        emp.push(cc);//emp[10] cc
        emp.push(truncTo2(emp[6] - cc));//emp[11] server cc after barback cut
        emp.push(truncTo2(emp[7] - cash));//emp[12] server cash after barback cut
        serverCCTipPool += emp[11];
        serverCashTipPool += emp[12];
        bbCashPool += cash;
        bbCCPool += cc;

        //host cut
        if (emp[2] == 'S') {
            HostCut = emp[8] * HOST_TIP_PERCENT;
            emp[12] -= HostCut; // deduct host cut from server cash after barback cut
            hostTipPool += parseFloat(HostCut.toFixed(0) || 0);
        }
        emp.push(HostCut.toFixed(0));//emp[13] host cut
    }
    serverCCTipPool = truncTo2(serverCCTipPool);

    sortEmployeeList()
    console.log(`
        emp[0] Name
        emp[1] Shift
        emp[2] Job
        emp[3] Hours
        emp[4] Sales
        emp[5] Tax
        emp[6] CC Tips
        emp[7] Cash Tips
        emp[8] Net Sales
        emp[9] Barback Cut cash
        emp[10] Barback Cut cc
        emp[11] Server CC after barback cut
        emp[12] Server Cash after barback cut
        emp[13] Host Cut (servers only)
        emp[14] Server CC Earnings
        emp[15] Server Cash Earnings
        type employees for a list of all employees
        `)
    tableHTML = '<h2>Barback & Host Cut</h2><table><thead><tr><th>Name</th><th>Shift</th><th>Job</th><th>BB Cash</th><th>BB CC</th><th>Host Cash</th></tr></thead><tbody>';
    for (let emp of employees.filter(emp => emp[2] === 'S' || emp[2] === 'B')) {
        tableHTML += `<tr><td>${emp[0]}</td><td>${emp[1]}</td><td>${emp[2]}</td><td>$${emp[9]}</td><td>$${emp[10] || 'N/A'}</td><td>$${emp[13] || 'N/A'}</td></tr>`;
    }
    tableHTML += `<tr><td>Totals:</td><td></td><td></td><td>$${bbCashPool}</td><td>$${truncTo2(bbCCPool)}</td><td>$${Math.round(hostTipPool)}</td></tr></tbody></table>`;
    document.getElementById('TipsCutList').innerHTML = tableHTML;

    //distribute tips
    splitTipsEvenly(bbCashPool, bbCCPool, 'b');//barbacks
    splitTipsEvenly(hostTipPool, 0/*no cc for hosts */, 'h');//hosts
    splitTipsEvenly(serverCashTipPool, serverCCTipPool, 'SB');//servers and bartenders

    tableHTML = `<h2>Tip Out</h2><p>Server pool: Cash $${serverCashTipPool}, CC $${serverCCTipPool}</p>`;
    tableHTML += '<table><thead><tr><th>Name</th><th>Job</th><th>Cash Out</th><th>CC Out</th><th>Total</th></tr></thead><tbody>';

    //initial tip out view
    showTipOutInfo(tableHTML)

    //handle leftovers
    let [leftoverBBCC, leftoverBBCash] = redistributeLeftoverTips(barbacks, 4, 5, bbCashPool, bbCCPool);
    let [leftoverServerCC, leftoverServerCash] = redistributeLeftoverTips(servers, 14, 15, serverCashTipPool, serverCCTipPool);
    let [_ , leftoverHostCash] = redistributeLeftoverTips(hosts, 4, 5, hostTipPool, 0);//no cc for hosts

    // tableHTML += `<h2>Final Tip out</h2>`;
    tableHTML = `<h2>Final Tip out</h2>`;
    tableHTML += `<p>Servers: Cash: $${leftoverServerCash}, CC: $${leftoverServerCC}<br/>`;
    tableHTML += `Barbacks: Cash: $${leftoverBBCash}, CC: $${leftoverBBCC}<br/>`;
    tableHTML += `Hosts: Cash: $${leftoverHostCash}</p>`;
    tableHTML += '<table><thead><tr><th>Name</th><th>Job</th><th>Cash Out</th><th>CC Out</th><th>Total</th></tr></thead><tbody>';

    //final tip out view
    showTipOutInfo(tableHTML)

}

