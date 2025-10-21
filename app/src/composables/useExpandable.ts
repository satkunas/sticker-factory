import { inject, computed, ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Interface for dropdown manager (provided via inject)
 */
interface DropdownManager {
  isExpanded(id: string): boolean
  toggle(id: string): void
  close(id: string): void
}

/**
 * Composable for managing expandable/dropdown state across components
 *
 * Provides unified dropdown management with escape key support and legacy fallback
 *
 * @param instanceId - Unique ID for this expandable instance (supports string, Ref, or function)
 * @param legacyInjectionKey - Key for legacy provide/inject fallback (e.g., 'expandedFontSelectors')
 * @param enableEscapeKey - Whether to enable escape key to close (default: true)
 * @returns Object with isExpanded state, toggle function, and containerRef
 */
export function useExpandable(
  instanceId: Ref<string | undefined> | (() => string | undefined) | string | undefined,
  legacyInjectionKey: string,
  enableEscapeKey = true
) {
  // Unified dropdown management
  const dropdownManager = inject<DropdownManager | undefined>('dropdownManager')

  // Legacy fallback for backward compatibility
  const expandedInstances = inject<Ref<Set<string>>>(
    legacyInjectionKey,
    ref(new Set<string>())
  )

  // Component container ref for scrolling
  const containerRef = ref<HTMLElement>()

  // Get instance ID (support string, ref, or function)
  const getId = () => {
    if (typeof instanceId === 'function') return instanceId()
    if (typeof instanceId === 'string') return instanceId
    if (instanceId && 'value' in instanceId) return instanceId.value
    return undefined
  }

  // Computed expanded state
  const isExpanded = computed(() => {
    const id = getId()
    if (!id) return false

    if (dropdownManager) {
      return dropdownManager.isExpanded(id)
    }
    // Legacy fallback
    return expandedInstances.value.has(id)
  })

  // Toggle expansion
  const toggle = () => {
    const id = getId()
    if (!id) return

    if (dropdownManager) {
      dropdownManager.toggle(id)
    } else {
      // Legacy fallback
      if (isExpanded.value) {
        expandedInstances.value.delete(id)
      } else {
        // Close all other instances first
        expandedInstances.value.clear()
        // Open this instance
        expandedInstances.value.add(id)
      }
    }
  }

  // Close method (for explicit closing)
  const close = () => {
    const id = getId()
    if (!id) return

    if (dropdownManager) {
      dropdownManager.close(id)
    } else {
      // Legacy fallback
      expandedInstances.value.delete(id)
    }
  }

  // Escape key handler
  const handleKeydown = enableEscapeKey
    ? (event: KeyboardEvent) => {
        const id = getId()
        if (event.key === 'Escape' && isExpanded.value && id) {
          close()
        }
      }
    : null

  // Mount event listeners
  onMounted(() => {
    if (handleKeydown) {
      document.addEventListener('keydown', handleKeydown)
    }
  })

  onUnmounted(() => {
    if (handleKeydown) {
      document.removeEventListener('keydown', handleKeydown)
    }
    // Cleanup on unmount
    close()
  })

  return {
    isExpanded,
    toggle,
    close,
    containerRef
  }
}
