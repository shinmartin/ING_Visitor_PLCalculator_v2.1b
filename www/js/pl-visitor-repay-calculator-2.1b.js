/*
 ** ING Personal Loan Calculators - Repayment
 ** Author: LASH
 ** Version 2.1b - 6.99 rate only
 ** Last updated: 28 Feb 2022
 */

// v1.3
var maxBorrow = 60000; // 30000
var loanAmountThreshhold = 30000;
var repaymentLoanTermErrorMessageObj = $("#RepaymentLoanTermDropdownError");
var monthlyRepaymentAmountObj = $("#MonthlyRepayment");
var monthlyRepaymentErrorMessageObj = $("#MonthlyRepaymentErrorMessage");
var showLoanTermErrorMessage1 = $("#termError1");
var showLoanTermErrorMessage2 = $("#termError2");
var repaymentLoanAmountErrorMessageObj = $("#RepaymentCalcLoanAmountError");

// v2.1PROMO
var _FIXEDRATE = 6.99;
var _FIXEDRATE_COMP = 7.13;

$(".dropdown").on("click", ".dropdown-option", function () {
  var selected = $(this).text();
  var value = $(this).data("value");
  $(this).closest(".dropdown").find(".dropdown-toggle").text(selected);
  $(this).closest(".dropdown-menu").data("value", value).trigger("change");
});

$(".currency-validate").on("input change", function (e) {
  var amount = getSanitised($(e.target).val(), 5);
  $(e.target).val("$" + amount.toString().replace(/\d(?=(\d{3})+$)/g, "$&,"));
});

$(".term-validate").on("input change", function (e) {
  var loan_term = getSanitised($(e.target).val(), 1);
  $(e.target).val(loan_term.toString().replace(/\d(?=(\d{3})+$)/g, "years,"));
});

$(".number-validate").on("input", function (e) {
  var numDigits = $(this).data("digits");
  var amount = getSanitised($(e.target).val(), numDigits);
  $(e.target).val(amount.toString().replace(/\d(?=(\d{3})+$)/g, "$&,"));
});

function getSanitised(input, digits) {
  var sanitised = input.replace(/[^\d]/g, "").substring(0, digits);
  // allows any number incl. 0 for input, catch NaN with ""
  // returns "", "0" or Number(sanitised)
  return (parseInt(sanitised) === 0 ? "0" : parseInt(sanitised)) || "";
}

function checkNumberLen(input, len) {
  var sanitised = input.replace(/[^\d]/g, "").substring(0, len);
  return sanitised;
}

function getCompRateByRate(data, code) {
  return data.filter(
      function(data){ return data.rate == code }
  );
}

$(".repay-input").on("click", ".change-value", function (e) {
  e.preventDefault();
  var fieldDetails = $(e.target).data("field").split("/");
  var field = $("." + fieldDetails[0] + "-field");
  var fieldMinMax = field.data("minmax").split("-");
  var existingValue = getSanitised(field.val(), 5);
  var updatedValue = existingValue + parseInt(fieldDetails[1], 10);

  if (updatedValue > fieldMinMax[1]) {
    updatedValue = fieldMinMax[1];
  } else if (updatedValue < fieldMinMax[0]) {
    updatedValue = fieldMinMax[0];
  }

  field.val(updatedValue).trigger("change");
});

// Repayment Calculator
//
(function repaymentsCalculator() {
  /* // v2.1PROMO - does not need this
  // v1.4 - populate rate dropdown - referencing rates from pl-interest-rates.js
  if( typeof(interestRates) != 'undefined' && typeof(interestRates.rateRange) != 'undefined' ) {
    var rateDropdown = $('#rating-value');
    rateDropdown.empty(); // clear out first
    $.each( interestRates.rateRange, function(key, value) {
      var rate = interestRates.rateRange[key];

      rateDropdown.append('<li><a href="javascript:;" class="dropdown-option" data-value="'+rate['rate']+'">'+rate['description']+' - '+rate['rate']+'% p.a.</a></li>');
    });
  }
  else {
    console.log('Missing PL interest rates!');
  }
  // v.1.4 end
  */

  // $(".rating-dropdown .dropdown-menu li a")[0].click(); // v2.1PROMO
  $(".frequency-dropdown .dropdown-menu li a")[1].click();
  // $(".change-value").click();

  if (!$("#repayments-calc-new").length) return;

  var loanAmount = 5000;
  var loanTerm = 2; // 5;
  var repayFrequency;
  var creditRating = _FIXEDRATE;
  var repaymentSection = $(".repay-amount");

  $("#repayments-calc-new")
    .on("click input change", function (e) {
      loanAmount = parseInt(getSanitised($(".amount-field").val(), 6)) || 0;
      loanTerm = parseInt(getSanitised($(".term-field").val(), 1)) || 0;
      // creditRating = $("#rating-value").data("value") || 0; // v2.1PROMO
      repayFrequency = parseInt($("#frequency-value").data("value")) || 0;

      // display comp rate
      var compRate = '7.13'; // v2.1PROMO
      // if(creditRating !== 0) {
      //   var obj = getCompRateByRate(interestRates.rateRange, creditRating);
      //   var compRate = obj[0].comp;
      //   $('#rating-comp-value').find('.rate').text(compRate);
      //   $('#rating-comp-value').removeClass('hide');
      // }
      // else {
      //   $('#rating-comp-value').find('.rate').text(compRate);
      //   $('#rating-comp-value').addClass('hide');
      // }

      $(".term-field").data(
        "minmax",
        loanAmount > loanAmountThreshhold ? "2-7" : "2-5"
      );
      // if (loanAmount <= loanAmountThreshhold && loanTerm > 5) {
      //   $(".term-field").val("5 years");
      // }
      var amountMinMax = $(".amount-field").data("minmax").split("-");
      var termMinMax = $(".term-field").data("minmax").split("-");
      if (loanAmount < amountMinMax[0] || loanAmount > amountMinMax[1]) {
        repaymentSection.text("0");
        $("#amountError").show();
      } else {
        $("#amountError").hide();
      }

      if (loanTerm < termMinMax[0] || loanTerm > termMinMax[1]) {
        repaymentSection.text("0");
        $("#maxTerm").text(termMinMax[1]);
        $("#termError").show();
      } else {
        $("#termError").hide();
      }
      if (
        loanAmount >= amountMinMax[0] &&
        loanAmount <= amountMinMax[1] &&
        loanTerm >= termMinMax[0] &&
        loanTerm <= termMinMax[1]
      ) {
        $("#amountError").hide();
        $("#termError").hide();

        repaymentSection.text(
          Math.round(
            PMT(
              creditRating / 100 / repayFrequency,
              loanTerm * repayFrequency,
              loanAmount
            )
          ) * -1
        );
      }
      var urlSuffix =
        $(".repay-amount").text() !== "0"
          ? "&amount=" + loanAmount + "&term=" + loanTerm
          : "";
      $("[id^=apply-]").each(function () {
        $(this).attr(
          "href",
          $(this).attr("href").split("&amount")[0] + urlSuffix
        );
      });
    })
    .trigger("click");
})();

function PMT(ir, np, pv, fv, type) {
  /*
   * ir   - interest rate per month
   * np   - number of periods (months)
   * pv   - present value
   * fv   - future value
   * type - when the payments are due:
   *        0: end of the period, e.g. end of month (default)
   *        1: beginning of period
   */
  var pmt, pvif;

  fv || (fv = 0);
  type || (type = 0);

  if (ir === 0) return -(pv + fv) / np;

  pvif = Math.pow(1 + ir, np);
  pmt = (-ir * pv * (pvif + fv)) / (pvif - 1);

  if (type === 1) pmt /= 1 + ir;

  return pmt;
}

// function validateAmountAndTerm(amount, term) {
//   console.log("inside validate");
//   if (amount < 5000 || amount > maxBorrow) {
//     repaymentLoanAmountErrorMessageObj.removeClass("hide");
//     showLoanTermErrorMessage1.addClass("hide");
//     showLoanTermErrorMessage2.addClass("hide");
//   } else {
//     //valid amount
//     repaymentLoanAmountErrorMessageObj.addClass("hide");
//     //check for valid loan term
//     console.log("valid loan amount", amount, term);
//     if (amount > loanAmountThreshhold && (term !== 6 || term !== 7)) {
//       showLoanTermErrorMessage1.removeClass("hide");
//       console.log(amount, term, "term bt 6 and 7");
//     } else if (amount < loanAmountThreshhold) {
//       if (term < 2 || term > 5) {
//         showLoanTermErrorMessage2.removeClass("hide");
//         console.log(amount, term, "term bt 2 and 5");
//       } else {
//         showLoanTermErrorMessage2.addClass("hide");
//         showLoanTermErrorMessage1.addClass("hide");
//         console.log(amount, term, "else of term bt 2 and 5");
//       }
//     } else {
//       showLoanTermErrorMessage1.addClass("hide");
//       showLoanTermErrorMessage2.addClass("hide");
//       console.log("");
//     }
//   }
// }

// function roundTo(n, digits) {
//   var negative = false;
//   if (digits === undefined) {
//     digits = 0;
//   }
//   if (n < 0) {
//     negative = true;
//     n = n * -1;
//   }
//   var multiplicator = Math.pow(10, digits);
//   n = parseFloat((n * multiplicator).toFixed(11));
//   n = (Math.round(n) / multiplicator).toFixed(digits);
//   if (negative) {
//     n = (n * -1).toFixed(digits);
//   }
//   return n;
// }

// if (loanTerm == 0) {
//   monthValue = "-"; //0;
//   fortnightValue = "-"; //0;
// } else if (loanAmount >= 5000 && loanAmount <= maxBorrow) {
//   // validate laon term
//   if (loanAmount <= loanAmountThreshhold && loanTerm > 5) {
//     // error!
//     // showLoanTermErrorMessage1.removeClass("hide");
//     // showLoanTermErrorMessage2.addClass("hide");
//     console.log(
//       "ERROR: 6 and 7 year repayment terms are only available for loans over $30,000"
//     );

//     monthValue = "-"; //0;
//     fortnightValue = "-"; //0;
//   } else {
//     // calculate repayment
//     monthValue =
//       Math.round(PMT(7.99 / 100 / 12, loanTerm * 12, loanAmount)) * -1;
//     fortnightValue =
//       Math.round(PMT(8.99 / 100 / 26, loanTerm * 26, loanAmount)) * -1;
//   }
// } else {
//   monthValue = "-"; //0;
//   fortnightValue = "-"; //0;
// }

// validate loan amount
// validateAmountAndTerm(loanAmount, loanTerm);
// validate for the loan term

// } else {
//   // VALID AMOUNT!!

//   // hide amount error message
//   repaymentLoanAmountErrorMessageObj.addClass("hide");

//   // check for valid loan term
//   if(loanTerm < 2 && loanTerm > 7){
//      showLoanTermErrorMessage1.removeClass('hide')
//   }
//   if (loanAmount > loanAmountThreshhold) {
//       if(loanTerm !== 6 || loanTerm !== 7){
//         showLoanTermErrorMessage.removeClass('hide')
//       }

//     // 7 years
//     //drawLoanTermDropdown("RepaymentLoanTermDropdown", 7);

//     //if( showLoanTermErrorMessage > 1) {
//     repaymentLoanTermErrorMessageObj.removeClass("in");
//     showLoanTermErrorMessage2 = 0;
//     //}
//   } else {
//     // 5 years
//     drawLoanTermDropdown("RepaymentLoanTermDropdown", 5);

//     if (loanTerm > 5) {
//       resetLoanTermDropdown("RepaymentLoanTermDropdown", 5);
//       loanTerm = 5;

//       repaymentLoanTermErrorMessageObj.addClass("in");
//       showLoanTermErrorMessage2 = 1;
//     } else {
//       if (showLoanTermErrorMessage2 > 1) {
//         repaymentLoanTermErrorMessageObj.removeClass("in");
//         showLoanTermErrorMessage2 = 0;
//       } else {
//         showLoanTermErrorMessage2++;
//       }
//     }
//   }

//   console.log("Loan Term Error Num: " + showLoanTermErrorMessage2);

//   // reset dropdown - resetLoanTermDropdown('RepaymentLoanTermDropdown');
//   // enable loan term dropdown
//  // $("#drop3").removeClass("disabled");
// }

// calculate

// show results
