

class Employee {
    constructor(name, shift, hours) {
        this.name = name.toTitleCase();
        this.shift = shift; // AM or PM
        this.hours = parseFloat(hours);
    }

    getVars() {
        return [this.name, this.shift, this.hours];
    }
}

class Server extends Employee {
    constructor(name, shift, hours, sales, tax, ccTips, cashTips) {
        super(name, shift, hours);
        this.sales = parseFloat(sales);
        this.tax = parseFloat(tax);
        this.ccTips = parseFloat(ccTips);
        this.cashTips = parseFloat(cashTips);
    }
    getVars() {
        return [...super.getVars(), this.sales, this.tax, this.ccTips, this.cashTips];
    }
}

class Bartender extends Employee {
    constructor(name, shift, hours, sales, tax, ccTips, cashTips) {
        super(name, shift, hours);
        this.sales = parseFloat(sales);
        this.tax = parseFloat(tax);
        this.ccTips = parseFloat(ccTips);
        this.cashTips = parseFloat(cashTips);
    }
    getVars() {
        return [...super.getVars(), this.sales, this.tax, this.ccTips, this.cashTips];
    }
}

class Barback extends Employee {
    constructor(name, shift, hours, percent = 4) {
        super(name, shift, hours);
        this.percent = parseFloat(percent);
    }
}

class Host extends Employee {
    constructor(name, shift, hours, percent = 1) {
        super(name, shift, hours);
        this.percent = parseFloat(percent);
    }
}
