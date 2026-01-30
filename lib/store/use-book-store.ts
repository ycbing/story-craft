import { create } from 'zustand'

// 定义单页的数据结构
export interface PageData {
  id: number; // 页码 (1, 2, 3...)
  aiText: string;
  aiImageUrl: string | null;
  canvasJson: Record<string, unknown> | null; // 存放 Fabric.js 的 JSON 数据
  isGenerated: boolean; // 标记这一页是否已经生成过图片
  outlineSummary?: string; // 大纲中的原始摘要
}

// 故事配置
export interface StoryConfig {
  userInput: string;
  stylePreset: string; // 预设风格key
  stylePrompt: string; // 完整风格提示词
  mainCharacterDesc: string;
  targetAudience: '3-6' | '6-9' | '9-12';
}

// 大纲数据
export interface OutlineData {
  title: string;
  pages: Array<{ pageNumber: number; summary: string }>;
}

// 工作流状态
export type WorkflowStep = 'config' | 'confirm' | 'editor' | 'complete';
export type PhaseStep = 'text' | 'image' | 'canvas' | 'preview';

export interface WorkflowState {
  currentStep: WorkflowStep;
  currentPhase: PhaseStep;
  isGenerating: boolean;
  generationProgress: number; // 0-100
}

// 定义整个仓库的数据结构
interface BookState {
  title: string;
  pages: PageData[];
  currentPageIndex: number; // 当前正在编辑哪一页 (0-based)

  // 配置和工作流
  config: StoryConfig;
  outline: OutlineData | null;
  workflow: WorkflowState;
  bookId: string | null; // 数据库中的书籍ID

  // 计算属性 (通过函数访问)
  completedPagesCount: () => number;
  isCurrentPageReady: () => boolean;

  // 动作 (Actions)
  setTitle: (title: string) => void;
  setPages: (pages: PageData[]) => void;
  setCurrentPageIndex: (index: number) => void;

  // 更新某一页的数据
  updatePage: (pageIndex: number, updates: Partial<PageData>) => void;

  // 配置相关
  setConfig: (config: Partial<StoryConfig>) => void;
  setOutline: (outline: OutlineData | null) => void;

  // 从大纲初始化页面
  initializeFromOutline: (outline: OutlineData) => void;

  // 工作流相关
  setWorkflowStep: (step: WorkflowStep) => void;
  setCurrentPhase: (phase: PhaseStep) => void;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;

  // 页面导航
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: () => boolean;

  // 重置
  resetWorkflow: () => void;

  // 书籍ID
  setBookId: (bookId: string | null) => void;
}

// 默认配置
const defaultConfig: StoryConfig = {
  userInput: '',
  stylePreset: 'picture-book',
  stylePrompt: 'Classic children\'s book illustration, hand-drawn style, warm colors',
  mainCharacterDesc: '',
  targetAudience: '3-6',
};

// 默认工作流状态
const defaultWorkflow: WorkflowState = {
  currentStep: 'config',
  currentPhase: 'text',
  isGenerating: false,
  generationProgress: 0,
};

export const useBookStore = create<BookState>((set, get) => ({
  title: '未命名绘本',
  pages: [],
  currentPageIndex: 0,
  config: defaultConfig,
  outline: null,
  workflow: defaultWorkflow,
  bookId: null,

  // 计算属性 - 需要通过函数访问
  completedPagesCount: () => get().pages.filter(p => p.isGenerated).length,
  isCurrentPageReady: () => {
    const page = get().pages[get().currentPageIndex];
    return page?.isGenerated ?? false;
  },

  setTitle: (title) => set({ title }),
  setPages: (pages) => set({ pages }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

  updatePage: (pageIndex, updates) =>
    set((state) => ({
      pages: state.pages.map((page, index) =>
        index === pageIndex ? { ...page, ...updates } : page
      ),
    })),

  setConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),

  setOutline: (outline) => set({ outline }),

  initializeFromOutline: (outline) =>
    set((state) => ({
      title: outline.title,
      pages: outline.pages.map((p) => ({
        id: p.pageNumber,
        aiText: '',
        aiImageUrl: null,
        canvasJson: null,
        isGenerated: false,
        outlineSummary: p.summary,
      })),
      currentPageIndex: 0,
      workflow: {
        ...state.workflow,
        currentPhase: 'text',
      },
    })),

  setWorkflowStep: (step) =>
    set((state) => ({
      workflow: { ...state.workflow, currentStep: step },
    })),

  setCurrentPhase: (phase) =>
    set((state) => ({
      workflow: { ...state.workflow, currentPhase: phase },
    })),

  setGenerating: (isGenerating) =>
    set((state) => ({
      workflow: { ...state.workflow, isGenerating },
    })),

  setGenerationProgress: (progress) =>
    set((state) => ({
      workflow: { ...state.workflow, generationProgress: progress },
    })),

  nextPage: () =>
    set((state) => {
      if (state.currentPageIndex < state.pages.length - 1) {
        return {
          currentPageIndex: state.currentPageIndex + 1,
          workflow: { ...state.workflow, currentPhase: 'text' },
        };
      }
      return {};
    }),

  prevPage: () =>
    set((state) => {
      if (state.currentPageIndex > 0) {
        return {
          currentPageIndex: state.currentPageIndex - 1,
          workflow: { ...state.workflow, currentPhase: 'preview' },
        };
      }
      return {};
    }),

  canGoNext: () => {
    const state = get();
    return state.pages[state.currentPageIndex]?.isGenerated ?? false;
  },

  resetWorkflow: () =>
    set({
      title: '未命名绘本',
      pages: [],
      currentPageIndex: 0,
      config: defaultConfig,
      outline: null,
      workflow: defaultWorkflow,
      bookId: null,
    }),

  setBookId: (bookId) => set({ bookId }),
}));