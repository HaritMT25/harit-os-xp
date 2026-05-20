import { useState, useRef, useEffect } from 'react'
import { personalInfo, projects, skills, experience, education } from '../data/resume-data'

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
    const themes = {
      blue: {
        '--xp-titlebar-active': 'linear-gradient(180deg, #0997ff 0%, #0053ee 8%, #0050ee 18%, #196be7 30%, #0058e6 50%, #0048d0 70%, #0040c8 85%, #0058e6 100%)',
        '--xp-taskbar': 'linear-gradient(180deg, #1f5fc7 0%, #2463ca 2%, #245ec4 10%, #1850b5 50%, #2260c5 95%, #2968cd 100%)',
        '--xp-start-bg': 'linear-gradient(180deg, #5db643 0%, #3d9a29 25%, #318e1c 50%, #267c11 85%, #24790f 100%)',
      },
      silver: {
        '--xp-titlebar-active': 'linear-gradient(180deg, #b8c7d8 0%, #8ea4bc 10%, #7a94b0 30%, #6d87a3 50%, #7a94b0 70%, #8ea4bc 90%, #a0b4c8 100%)',
        '--xp-taskbar': 'linear-gradient(180deg, #93a5b8 0%, #8498ac 10%, #768ca0 50%, #8498ac 90%, #93a5b8 100%)',
        '--xp-start-bg': 'linear-gradient(180deg, #5888b0 0%, #4878a0 25%, #3a6890 50%, #305880 85%, #284870 100%)',
      },
      olive: {
        '--xp-titlebar-active': 'linear-gradient(180deg, #a8b87a 0%, #8a9e5c 10%, #7a8e4c 30%, #6a7e3c 50%, #7a8e4c 70%, #8a9e5c 90%, #98ae68 100%)',
        '--xp-taskbar': 'linear-gradient(180deg, #8a9860 0%, #7a8850 10%, #6a7840 50%, #7a8850 90%, #8a9860 100%)',
        '--xp-start-bg': 'linear-gradient(180deg, #7a9040 0%, #6a8030 25%, #5a7020 50%, #4a6010 85%, #3a5000 100%)',
      },
    }
    const name = (args || '').toLowerCase().trim()
    if (!name || !themes[name]) {
      return [
        'Usage: theme [blue|silver|olive]',
        '',
        '  blue   - Classic Luna (default)',
        '  silver  - Luna Silver',
        '  olive   - Luna Olive Green',
        '',
        `Current theme: ${document.documentElement.getAttribute('data-theme') || 'blue'}`,
      ]
    }
    const vars = themes[name]
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val)
    })
    document.documentElement.setAttribute('data-theme', name)
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
