import { create } from 'zustand';

export interface SectionConfig {
  id: string;
  type: string;
  position: number;
  visible: boolean;
  config: Record<string, unknown>;
}

interface BuilderState {
  sections: SectionConfig[];
  selectedSectionId: string | null;
  isDirty: boolean;
  isSaving: boolean;

  // Actions
  setSections: (sections: SectionConfig[]) => void;
  selectSection: (id: string | null) => void;
  addSection: (type: string, defaultConfig?: Record<string, unknown>) => void;
  removeSection: (id: string) => void;
  updateSectionConfig: (id: string, config: Record<string, unknown>) => void;
  toggleSectionVisibility: (id: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  duplicateSection: (id: string) => void;
  setIsSaving: (saving: boolean) => void;
  markClean: () => void;
}

function generateId(): string {
  return 'sec_' + Math.random().toString(36).slice(2, 9);
}

function reposition(sections: SectionConfig[]): SectionConfig[] {
  return sections.map((s, i) => ({ ...s, position: i }));
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  sections: [],
  selectedSectionId: null,
  isDirty: false,
  isSaving: false,

  setSections: (sections) =>
    set({ sections: reposition(sections), isDirty: false, selectedSectionId: null }),

  selectSection: (id) => set({ selectedSectionId: id }),

  addSection: (type, defaultConfig = {}) => {
    const { sections } = get();
    const newSection: SectionConfig = {
      id: generateId(),
      type,
      position: sections.length,
      visible: true,
      config: defaultConfig,
    };
    set({
      sections: reposition([...sections, newSection]),
      selectedSectionId: newSection.id,
      isDirty: true,
    });
  },

  removeSection: (id) => {
    const { sections, selectedSectionId } = get();
    const filtered = sections.filter((s) => s.id !== id);
    set({
      sections: reposition(filtered),
      selectedSectionId: selectedSectionId === id ? null : selectedSectionId,
      isDirty: true,
    });
  },

  updateSectionConfig: (id, config) => {
    const { sections } = get();
    set({
      sections: sections.map((s) =>
        s.id === id ? { ...s, config: { ...s.config, ...config } } : s
      ),
      isDirty: true,
    });
  },

  toggleSectionVisibility: (id) => {
    const { sections } = get();
    set({
      sections: sections.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
      isDirty: true,
    });
  },

  moveSection: (fromIndex, toIndex) => {
    const { sections } = get();
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= sections.length || toIndex >= sections.length) return;
    const sorted = [...sections].sort((a, b) => a.position - b.position);
    const [moved] = sorted.splice(fromIndex, 1);
    sorted.splice(toIndex, 0, moved);
    set({ sections: reposition(sorted), isDirty: true });
  },

  duplicateSection: (id) => {
    const { sections } = get();
    const source = sections.find((s) => s.id === id);
    if (!source) return;
    const idx = sections.findIndex((s) => s.id === id);
    const duplicate: SectionConfig = {
      ...source,
      id: generateId(),
      config: { ...source.config },
    };
    const newSections = [...sections];
    newSections.splice(idx + 1, 0, duplicate);
    set({
      sections: reposition(newSections),
      selectedSectionId: duplicate.id,
      isDirty: true,
    });
  },

  setIsSaving: (saving) => set({ isSaving: saving }),

  markClean: () => set({ isDirty: false }),
}));
