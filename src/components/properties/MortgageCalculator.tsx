import { useState, useEffect } from 'react';

interface MortgageCalculatorProps {
  price: number;
}

export function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5); // Common in Ecuador
  const [years, setYears] = useState(20);

  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    const principal = price - (price * (downPaymentPercent / 100));
    const r = interestRate / 100 / 12;
    const n = years * 12;
    
    if (r === 0) {
      setMonthlyPayment(principal / n);
      return;
    }
    
    const payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setMonthlyPayment(payment);
  }, [price, downPaymentPercent, interestRate, years]);

  return (
    <div className="bg-kliyvo-gray border border-white/5 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-display font-bold text-white mb-4">Mortgage Calculator</h3>
      
      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2 text-sm">
            <label className="text-gray-400 font-medium">Down Payment ({downPaymentPercent}%)</label>
            <span className="text-white font-bold">${((price * downPaymentPercent) / 100).toLocaleString()}</span>
          </div>
          <input 
            type="range" min="0" max="100" step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full h-2 bg-kliyvo-black rounded-lg appearance-none cursor-pointer accent-electric-lime"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 text-sm">
            <label className="text-gray-400 font-medium">Interest Rate (APR)</label>
            <span className="text-white font-bold">{interestRate}%</span>
          </div>
          <input 
            type="range" min="1" max="15" step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-kliyvo-black rounded-lg appearance-none cursor-pointer accent-electric-lime"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 text-sm">
            <label className="text-gray-400 font-medium">Loan Term</label>
            <span className="text-white font-bold">{years} Years</span>
          </div>
          <input 
            type="range" min="5" max="30" step="5"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full h-2 bg-kliyvo-black rounded-lg appearance-none cursor-pointer accent-electric-lime"
          />
        </div>

        <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-end">
          <div className="text-gray-400 text-sm font-medium">Est. Monthly Payment</div>
          <div className="text-3xl font-display font-bold text-electric-lime">
            ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-base text-gray-500">/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
