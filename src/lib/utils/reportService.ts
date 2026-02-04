// Calculation engine for Admin Insights
export const calculatePortfolioMetrics = (loans: any[]) => {
  return {
    totalPrincipalDisbursed: loans.reduce((sum, l) => sum + (l.loan_amount || 0), 0),
    totalOutstandingBalance: loans.reduce((sum, l) => sum + (l.metrics?.total_outstanding || 0), 0),
    par30: loans.filter(l => (l.metrics?.days_in_arrears || 0) > 30).length, // Portfolio at Risk > 30 days
    collectedThisMonth: loans.reduce((sum, l) => {
      const monthlyPayments = l.payment_history?.filter((p: any) => 
        new Date(p.date).getMonth() === new Date().getMonth()
      ) || [];
      return sum + monthlyPayments.reduce((s: number, p: any) => s + p.amount, 0);
    }, 0)
  };
};