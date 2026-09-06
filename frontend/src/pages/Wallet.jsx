import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CreditCard, Wallet as WalletIcon, TrendingUp, History } from 'lucide-react';
import walletAPI from '../api/wallet';
import authStore from '../store/authStore';

const Wallet = () => {
  const { t } = useTranslation();
  const { user } = authStore();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions()
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { id: 'monthly', name: 'Monthly', price: 4.99, period: '1 Month', features: ['All 30 Tools', 'Ad-Free', 'Full VPN Access', 'Priority Support'] },
    { id: 'yearly', name: 'Yearly', price: 49.99, period: '12 Months', features: ['All 30 Tools', 'Ad-Free', 'Full VPN Access', 'Priority Support', '30% Savings'], popular: true }
  ];

  const handlePayment = async (plan) => {
    try {
      const response = await walletAPI.initiatePayment({
        type: 'subscription',
        plan: plan.id,
        amount: plan.price,
        method: 'stripe'
      });
      // Redirect to payment gateway
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">💼 Wallet & Billing</h1>
        <p className="text-dark-400">Manage your subscription and payment methods</p>
      </div>

      {/* Current Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        <div className="card-dark p-6 border-cyber-500/50 bg-gradient-to-br from-cyber-600/20 to-dark-800">
          <div className="flex items-center gap-3 mb-4">
            <WalletIcon className="text-neon-green" size={32} />
            <div>
              <p className="text-dark-400 text-sm">Current Balance</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card-dark p-6 border-neon-purple/50 bg-gradient-to-br from-neon-purple/20 to-dark-800">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-neon-pink" size={32} />
            <div>
              <p className="text-dark-400 text-sm">Current Subscription</p>
              <p className="text-3xl font-bold uppercase">{user?.subscription}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subscription Plans */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.05 }}
              className={`card-dark p-8 relative ${
                plan.popular
                  ? 'border-2 border-cyber-500 shadow-glow'
                  : 'border border-dark-600'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-cyber-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-dark-400 mb-4">{plan.period}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-dark-400">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-cyber-500"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePayment(plan)}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.popular
                    ? 'bg-cyber-600 hover:bg-cyber-700 text-white'
                    : 'bg-dark-700 hover:bg-dark-600 text-text-primary'
                }`}
              >
                Subscribe Now
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-6">
          <History size={24} />
          <h2 className="text-2xl font-bold">Transaction History</h2>
        </div>
        <div className="card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-300">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-300">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-300">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-dark-400">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-dark-700 hover:bg-dark-700/50 transition">
                      <td className="px-6 py-4 text-sm">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">{txn.type}</td>
                      <td className="px-6 py-4 text-sm font-semibold">${txn.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            txn.status === 'completed'
                              ? 'bg-green-900/30 text-green-400'
                              : txn.status === 'pending'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {txn.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Wallet;
