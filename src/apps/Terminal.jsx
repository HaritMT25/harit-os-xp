import { useState, useRef, useEffect } from 'react'
import { personalInfo, projects, skills, experience, education } from '../data/resume-data'
import { THEME_NAMES, getCurrentTheme, applyTheme } from '../data/themes'

const COMMANDS = {
  help: () => [
    'Available commands:',
    '  whoami       - Who am I?',
    '  about        - About me',
    '  experience   - Work experience',
    '  skills       - List my skills',
    '  projects     - List my projects',
    '  education    - My education',
    '  contact      - How to reach me',
    '  status       - Current status',
    '  neofetch     - System info',
    '  clear        - Clear screen',
    '  echo [text]  - Echo text',
    '  date         - Current date',
    '  fortune      - Random fortune',
    '  ls           - List directory',
    '  cat [file]   - Read a file',
    '  sudo         - Nice try',
    '  theme [name] - Change XP theme',
    '  help         - This help',
  ],
  whoami: () => [`${personalInfo.name} — ${personalInfo.title}`],
  about: () => [
    `Name:     ${personalInfo.name}`,
    `Title:    ${personalInfo.title}`,
    `Location: ${personalInfo.location}`,
    `Focus:    RL Robotics, Voice/Audio ML, Systems Programming`,
    '',
    `${education[0].degree} @ ${education[0].school.split(' —')[0]} (GPA: ${education[0].gpa})`,
    `${education[1].degree} @ ${education[1].school} (GPA: ${education[1].gpa})`,
    '',
    `"${personalInfo.tagline}"`,
  ],
  skills: () => {
    const lines = ['Technical Skills:', '']
    Object.entries(skills).forEach(([cat, data]) => {
      lines.push(`  [${cat}]`)
      lines.push(`    ${data.items.join(', ')}`)
      lines.push('')
    })
    return lines
  },
  projects: () => {
    const lines = ['Projects:', '']
    projects.forEach(p => {
      lines.push(`  ${p.icon} ${p.name} [${p.status}]`)
      lines.push(`    ${p.tech.join(', ')}`)
      lines.push('')
    })
    return lines
  },
  education: () => {
    const lines = ['Education:', '']
    education.forEach(edu => {
      lines.push(`  ${edu.degree}`)
      lines.push(`    ${edu.school}`)
      lines.push(`    GPA: ${edu.gpa} · ${edu.date}`)
      lines.push('')
    })
    return lines
  },
  contact: () => [
    'Contact Information:',
    '',
    `  Email:    ${personalInfo.email}`,
    `  GitHub:   ${personalInfo.github}`,
    `  LinkedIn: ${personalInfo.linkedin}`,
    `  Location: ${personalInfo.location}`,
    '',
    '  Status: Open to SDE, ML & Co-op opportunities',
  ],
  status: () => [
    'Current Status:',
    '  🟢 Open to opportunities',
    `  📚 ${experience[0].title} @ ${experience[0].org}`,
    `  🎤 Building: ${projects.find(p => p.name.includes('Voice'))?.name || 'projects'}`,
    `  🤖 Building: ${projects.find(p => p.name.includes('Roboxers'))?.name || 'projects'}`,
    '  💪 Grinding: NeetCode 150 / LeetCode',
  ],
  date: () => [new Date().toString()],
  fortune: () => {
    const fortunes = [
      '"The best way to predict the future is to invent it." — Alan Kay',
      '"First, solve the problem. Then, write the code." — John Johnson',
      '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
      '"Simplicity is prerequisite for reliability." — Edsger Dijkstra',
      '"Make it work, make it right, make it fast." — Kent Beck',
      '"Talk is cheap. Show me the code." — Linus Torvalds',
      '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
    ]
    return [fortunes[Math.floor(Math.random() * fortunes.length)]]
  },
  ls: () => [
    'about.txt    contact.txt   education.txt   experience.txt',
    'projects/    skills.txt    resume.pdf',
    'README.md    .gitconfig    .bashrc         notes.txt',
  ],
  experience: () => {
    const lines = ['Work Experience:', '']
    experience.forEach(exp => {
      lines.push(`  ${exp.title}`)
      lines.push(`    ${exp.org} · ${exp.date}`)
      lines.push('')
    })
    return lines
  },
  sudo: () => ['Nice try. You don\'t have root access to this portfolio. 🔒'],
  theme: (args) => {
    const name = (args || '').toLowerCase().trim()
    if (!name || !THEME_NAMES.includes(name)) {
      return [
        'Usage: theme [blue|silver|olive]',
        '',
        '  blue   - Classic Luna (default)',
        '  silver  - Luna Silver',
        '  olive   - Luna Olive Green',
        '',
        `Current theme: ${getCurrentTheme()}`,
      ]
    }
    applyTheme(name)
    return [`Theme changed to ${name}. ✨`]
  },
  neofetch: () => [
    `         ██████████           ${personalInfo.name.toLowerCase()}@${personalInfo.location.split(',')[0].toLowerCase().replace(' ', '')}`,
    '       ████████████████       -------------------',
    '     ██████      ██████       OS:     HaritOS XP Professional',
    `    █████  ██████  █████      Host:   ${education[0].school.split(' —')[0]}`,
    '   █████  ████████  █████     Kernel: Neural v4.2.0',
    '   █████  ████████  █████     Shell:  bash 5.2.0',
    '   █████  ████████  █████     CPU:    Infinite Curiosity Engine',
    '    █████  ██████  █████      Memory: 16GB (Learning More Daily)',
    '     ██████      ██████       Disk:   HaritOS-SSD 2TB / 42% used',
    '       ████████████████       Theme:  Luna Blue [XP]',
    `         ██████████           Uptime: Since ${education[0].date.replace('Expected ', '')}`,
  ],
}

export default function Terminal() {
  const [history, setHistory] = useState([
    { type: 'output', lines: [
      'HaritOS XP [Version 5.1.2600]',
      '(C) Copyright 2023-2026 Harit Corp.',
      '',
      'Type "help" for available commands.',
      '',
    ]},
  ])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const executeCommand = (cmd) => {
    const trimmed = cmd.trim()
    const parts = trimmed.split(' ')
    const command = parts[0].toLowerCase()
    const args = parts.slice(1).join(' ')

    setCommandHistory(prev => [...prev, trimmed])
    setHistoryIndex(-1)

    const newEntries = [
      { type: 'input', text: trimmed },
    ]

    if (command === 'clear') {
      setHistory([])
      return
    }

    if (command === 'echo') {
      newEntries.push({ type: 'output', lines: [args || ''] })
    } else if (command === 'cat') {
      const file = args.toLowerCase().replace('.txt', '')
      if (COMMANDS[file]) {
        newEntries.push({ type: 'output', lines: COMMANDS[file]() })
      } else {
        newEntries.push({ type: 'output', lines: [`cat: ${args}: No such file or directory`] })
      }
    } else if (COMMANDS[command]) {
      newEntries.push({ type: 'output', lines: COMMANDS[command](args) })
    } else if (trimmed === '') {
      // empty
    } else {
      newEntries.push({ type: 'output', lines: [
        `'${command}' is not recognized as an internal or external command.`,
        'Type "help" for available commands.',
      ]})
    }

    setHistory(prev => [...prev, ...newEntries])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const newIndex = historyIndex + 1
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    }
  }

  return (
    <div
      style={styles.container}
      onClick={() => inputRef.current?.focus()}
    >
      <div style={styles.scrollArea}>
        {history.map((entry, i) => (
          <div key={i}>
            {entry.type === 'input' ? (
              <div style={styles.inputLine}>
                <span style={styles.prompt}>C:\Users\Harit&gt;</span>
                <span style={styles.commandText}>{entry.text}</span>
              </div>
            ) : (
              entry.lines.map((line, j) => (
                <div key={j} style={styles.outputLine}>{line || '\u00A0'}</div>
              ))
            )}
          </div>
        ))}

        {/* Active prompt */}
        <div style={styles.inputLine}>
          <span style={styles.prompt}>C:\Users\Harit&gt;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.inputField}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100%',
    background: '#0c0c0c',
    fontFamily: "'Consolas', 'Courier New', monospace",
    fontSize: 13,
    cursor: 'text',
    overflow: 'hidden',
  },
  scrollArea: {
    height: '100%',
    overflowY: 'auto',
    padding: '8px 10px',
  },
  inputLine: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'pre',
    minHeight: 18,
  },
  prompt: {
    color: '#c0c0c0',
    marginRight: 6,
    flexShrink: 0,
  },
  commandText: {
    color: '#f0f0f0',
  },
  outputLine: {
    color: '#cccccc',
    whiteSpace: 'pre',
    minHeight: 18,
    lineHeight: '18px',
  },
  inputField: {
    background: 'transparent',
    border: 'none',
    color: '#f0f0f0',
    fontFamily: "'Consolas', 'Courier New', monospace",
    fontSize: 13,
    outline: 'none',
    flex: 1,
    padding: 0,
    margin: 0,
    caretColor: '#ccc',
  },
}
