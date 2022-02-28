// LASH: 251021 - PL clculator update: introducing additional rate of 6.99, rate range dropdown added to the Borrowing calculator, use rateRange to populate rates dropdown (credit rating)

// PL interest rate update
var interestRates = {
  fixRate: { from: "6.99", to: "10.99" },
  compRate: { from: "7.13", to: "11.14" },
  defaultRate: { fix: "8.99", comp: "9.13" },
  rateRange: [
    { 'description': 'Outstanding', rate: 6.99, comp: 7.13 }, 
    { 'description': 'Brilliant', rate: 7.99, comp: 8.13 }, 
    { 'description': 'Super', rate: 8.99, comp: 9.13 }, 
    { 'description': 'Solid', rate: 9.99, comp: 10.13 }, 
    { 'description': 'Satisfactory', rate: 10.99, comp: 11.14 }, 
  ],
};

$(function () {
  $(".fixRateFrom").text(interestRates.fixRate.from);
  $(".fixRateTo").text(interestRates.fixRate.to);
  $(".compRateFrom").text(interestRates.compRate.from);
  $(".compRateTo").text(interestRates.compRate.to);
  $(".defaultFixRate").text(interestRates.defaultRate.fix);
  $(".defaultCompRate").text(interestRates.defaultRate.comp);
});
