import { describe, expect, it } from 'vitest'
import { useTableSort } from '@/composables/useTableSort'

type Column = 'name' | 'id'

describe('useTableSort', () => {
  it('sorts items ascending by default', () => {
    const { toggleSort, sortItems } = useTableSort<Column>()
    toggleSort('name')

    const items = [
      { name: 'Charlie', id: 3 },
      { name: 'Alice', id: 1 },
      { name: 'Bob', id: 2 },
    ]
    const sorted = sortItems(items, (item, key) => item[key])

    expect(sorted.map((item) => item.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('toggles sort direction', () => {
    const { toggleSort, sortItems } = useTableSort<Column>()
    toggleSort('id')
    toggleSort('id')

    const items = [
      { id: 1, name: 'A' },
      { id: 3, name: 'C' },
      { id: 2, name: 'B' },
    ]
    const sorted = sortItems(items, (item, key) => item[key])

    expect(sorted.map((item) => item.id)).toEqual([3, 2, 1])
  })

  it('returns original list when sort key is not set', () => {
    const { sortItems } = useTableSort<Column>()
    const items = [
      { id: 2, name: 'B' },
      { id: 1, name: 'A' },
    ]
    const sorted = sortItems(items, (item, key) => item[key])
    expect(sorted).toEqual(items)
  })
})
