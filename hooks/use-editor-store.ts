// hooks/use-editor-store.ts
import { create } from 'zustand'
import { Canvas } from 'fabric' // v6

interface EditorState {
  canvas: Canvas | null
  activeTool: 'select' | 'text' | 'image'
  setCanvas: (canvas: Canvas) => void
  setActiveTool: (tool: 'select' | 'text' | 'image') => void
}

export const useEditorStore = create<EditorState>((set) => ({
  canvas: null,
  activeTool: 'select',
  setCanvas: (canvas) => set({ canvas }),
  setActiveTool: (tool) => set({ activeTool: tool }),
}))