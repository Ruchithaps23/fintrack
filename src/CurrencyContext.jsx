import { createContext, useContext, useState } from 'react'

const CURRENCIES = {
  USD: { symbol: '$',  label: 'USD — US Dollar',      rate: 1 },
  INR: { symbol: '₹', label: 'INR — Indian Rupee',    rate: 83.5 },
  EUR: { symbol: '€', label: 'EUR — Euro',            rate: 0.92 },
  GBP: { symbol: '£', label: 'GBP — British Pound',   rate: 0.79 },
  AED: { symbol: 'د.إ', label: 'AED — UAE Dirham',    rate: 3.67 },
  SGD: { symbol: 'S$', label: 'SGD — Singapore Dollar', rate: 1.34 },
}

const CurrencyContext = createContext()

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('fintrack_currency') || 'USD'
  )

  function changeCurrency(code) {
    setCurrency(code)
    localStorage.setItem('fintrack_currency', code)
  }

  // Convert a USD amount to selected currency
  function convert(amount) {
    const rate = CURRENCIES[currency]?.rate || 1
    return amount * rate
  }

  // Format a number with currency symbol
  function format(amount) {
    const converted = convert(amount)
    const symbol    = CURRENCIES[currency]?.symbol || '$'

    // Use locale formatting for large numbers like INR
    if (currency === 'INR') {
      return `${symbol}${converted.toLocaleString('en-IN', {
        maximumFractionDigits: 0
      })}`
    }

    return `${symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <CurrencyContext.Provider value={{
      currency,
      changeCurrency,
      convert,
      format,
      currencies: CURRENCIES,
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}