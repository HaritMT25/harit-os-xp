import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.icon}>⚠️</div>
          <div style={styles.title}>This program has encountered an error</div>
          <div style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            style={styles.button}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    padding: 24,
    fontFamily: "'Tahoma', sans-serif",
    textAlign: 'center',
  },
  icon: { fontSize: 36, marginBottom: 12 },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#003399',
    marginBottom: 8,
  },
  message: {
    fontSize: 11,
    color: '#666',
    marginBottom: 16,
    maxWidth: 280,
    lineHeight: 1.5,
  },
  button: {
    padding: '5px 20px',
    border: '1px solid #003c74',
    borderRadius: 3,
    background: 'linear-gradient(180deg, #fff, #ece9d8)',
    cursor: 'pointer',
    fontFamily: "'Tahoma', sans-serif",
    fontSize: 11,
  },
}
