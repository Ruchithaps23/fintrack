import { useState, useRef, useEffect } from 'react'
import { useCurrency } from '../CurrencyContext'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SUGGESTIONS = [
  '📊 Summarize my spending this month',
  '💡 Give me 3 tips to save more money',
  '🍔 How much did I spend on food?',
  '📈 What is my savings rate?',
  '💸 What is my biggest expense category?',
  '🔌 How much did I spend on bills?',
]

function AIAssistant({ transactions, totalIncome, totalExpenses, savings, byCategory }) {
  const { format, convert, currency } = useCurrency()

  const [apiKey, setApiKey]     = useState(() => localStorage.getItem('groq_key') || '')
  const [keySaved, setKeySaved] = useState(() => !!localStorage.getItem('groq_key'))
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `👋 Hi! I'm your personal finance AI assistant.\n\nI can see all your transaction data and I'm ready to help you understand your spending, find savings opportunities, and answer any finance questions.\n\nTry asking me something below!`,
    }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function saveKey() {
    if (!apiKey.trim()) return
    localStorage.setItem('groq_key', apiKey.trim())
    setKeySaved(true)
  }

  function buildFinanceContext() {
    const categoryBreakdown = Object.entries(byCategory)
      .map(([cat, amt]) => `  - ${cat}: ${format(amt)}`)
      .join('\n')

    const recentTx = transactions.slice(0, 10)
      .map(tx => `  - ${tx.date} | ${tx.description} | ${tx.type} | ${format(tx.amount)} | ${tx.category}`)
      .join('\n')

    return `
You are a helpful personal finance assistant. Here is the user's financial data:

SUMMARY:
- Currency: ${currency}
- Total Income:   ${format(totalIncome)}
- Total Expenses: ${format(totalExpenses)}
- Net Savings:    ${format(savings)}
- Savings Rate:   ${totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0}%
- Total Transactions: ${transactions.length}

SPENDING BY CATEGORY:
${categoryBreakdown || '  No expense data yet.'}

RECENT TRANSACTIONS (last 10):
${recentTx || '  No transactions yet.'}

Answer the user's question based on this data. Be friendly, concise, and helpful.
Use emojis to make responses engaging. If the user asks for tips, give specific advice based on their actual data.
Always use the ${currency} currency symbol when mentioning amounts.
    `.trim()
  }

  async function sendMessage(text) {
    const userText = text || input.trim()
    if (!userText || loading) return
    if (!apiKey) return alert('Please enter your Groq API key first.')

    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: buildFinanceContext() },
            { role: 'user', content: userText },
          ],
        })
      })

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error.message || 'API error')
      }

      const aiText = data.choices?.[0]?.message?.content
        || 'Sorry, I could not generate a response. Please try again.'

      setMessages(prev => [...prev, { role: 'ai', text: aiText }])

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `❌ Error: ${err.message}. Please check your API key in Settings.`,
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={styles.container}>

      {!keySaved && (
        <div style={styles.keyBanner}>
          <p style={styles.keyTitle}>🔑 Enter your Groq API Key to activate the AI</p>
          <div style={styles.keyRow}>
            <input
              style={styles.keyInput}
              type="password"
              placeholder="Paste your Groq API key here (gsk_...)..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
            <button style={styles.saveBtn} onClick={saveKey}>
              Save Key
            </button>
          </div>
          <p style={styles.keyNote}>
            🔒 Your key is saved only in your browser. Never shared anywhere.{' '}
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: '#7c6ff7' }}>
              Get your free Groq key →
            </a>
          </p>
        </div>
      )}

      <div style={styles.chatBox}>
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.msgRow,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'ai' && <div style={styles.avatar}>🤖</div>}
              <div style={{
                ...styles.bubble,
                ...(msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi),
              }}>
                {msg.text.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
              {msg.role === 'user' && <div style={styles.avatar}>👤</div>}
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.msgRow, justifyContent: 'flex-start' }}>
              <div style={styles.avatar}>🤖</div>
              <div style={{ ...styles.bubble, ...styles.bubbleAi }}>
                <div style={styles.typing}>
                  <span style={{ ...styles.dot, animationDelay: '0s' }} />
                  <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
                  <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div style={styles.suggestions}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} style={styles.suggBtn} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={styles.inputBar}>
          <textarea
            style={styles.input}
            placeholder="Ask anything about your finances… (Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            style={{
              ...styles.sendBtn,
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

const dotAnim = `
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-6px); }
  }
`

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 130px)',
    gap: '16px',
  },
  keyBanner: {
    background: '#fff',
    border: '1px solid #e0e0f0',
    borderRadius: '14px',
    padding: '20px',
  },
  keyTitle: {
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  keyRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '8px',
  },
  keyInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #e0e0f0',
    fontSize: '14px',
    outline: 'none',
    background: '#fafafa',
  },
  saveBtn: {
    background: '#7c6ff7',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  keyNote: {
    fontSize: '12px',
    color: '#6b6b8a',
  },
  chatBox: {
    flex: 1,
    background: '#fff',
    borderRadius: '14px',
    border: '1px solid #e0e0f0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
  },
  avatar: {
    fontSize: '22px',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '14px',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  bubbleAi: {
    background: '#f5f5ff',
    border: '1px solid #e0e0f0',
    color: '#1a1a2e',
    borderBottomLeftRadius: '4px',
  },
  bubbleUser: {
    background: '#7c6ff7',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  typing: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    padding: '4px 0',
  },
  dot: {
    width: '7px',
    height: '7px',
    background: '#7c6ff7',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'bounce 1.2s infinite',
  },
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '0 20px 16px',
  },
  suggBtn: {
    background: '#f5f5ff',
    border: '1px solid #e0e0f0',
    borderRadius: '20px',
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#1a1a2e',
    transition: 'all 0.2s',
  },
  inputBar: {
    display: 'flex',
    gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid #e0e0f0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid #e0e0f0',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
  },
  sendBtn: {
    background: '#7c6ff7',
    color: '#fff',
    border: 'none',
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
}

const styleTag = document.createElement('style')
styleTag.innerHTML = dotAnim
document.head.appendChild(styleTag)

export default AIAssistant