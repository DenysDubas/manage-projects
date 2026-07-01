import { onMounted, onUnmounted, ref } from 'vue'

export function useColumnResize(
  storageKey: string,
  defaultWidths: Record<string, number>,
) {
  const columnWidths = ref<Record<string, number>>({ ...defaultWidths })

  onMounted(() => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as Record<string, number>
      columnWidths.value = { ...defaultWidths, ...parsed }
    } catch {
      columnWidths.value = { ...defaultWidths }
    }
  })

  function persistWidths(): void {
    localStorage.setItem(storageKey, JSON.stringify(columnWidths.value))
  }

  function startResize(columnKey: string, startX: number): void {
    const startWidth = columnWidths.value[columnKey] ?? defaultWidths[columnKey] ?? 120

    function onMouseMove(event: MouseEvent): void {
      const delta = event.clientX - startX
      columnWidths.value[columnKey] = Math.max(80, startWidth + delta)
    }

    function onMouseUp(): void {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      persistWidths()
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  onUnmounted(() => {
    persistWidths()
  })

  return {
    columnWidths,
    startResize,
  }
}
