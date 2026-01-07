//test link
//http://127.0.0.1:5500/?employees=[["mike","Pm","B",5,1000,80,100,100],["mike1","Pm","B",5,1000,80,100,100],["mike2","Pm","B",5,1000,80,100,100]]
//http://127.0.0.1:5500/?employees=[["mike","Pm","S",5,1000,80,100,100],["mike1","Pm","S",5,1000,80,100,100],["mike2","Pm","S",5,1000,80,100,100],["ryan","Pm","b",5],["max","Pm","b",5],["max1","Pm","b",5]]
//http://127.0.0.1:5500/?employees=[["mike","Pm","S",5,1000,80,100,100],["mike1","Pm","S",5,1000,80,100,100],["mike2","Pm","S",5,1000,80,100,100],["ryan","Pm","b",5],["max","Pm","b",5],["max1","Pm","b",5],["host1","Pm","h",3],["host2","Pm","h",4]]




let employees = [];
let jobTypes = { 'S': 'Server', 'B': 'Bartender', 'b': 'Barback', 'h': 'Host' }; // Server, Bartender, barback, Host


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
    return Number(match ? match[0] : num);
}

function sortEmployeeList() {
    employees.sort((a, b) => {
        const jobOrder = { 'S': 1, 'B': 2, 'b': 3, 'h': 4 };
        return jobOrder[a[2]] - jobOrder[b[2]];
    });
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
        let percent = job == 'b' ? 4 : 1;
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

    let bbCashPool = 0;
    let bbCCPool = 0;
    let hostTipPool = 0;
    let serverCCTipPool = 0;
    let serverCashTipPool = 0;
    let tableHTML = '';

    for (let emp of employees) {
        // Reset any previous calculations
        if (emp[2] === 'S' || emp[2] === 'B') {
            emp.splice(8); // Remove any calculated fields beyond index 7
        } else {
            emp.splice(4); // Remove any calculated fields beyond index 3
        }
    }

    for (let emp of employees.filter(emp => emp[2] === 'S' || emp[2] === 'B')) {
        let netSales = (emp[4] - emp[5] - emp[6]).toFixed(2); // grossSales - salesTax - ccTips, rounded to 2 decimals
        let bbCut = Math.trunc((netSales * 0.04) * 100) / 100; // 4% for barbacks
        let cash = Math.floor(bbCut / 2);
        let cc = truncTo2(bbCut - cash);
        emp.push(netSales);//emp[8]
        emp.push(cash);//emp[9] cash
        emp.push(cc);//emp[10] cc
        emp.push(emp[6] - cc);//emp[11] server cc after barback cut
        emp.push(emp[7] - cash);//emp[12] server cash after barback cut
        serverCCTipPool += emp[11];
        serverCashTipPool += emp[12];
        bbCashPool += cash;
        bbCCPool += cc;
    }

    for (let emp of employees.filter(emp => emp[2] === 'S')) {
        let HostCut = emp[8] * 0.01; // 1% for hosts
        emp[12] -= HostCut; // deduct host cut from server cash after barback cut
        emp.push(HostCut.toFixed(0));//emp[13] host cut
        hostTipPool += parseFloat(HostCut.toFixed(0));
    }
    sortEmployeeList()
    tableHTML = '<table><thead><tr><th>Name</th><th>Shift</th><th>Job</th><th>BB Cash</th><th>BB CC</th><th>Host Cash</th></tr></thead><tbody>';
    for (let emp of employees.filter(emp => emp[2] === 'S' || emp[2] === 'B')) {
        //emp[0] Name
        //emp[1] Shift
        //emp[2] Job
        //emp[3] Hours
        //emp[4] Sales
        //emp[5] Tax
        //emp[6] CC Tips
        //emp[7] Cash Tips
        //emp[8] Net Sales
        //emp[9] Barback Cut cash
        //emp[10] Barback Cut cc
        //emp[11] Server CC after barback cut
        //emp[12] Server Cash after barback cut
        //emp[13] Host Cut (servers only)
        // Further calculations can be added here

        tableHTML += `<tr><td>${emp[0]}</td><td>${emp[1]}</td><td>${emp[2]}</td><td>$${emp[9] || 'N/A'}</td><td>$${emp[10] || 'N/A'}</td><td>$${emp[13] || 'N/A'}</td></tr>`;
    }
    tableHTML += `<tr><td>Totals:</td><td></td><td></td><td>$${bbCashPool}</td><td>$${bbCCPool}</td><td>$${Math.round(hostTipPool)}</td></tr></tbody></table>`;
    document.getElementById('TipsCutList').innerHTML = tableHTML;

    let bbHours = 0;
    for (let emp of employees.filter(emp => emp[2] === 'b')) { bbHours += emp[3]; }
    let bbTipHourCash = bbCashPool / bbHours;
    let bbTipHourCC = bbCCPool / bbHours;

    for (let emp of employees.filter(emp => emp[2] === 'b')) {
        let bbEarningsCash = truncTo2(emp[3] * bbTipHourCash);
        let bbEarningsCC = truncTo2(emp[3] * bbTipHourCC);
        emp.push(bbEarningsCash);//emp[4]
        emp.push(bbEarningsCC);//emp[5]
    }

    let tempBBCash = 0;
    let tempBBCC = 0;
    for (let emp of employees.filter(emp => emp[2] === 'b')) {
        tempBBCash += parseFloat(emp[4] || 0);
        tempBBCC += parseFloat(emp[5] || 0);
    }
    let leftoverBBCash = bbCashPool - tempBBCash;
    let leftoverBBCC = bbCCPool - tempBBCC;

    if (leftoverBBCash > 0) {
        const barbacks = employees
            .filter(emp => emp[2] === 'b')
            .map((emp) => ({ emp, index: employees.indexOf(emp) }));
        const maxBBCash = barbacks.reduce((max, curr) =>
            curr.emp[3] > max.emp[3] ? curr : max
        );
        employees[maxBBCash.index][4] = (Number(employees[maxBBCash.index][4]) + leftoverBBCash).toFixed(2);
    }

    if (leftoverBBCC > 0) {
        const barbacks = employees
            .filter(emp => emp[2] === 'b')
            .map((emp) => ({ emp, index: employees.indexOf(emp) }));
        const maxBBCC = barbacks.reduce((max, curr) =>
            curr.emp[3] > max.emp[3] ? curr : max
        );
        employees[maxBBCC.index][5] = (Number(employees[maxBBCC.index][5]) + leftoverBBCC).toFixed(2);
    }

    let serverHours = 0;
    for (let emp of employees.filter(emp => emp[2] === 'S' || emp[2] === 'B')) { serverHours += emp[3]; }
    let serverTipHourCC = serverCCTipPool / serverHours;
    let serverTipHourCash = serverCashTipPool / serverHours;

    for (let emp of employees.filter(emp => emp[2] === 'S' || emp[2] === 'B')) {
        let serverEarningsCC = truncTo2(emp[3] * serverTipHourCC);
        let serverEarningsCash = truncTo2(emp[3] * serverTipHourCash);
        emp.push(serverEarningsCC);//emp[14]
        emp.push(serverEarningsCash);//emp[15]
    }

    let tempServerCC = 0;
    let tempServerCash = 0;
    for (let emp of employees.filter(emp => emp[2] === 'S' || emp[2] === 'B')) {
        tempServerCC += parseFloat(emp[14] || 0);
        tempServerCash += parseFloat(emp[15] || 0);
    }
    let leftoverServerCC = serverCCTipPool - tempServerCC;
    let leftoverServerCash = serverCashTipPool - tempServerCash;

    if (leftoverServerCC > 0) {
        const servers = employees
            .filter(emp => emp[2] === 'S' || emp[2] === 'B')
            .map((emp) => ({ emp, index: employees.indexOf(emp) }));
        const maxServerCC = servers.reduce((max, curr) =>
            curr.emp[3] > max.emp[3] ? curr : max
        );
        employees[maxServerCC.index][14] = (Number(employees[maxServerCC.index][14]) + leftoverServerCC).toFixed(2);
    }

    if (leftoverServerCash > 0) {
        const servers = employees
            .filter(emp => emp[2] === 'S' || emp[2] === 'B')
            .map((emp) => ({ emp, index: employees.indexOf(emp) }));
        const maxServerCash = servers.reduce((max, curr) =>
            curr.emp[3] > max.emp[3] ? curr : max
        );
        employees[maxServerCash.index][15] = (Number(employees[maxServerCash.index][15]) + leftoverServerCash).toFixed(2);
    }


    let hostHours = 0;
    for (let emp of employees.filter(emp => emp[2] === 'h')) { hostHours += emp[3]; }
    let hostTipHour = hostTipPool / hostHours;

    for (let emp of employees.filter(emp => emp[2] === 'h')) {
        let hostEarnings = truncTo2(emp[3] * hostTipHour, 0);
        emp.push(hostEarnings.toFixed(2));//emp[4]
    }

    let tempHosttips = 0;
    for (let emp of employees.filter(emp => emp[2] === 'h')) {
        tempHosttips += parseFloat(emp[4]);
    }
    let leftoverHostDollars = hostTipPool - tempHosttips;

    if (leftoverHostDollars > 0) {
        const hosts = employees
            .filter(emp => emp[2] === 'h')
            .map((emp) => ({ emp, index: employees.indexOf(emp) }));
        const maxHost = hosts.reduce((max, curr) =>
            curr.emp[3] > max.emp[3] ? curr : max
        );

        employees[maxHost.index][4] = (Number(employees[maxHost.index][4]) + leftoverHostDollars).toFixed(2);
    }





    tableHTML = '<h2>Final Tip Out</h2><br/>' + '<table><thead><tr><th>Name</th><th>Job</th><th>CC Out</th><th>Cash Out</th><th>Total</th></tr></thead><tbody>';

    //tipout calc / cc cash split
    sortEmployeeList()
    for (let emp of employees.filter(emp => emp[2] === 'b' || emp[2] === 'h')) {
        let cash = emp[4];
        let cc = emp[5];
        let totalTips = ((cc || 0) * 100 + (cash * 100)) / 100;//strupid floating point errors


        tableHTML += `<tr><td>${emp[0]}</td><td>${emp[2]}</td><td>$${cc || 0}</td><td>$${cash}</td><td>$${totalTips}</td></tr>`;
    }
    for (let emp of employees.filter(emp => emp[2] === 'S' || emp[2] === 'B')) {
        let cash = emp[15];
        let cc = emp[14];
        let totalTips = ((cc || 0) * 100 + (cash * 100)) / 100;//strupid floating point errors
        tableHTML += `<tr><td>${emp[0]}</td><td>${emp[2]}</td><td>$${cc || 0}</td><td>$${cash}</td><td>$${totalTips}</td></tr>`;
    }

    tableHTML += `</tbody></table>`;
    document.getElementById('TipsOutList').innerHTML = tableHTML;


}

