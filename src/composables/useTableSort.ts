import { ref } from 'vue'
import type { SortDirection, SortState } from '@/types'

export function useTableSort<T extends string>() {
  const sort = ref<SortState<T>>({
    key: null,
    direction: 'asc',
  })

  function toggleSort(key: T): void {
    if (sort.value.key === key) {
      sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sort.value = { key, direction: 'asc' }
    }
  }

  function sortItems<Item>(
    items: Item[],
    getValue: (item: Item, key: T) => string | number | null,
  ): Item[] {
    const { key, direction } = sort.value
    if (!key) return items

    const multiplier = direction === 'asc' ? 1 : -1

    return [...items].sort((left, right) => {
      const leftValue = getValue(left, key as T)
      const rightValue = getValue(right, key as T)

      if (leftValue === rightValue) return 0
      if (leftValue === null) return 1
      if (rightValue === null) return -1

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return (leftValue - rightValue) * multiplier
      }

      return String(leftValue).localeCompare(String(rightValue), 'uk') * multiplier
    })
  }

  function getSortIndicator(key: T): SortDirection | null {
    return sort.value.key === key ? sort.value.direction : null
  }

  return {
    sort,
    toggleSort,
    sortItems,
    getSortIndicator,
  }
}
