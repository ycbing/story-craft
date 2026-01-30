import { create } from 'zustand'

// 定义单页的数据结构
export interface PageData {
  id: number; // 页码 (1, 2, 3...)
  aiText: string;
  aiImageUrl: string | null;
  canvasJson: any; // 存放 Fabric.js 的 JSON 数据
  isGenerated: boolean; // 标记这一页是否已经生成过图片
}

// 定义整个仓库的数据结构
interface BookState {
  title: string;
  pages: PageData[];
  currentPageIndex: number; // 当前正在编辑哪一页 (0-based)
  
  // 动作 (Actions)
  setTitle: (title: string) => void;
  setPages: (pages: PageData[]) => void;
  setCurrentPageIndex: (index: number) => void;
  
  // 更新某一页的数据 (例如: 生成图片后填入 URL，或者保存画布状态)
  updatePage: (pageIndex: number, updates: Partial<PageData>) => void;
}

export const useBookStore = create<BookState>((set) => ({
  title: '未命名绘本',
  pages: [], // 初始为空
  currentPageIndex: 0,

  setTitle: (title) => set({ title }),
  setPages: (pages) => set({ pages }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
  
  updatePage: (pageIndex, updates) => 
    set((state) => ({
      pages: state.pages.map((page, index) => 
        index === pageIndex ? { ...page, ...updates } : page
      ),
    })),
}))