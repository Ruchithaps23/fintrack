import { useState, useEffect } from 'react'

// Default sample data so your app isn't empty on first load
const sampleData = [
  { id: 1, date: '2025-04-01', description: 'Salary', amount: 3500, type: 'income', category: 'income' },
  { id: 2, date: '2025-04-02', description: 'Rent Payment', amount: 1200, type: 'expense', category: 'bills' },
  { id: 3, date: '2025-04-03', description: 'Uber Ride', amount: 18.50, type: 'expense', category: 'travel' },
  { id: 4, date: '2025-04-04', description: 'McDonald\'s', amount: 12.30, type: 'expense', category: 'food' },
  { id: 5, date: '2025-04-05', description: 'Netflix', amount: 15.99, type: 'expense', category: 'entertainment' },
  { id: 6, date: '2025-04-06', description: 'H&M Jacket', amount: 59.99, type: 'expense', category: 'clothing' },
  { id: 7, date: '2025-04-07', description: 'Pharmacy', amount: 22.00, type: 'expense', category: 'health' },
  { id: 8, date: '2025-04-08', description: 'Amazon Order', amount: 45.00, type: 'expense', category: 'shopping' },
  { id: 9, date: '2025-04-09', description: 'Electricity Bill', amount: 80.00, type: 'expense', category: 'bills' },
  { id: 10, date: '2025-04-10', description: 'Pizza Hut', amount: 24.00, type: 'expense', category: 'food' },
]

function useTransactions() {
  // Load from localStorage or use sample data
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('fintrack_transactions')
    return saved ? JSON.parse(saved) : sampleData
  })

  // Auto-save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions))
  }, [transactions])

  // ADD a new transaction
  function addTransaction(tx) {
    const newTx = { ...tx, id: Date.now() }
    setTransactions(prev => [newTx, ...prev])
  }

  // DELETE a transaction
  function deleteTransaction(id) {
    setTransactions(prev => prev.filter(tx => tx.id !== id))
  }

  // CLEAR all transactions
  function clearAll() {
    setTransactions([])
  }

  // SUMMARY calculations
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const savings = totalIncome - totalExpenses

  // SPENDING by category
  const byCategory = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount
      return acc
    }, {})

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    clearAll,
    totalIncome,
    totalExpenses,
    savings,
    byCategory,
  }
}

export default useTransactions