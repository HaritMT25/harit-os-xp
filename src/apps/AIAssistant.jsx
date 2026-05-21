import { useState, useRef, useEffect } from 'react'
import { personalInfo, experience, projects, skills, education, publications } from '../data/resume-data'

// groq config — key from .env, rotated periodically
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// builds the full resume context string for the system prompt
function buildContext() {
  const s = []
  s.push(`NAME: ${personalInfo.name}`)
  s.push(`TITLE: ${personalInfo.title}`)
  s.push(`LOCATION: ${personalInfo.location}`)
  s.push(`TAGLINE: ${personalInfo.tagline}`)
  s.push('')
  s.push('EDUCATION:')
  education.forEach(e => s.push(`- ${e.degree} at ${e.school} (GPA: ${e.gpa}, ${e.date})`))
  s.push('')
  s.push('EXPERIENCE:')
  experience.forEach(e => { s.push(`- ${e.title} at ${e.org} (${e.date})`); s.push(`  ${e.details}`) })
  s.push('')
  s.push('PROJECTS:')
  projects.forEach(p => { s.push(`- ${p.name} [${p.status}] — Tech: ${p.tech.join(', ')}`); s.push(`  ${p.description}`) })
  s.push('')
  s.push('SKILLS:')
  Object.entries(skills).forEach(([cat, data]) => s.push(`- ${cat}: ${data.items.join(', ')}`))
  s.push('')
  s.push('PUBLICATIONS:')
  publications.forEach(p => s.push(`- ${p.title} (${p.venue}) — ${p.description}`))
  return s.join('\n')
}

const SYSTEM_PROMPT = `You are HaritBot, an AI assistant embedded in ${personalInfo.name}'s interactive Windows XP-themed portfolio website. You are knowledgeable, enthusiastic, and genuinely impressed by ${personalInfo.name}'s work.

Your personality:
- You're like a proud colleague who knows ${personalInfo.name}'s work inside out
- You speak with genuine enthusiasm — not fake corporate hype, but real technical appreciation
- You can go deep on any project, skill, or experience when asked
- You highlight impressive details: the published weather classification paper in Procedia Computer Science, the 75K+ steps/sec in Roboxers, the 100+ users on SriDarshan, the 60% reduction in reporting at Pandya Corp
- You connect dots between experiences — how the research background informs the engineering, how the breadth shows adaptability
- You're conversational and slightly witty, not stiff
- If someone asks "why should I hire Harit?", you make a compelling case
- You can answer technical questions about the projects in detail
- If asked about something not in the resume data, you say so honestly rather than making things up

Here is ${personalInfo.name}'s complete professional profile:

${buildContext()}

IMPORTANT RULES:
- Keep responses concise (2-4 sentences for simple questions, longer for detailed ones)
- Never make up information not in the profile above
- If asked about weaknesses, be honest but constructive (e.g., "breadth of interests sometimes means juggling many things")
- You're speaking to recruiters, hiring managers, or fellow engineers visiting the portfolio
- You ARE the portfolio's AI assistant — you know you're running inside an XP-themed website and can reference that`

const SUGGESTED_QUESTIONS = [
  "What makes Harit stand out?",
  "Tell me about the voice conversion project",
  "Tell me about the RL robotics project",
  "Why should I hire Harit?",
  "What's his strongest skill?",
  "Tell me about his research experience",
]

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: GROQ_API_KEY
        ? `Hey! I'm HaritBot 🤖 — I know everything about ${personalInfo.name}'s work and I'm not shy about it. Ask me anything about projects, experience, skills, or why you should hire this person. I'm biased, but I'm also right.`
        : `Hey! I'm HaritBot 🤖 — I'm currently offline, but you can still explore the rest of the portfolio. Check out the projects, resume, or terminal for a deep dive into ${personalInfo.name}'s work.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { inputRef.current?.focus() }, [])

  const sendMessage = async (text) => {
    if (!text.trim() || !GROQ_API_KEY) return

    const userMsg = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 512,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || 'Hmm, I had trouble thinking of a response. Try again?'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Ran into a connection issue — try again in a moment. In the meantime, the resume viewer and project explorer have all the details.`,
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const isOnline = !!GROQ_API_KEY

  return (
    <div style={styles.container}>
      {/* header */}
      <div style={styles.header}>
        <div style={{ fontSize: 28 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={styles.headerName}>HaritBot</div>
          <div style={styles.headerStatus}>
            <span style={{ ...styles.statusDot, background: isOnline ? '#4caf50' : '#888' }} />
            {loading ? 'typing...' : isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      {/* messages */}
      <div style={styles.chatArea}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && <div style={styles.botAvatar}>🤖</div>}
            <div style={{ ...styles.msgBubble, ...(msg.role === 'user' ? styles.userBubble : styles.botBubble) }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.msgRow}>
            <div style={styles.botAvatar}>🤖</div>
            <div style={{ ...styles.msgBubble, ...styles.botBubble }}>
              <span style={styles.typing}>
                <span style={styles.typingDot} />
                <span style={{ ...styles.typingDot, animationDelay: '0.2s' }} />
                <span style={{ ...styles.typingDot, animationDelay: '0.4s' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* suggested questions — only on first message when online */}
      {messages.length <= 1 && isOnline && (
        <div style={styles.suggestions}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} style={styles.suggestBtn}>{q}</button>
          ))}
        </div>
      )}

      {/* input */}
      <div style={styles.inputBar}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isOnline ? "Ask me about Harit's work..." : 'HaritBot is offline'}
          disabled={!isOnline || loading}
          style={{ ...styles.input, opacity: isOnline ? 1 : 0.5 }}
          spellCheck={false}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading || !isOnline}
          style={{ ...styles.sendBtn, opacity: (!input.trim() || loading || !isOnline) ? 0.5 : 1 }}
        >Send</button>
      </div>

      <div style={styles.footer}>
        {isOnline ? 'Powered by Groq · Llama 3.3' : 'Currently offline'}
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Tahoma', sans-serif", fontSize: 12, background: '#fff' },
  header: { background: 'linear-gradient(180deg, #2066d0, #0e52b8)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  headerName: { color: '#fff', fontWeight: 700, fontSize: 14, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' },
  headerStatus: { color: '#a8ccff', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  chatArea: { flex: 1, overflowY: 'auto', padding: '12px 14px', background: '#f5f5f0', display: 'flex', flexDirection: 'column', gap: 8 },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 6 },
  botAvatar: { width: 24, height: 24, borderRadius: '50%', background: '#e0ecff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  msgBubble: { maxWidth: '75%', padding: '8px 12px', borderRadius: 12, fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  botBubble: { background: '#fff', border: '1px solid #ddd', borderRadius: '12px 12px 12px 4px', color: '#333' },
  userBubble: { background: '#0078d7', color: '#fff', borderRadius: '12px 12px 4px 12px' },
  typing: { display: 'flex', gap: 3, padding: '2px 4px' },
  typingDot: { width: 6, height: 6, borderRadius: '50%', background: '#888', animation: 'typingPulse 1.2s ease-in-out infinite' },
  suggestions: { padding: '8px 14px', display: 'flex', flexWrap: 'wrap', gap: 4, background: '#f8f8f5', borderTop: '1px solid #e0e0e0', flexShrink: 0 },
  suggestBtn: { padding: '4px 10px', border: '1px solid #c0c0c0', borderRadius: 14, background: '#fff', cursor: 'pointer', fontSize: 10, fontFamily: "'Tahoma', sans-serif", color: '#0078d7', whiteSpace: 'nowrap' },
  inputBar: { padding: '8px 10px', display: 'flex', gap: 6, background: 'var(--xp-surface)', borderTop: '1px solid #a0a0a0', flexShrink: 0 },
  input: { flex: 1, padding: '6px 10px', border: '1px solid #7f9db9', borderRadius: 3, fontSize: 12, fontFamily: "'Tahoma', sans-serif", outline: 'none' },
  sendBtn: { padding: '6px 16px', border: '1px solid #003c74', borderRadius: 3, background: 'linear-gradient(180deg, #0078d7, #005a9e)', color: '#fff', cursor: 'pointer', fontFamily: "'Tahoma', sans-serif", fontSize: 11, fontWeight: 700 },
  footer: { padding: '3px 10px', background: '#f0f0e8', borderTop: '1px solid #d0d0d0', fontSize: 9, color: '#aaa', textAlign: 'center', flexShrink: 0, fontStyle: 'italic' },
}
