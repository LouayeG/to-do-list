import { useEffect, useRef, useState } from 'react'

type Todo = {
  id: string
  text: string
  done: boolean
}

const STORAGE_KEY = 'todo-list:v1'

function svgEdit() {
  return (
    <i className="fas fa-edit"></i>
  )
}

function svgDelete() {
  return (
    <i className="fas fa-trash-alt"></i>
  )
}

function svgSave() {
  return (
    <i className="fas fa-check"></i>
  )
}

function svgCancel() {
  return (
    <i className="fas fa-times"></i>
  )
}

function svgDragHandle() {
  return (
    <i className="fas fa-grip-vertical"></i>
  )
}

function svgAdd() {
  return (
    <i className="fas fa-plus  #2186ff" ></i>
  )
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const dragIndex = useRef<number | null>(null)
  const [dragActive, setDragActive] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTodos(JSON.parse(raw))
    } catch (e) {
      console.error('Failed to load todos', e)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch (e) {
      console.error('Failed to save todos', e)
    }
  }, [todos])

  function addTodo(e?: React.FormEvent) {
    e?.preventDefault()
    const v = text.trim()
    if (!v) return
    setTodos(prev => [{ id: String(Date.now()), text: v, done: false }, ...prev])
    setText('')
  }

  function toggle(id: string) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function remove(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  function startEdit(t: Todo) {
    setEditingId(t.id)
    setEditingText(t.text)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingText('')
  }

  function saveEdit(id: string) {
    const v = editingText.trim()
    if (!v) return
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: v } : t))
    setEditingId(null)
    setEditingText('')
  }

  function onDragStart(e: React.DragEvent<HTMLButtonElement>, index: number) {
    dragIndex.current = index
    setDragActive(index)
    setDragOverIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', String(index)) } catch {}
  }

  function onDragEnter(e: React.DragEvent<HTMLLIElement>, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function onDrop(e: React.DragEvent, index: number) {
    e.preventDefault()
    const from = dragIndex.current
    if (from === null || from === index) {
      setDragActive(null)
      setDragOverIndex(null)
      dragIndex.current = null
      return
    }
 
    const list = listRef.current
    const positions: Record<string, number> = {}
    if (list) {
      Array.from(list.children).forEach((child) => {
        const el = child as HTMLElement
        const id = el.dataset.id
        if (id) positions[id] = el.getBoundingClientRect().top
      })
    }

    const newTodos = (() => {
      const copy = [...todos]
      const [moved] = copy.splice(from, 1)
      copy.splice(index, 0, moved)
      return copy
    })()

    setTodos(newTodos)


    requestAnimationFrame(() => {
      if (!list) return
      Array.from(list.children).forEach((child) => {
        const el = child as HTMLElement
        const id = el.dataset.id
        if (!id) return
        const prevTop = positions[id]
        const newTop = el.getBoundingClientRect().top
        const delta = (prevTop ?? newTop) - newTop
        if (delta) {
          el.style.transition = 'none'
          el.style.transform = `translateY(${delta}px)`

          void el.offsetHeight
          el.style.transition = 'transform 200ms ease'
          el.style.transform = ''
          const cleanup = () => {
            el.style.transition = ''
            el.removeEventListener('transitionend', cleanup)
          }
          el.addEventListener('transitionend', cleanup)
        }
      })
    })
    setDragActive(null)
    setDragOverIndex(null)
    dragIndex.current = null
  }

  return (
    <div className="todo">
      <form onSubmit={addTodo} className="todo-form">
        <input
          aria-label="New todo"
          value={text}
          onChange={e => setText((e.target as HTMLInputElement).value)}
          placeholder="Add a new task and press Enter"
        />
        <button type="submit" aria-label="Add task" style={{ backgroundColor: '#2186ff', color: '#fff' }}>
          {svgAdd()}
        </button>
      </form>

      <ul className="todo-list" ref={listRef}>
        {todos.map((t, idx) => (
          <li
            key={t.id}
            data-id={t.id}
            className={`row-${idx % 2 === 0 ? 'even' : 'odd'} ${t.done ? 'done' : ''} ${dragActive === idx ? 'dragging' : ''} ${dragOverIndex === idx ? 'drag-over' : ''}`}
            onDragEnter={e => onDragEnter(e, idx)}
            onDragOver={onDragOver}
            onDrop={e => onDrop(e, idx)}
          >
            {editingId === t.id ? (
              <div className="edit-row">
                <input
                  className="edit-input"
                  value={editingText}
                  onChange={e => setEditingText((e.target as HTMLInputElement).value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(t.id); if (e.key === 'Escape') cancelEdit() }}
                />
                <div className="actions">
                  <button className="icon-btn save" onClick={() => saveEdit(t.id)} aria-label="Save">{svgSave()}</button>
                  <button className="icon-btn cancel" onClick={cancelEdit} aria-label="Cancel">{svgCancel()}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="left">
                  <button
                    className="drag-handle"
                    aria-label="Drag to reorder"
                    draggable
                    onDragStart={e => onDragStart(e as React.DragEvent<HTMLButtonElement>, idx)}
                  >{svgDragHandle()}</button>
                  <label>
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggle(t.id)}
                  />
                  <span className="text">{t.text}</span>
                  </label>
                </div>
                <div className="actions">
                  <button className="icon-btn edit" onClick={() => startEdit(t)} aria-label={`Edit ${t.text}`}>{svgEdit()}</button>
                  <button className="icon-btn delete" onClick={() => remove(t.id)} aria-label={`Delete ${t.text}`}>{svgDelete()}</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <p className="help">{todos.length} task(s)</p>
    </div>
  )
}
