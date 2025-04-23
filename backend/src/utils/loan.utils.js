/**
 * Calculate EMI for a flat rate loan
 * @param {Number} principal - Loan amount
 * @param {Number} interestRate - Annual interest rate (%)
 * @param {Number} tenureMonths - Loan tenure in months
 * @returns {Object} Loan calculation details
 */
const calculateFlatLoan = (principal, interestRate, tenureMonths) => {
  // In flat rate loans, interest is calculated on the full principal for the entire duration
  const totalInterest = (principal * interestRate * tenureMonths) / 1200; // convert years to months and percentage to decimal
  const totalAmount = principal + totalInterest;
  const emiAmount = totalAmount / tenureMonths;
  const principalPerMonth = principal / tenureMonths;
  const interestPerMonth = totalInterest / tenureMonths;

  return {
    emiAmount: parseFloat(emiAmount.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    principalPerMonth: parseFloat(principalPerMonth.toFixed(2)),
    interestPerMonth: parseFloat(interestPerMonth.toFixed(2)),
  };
};

/**
 * Calculate EMI for a diminishing rate loan
 * @param {Number} principal - Loan amount
 * @param {Number} interestRate - Annual interest rate (%)
 * @param {Number} tenureMonths - Loan tenure in months
 * @returns {Object} Loan calculation details
 */
const calculateDiminishingLoan = (principal, interestRate, tenureMonths) => {
  // Convert annual interest rate to monthly rate and decimal form
  const monthlyRate = interestRate / 12 / 100;

  // Calculate EMI using formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const emiAmount = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                   (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  let outstandingPrincipal = principal;
  let totalInterest = 0;
  const amortizationSchedule = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const interestForMonth = outstandingPrincipal * monthlyRate;
    const principalForMonth = emiAmount - interestForMonth;

    totalInterest += interestForMonth;
    outstandingPrincipal -= principalForMonth;

    amortizationSchedule.push({
      installmentNumber: i,
      emiAmount: parseFloat(emiAmount.toFixed(2)),
      principalAmount: parseFloat(principalForMonth.toFixed(2)),
      interestAmount: parseFloat(interestForMonth.toFixed(2)),
      remainingPrincipal: parseFloat((outstandingPrincipal > 0 ? outstandingPrincipal : 0).toFixed(2)),
    });
  }

  return {
    emiAmount: parseFloat(emiAmount.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalAmount: parseFloat((principal + totalInterest).toFixed(2)),
    amortizationSchedule,
  };
};

/**
 * Generate EMI schedule for a loan
 * @param {String} loanId - Loan ID
 * @param {Number} principal - Loan amount
 * @param {Number} interestRate - Annual interest rate (%)
 * @param {Number} tenureMonths - Loan tenure in months
 * @param {String} calculationType - Loan calculation type ('flat' or 'diminishing')
 * @param {Date} disburseDate - Loan disburse date
 * @returns {Array} EMI schedule
 */
const generateEmiSchedule = (loanId, principal, interestRate, tenureMonths, calculationType, disburseDate) => {
  const schedule = [];
  const disburseDateTime = new Date(disburseDate);
  
  if (calculationType === 'flat') {
    const { emiAmount, principalPerMonth, interestPerMonth } = calculateFlatLoan(principal, interestRate, tenureMonths);
    let remainingPrincipal = principal;
    
    for (let i = 1; i <= tenureMonths; i++) {
      // Calculate due date (same day next month)
      const dueDate = new Date(disburseDateTime);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      remainingPrincipal -= principalPerMonth;
      
      schedule.push({
        loan_id: loanId,
        installment_number: i,
        due_date: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        emi_amount: emiAmount,
        principal_amount: principalPerMonth,
        interest_amount: interestPerMonth,
        remaining_principal: i === tenureMonths ? 0 : parseFloat(remainingPrincipal.toFixed(2)),
        is_paid: false,
      });
    }
  } else if (calculationType === 'diminishing') {
    const { amortizationSchedule } = calculateDiminishingLoan(principal, interestRate, tenureMonths);
    
    for (let i = 0; i < amortizationSchedule.length; i++) {
      const installment = amortizationSchedule[i];
      
      // Calculate due date (same day next month)
      const dueDate = new Date(disburseDateTime);
      dueDate.setMonth(dueDate.getMonth() + installment.installmentNumber);
      
      schedule.push({
        loan_id: loanId,
        installment_number: installment.installmentNumber,
        due_date: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        emi_amount: installment.emiAmount,
        principal_amount: installment.principalAmount,
        interest_amount: installment.interestAmount,
        remaining_principal: installment.remainingPrincipal,
        is_paid: false,
      });
    }
  }
  
  return schedule;
};

module.exports = {
  calculateFlatLoan,
  calculateDiminishingLoan,
  generateEmiSchedule,
};