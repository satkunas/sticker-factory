import { ref, computed } from 'vue'

export interface KeyboardState {
  pressedKeys: Set<string>
  isEscapePressed: boolean
}

// Private state
const _pressedKeys = ref<Set<string>>(new Set())
const _isListening = ref(false)
const _listeners = ref<Array<{ key: string; callback: () => void }>>([])

// Keyboard event handlers
const handleKeyDown = (event: KeyboardEvent) => {
  _pressedKeys.value.add(event.key)

  // Trigger specific key listeners
  _listeners.value.forEach(listener => {
    if (listener.key === event.key) {
      listener.callback()
    }
  })
}

const handleKeyUp = (event: KeyboardEvent) => {
  _pressedKeys.value.delete(event.key)
}

// Start/stop global keyboard listening
const startListening = () => {
  if (_isListening.value) return

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
  _isListening.value = true
}

const stopListening = () => {
  if (!_isListening.value) return

  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
  _isListening.value = false
  _pressedKeys.value.clear()
}

// Keyboard store interface
export const useKeyboardStore = () => {

  // Getters
  const pressedKeys = computed(() => _pressedKeys.value)
  const isEscapePressed = computed(() => _pressedKeys.value.has('Escape'))
  const isListening = computed(() => _isListening.value)

  // Check if a specific key is pressed
  const isKeyPressed = (key: string): boolean => {
    return _pressedKeys.value.has(key)
  }

  // Register a callback for a specific key
  const onKeyPress = (key: string, callback: () => void) => {
    const listener = { key, callback }
    _listeners.value.push(listener)

    // Return unregister function
    return () => {
      const index = _listeners.value.indexOf(listener)
      if (index > -1) {
        _listeners.value.splice(index, 1)
      }
    }
  }

  // Convenience method for escape key
  const onEscape = (callback: () => void) => {
    return onKeyPress('Escape', callback)
  }

  // Initialize keyboard listening (call this in your main app)
  const initialize = () => {
    startListening()

    // Cleanup on app unmount
    return () => {
      stopListening()
    }
  }

  // Manual control over listening
  const start = startListening
  const stop = stopListening

  return {
    // State getters
    pressedKeys,
    isEscapePressed,
    isListening,

    // Methods
    isKeyPressed,
    onKeyPress,
    onEscape,
    initialize,
    start,
    stop
  }
}

// Auto-initialize keyboard store as a singleton
let keyboardStore: ReturnType<typeof useKeyboardStore> | null = null

export const getKeyboardStore = () => {
  if (!keyboardStore) {
    keyboardStore = useKeyboardStore()
    keyboardStore.initialize()
  }
  return keyboardStore
}