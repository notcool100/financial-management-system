const { db } = require('../config/db.config');
const logger = require('../config/logger.config');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Get dashboard chart data
 * @route GET /api/dashboard/chart
 * @access Private (Admin/Staff)
 */
const getDashboardChart = async (req, res, next) => {
  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();
    
    // Get last 6 months data
    const months = [];
    const labels = [];
    
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      months.push({ month, year });
      
      // Create month label (e.g., "Jan", "Feb")
      const date = new Date(year, month - 1, 1);
      labels.push(date.toLocaleString('default', { month: 'short' }));
    }
    
    // Get loan disbursements by month
    const loanDisbursements = await Promise.all(
      months.map(async ({ month, year }) => {
        const result = await db.oneOrNone(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM loans
          WHERE 
            EXTRACT(MONTH FROM disburse_date) = $1 
            AND EXTRACT(YEAR FROM disburse_date) = $2
            AND status != 'pending'
        `, [month, year]);
        
        return parseFloat(result.total);
      })
    );
    
    // Get loan repayments by month
    const loanRepayments = await Promise.all(
      months.map(async ({ month, year }) => {
        const result = await db.oneOrNone(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM loan_transactions
          WHERE 
            EXTRACT(MONTH FROM payment_date) = $1 
            AND EXTRACT(YEAR FROM payment_date) = $2
        `, [month, year]);
        
        return parseFloat(result.total);
      })
    );
    
    // Get active loans count
    const activeLoansCount = await db.one(`
      SELECT COUNT(*) as count
      FROM loans
      WHERE status = 'active'
    `);
    
    // Get total outstanding amount
    const outstandingAmount = await db.one(`
      SELECT COALESCE(SUM(remaining_amount), 0) as total
      FROM loans
      WHERE status = 'active'
    `);
    
    // Get total disbursed amount this month
    const disbursedThisMonth = await db.one(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM loans
      WHERE 
        EXTRACT(MONTH FROM disburse_date) = $1 
        AND EXTRACT(YEAR FROM disburse_date) = $2
        AND status != 'pending'
    `, [currentMonth, currentYear]);
    
    // Get total repaid amount this month
    const repaidThisMonth = await db.one(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM loan_transactions
      WHERE 
        EXTRACT(MONTH FROM payment_date) = $1 
        AND EXTRACT(YEAR FROM payment_date) = $2
    `, [currentMonth, currentYear]);
    
    res.status(200).json({
      success: true,
      data: {
        labels,
        datasets: [
          {
            label: 'Loan Disbursements',
            data: loanDisbursements,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
            label: 'Loan Repayments',
            data: loanRepayments,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
        ],
        stats: {
          activeLoans: parseInt(activeLoansCount.count),
          outstandingAmount: parseFloat(outstandingAmount.total),
          disbursedThisMonth: parseFloat(disbursedThisMonth.total),
          repaidThisMonth: parseFloat(repaidThisMonth.total),
        }
      },
    });
  } catch (error) {
    logger.error('Error getting dashboard chart data:', error);
    next(error);
  }
};

/**
 * Get recent users
 * @route GET /api/users/recent
 * @access Private (Admin/Staff)
 */
const getRecentUsers = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    const users = await db.any(`
      SELECT id, name, email, phone, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);
    
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error('Error getting recent users:', error);
    next(error);
  }
};

module.exports = {
  getDashboardChart,
  getRecentUsers,
};