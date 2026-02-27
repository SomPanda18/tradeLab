exports.calculateRisk = (portfolio) => {
  // Logic: High concentration in one sector or volatile assets (Crypto) increases score
  let score = 50; // Base score
  
  const cryptoExposure = portfolio.filter(a => a.category === 'Crypto').length;
  const techExposure = portfolio.filter(a => a.ticker === 'NVDA' || a.ticker === 'MSFT').length;

  score += (cryptoExposure * 10); // +10 risk for every crypto asset
  score += (techExposure * 5);    // +5 risk for tech concentration
  
  return Math.min(score, 100); // Cap at 100
};