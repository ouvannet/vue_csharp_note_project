import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import type { Note } from '../types/note';

const apiBaseUrl = import.meta.env.VITE_API_URL;

type ApiNote = {
  id: number;
  title: string;
  content?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

type ModalMode = 'create' | 'edit';

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);

const parseNoteDate = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
};

const mapApiNotes = (apiNotes: ApiNote[]): Note[] =>
  apiNotes.map((note) => {
    const createdAt = formatDateTime(new Date(note.createdAt));
    const updatedAt = note.updatedAt ? formatDateTime(new Date(note.updatedAt)) : '';
    return {
      id: note.id,
      title: note.title,
      content: note.content ?? '',
      createdAt,
      updatedAt,
    };
  });

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [] as Note[],
    isLoading: false,
    error: '',
    selectedId: null as number | null,
    search: '',
    sortKey: 'created' as 'created' | 'updated',
    sortDir: 'desc' as 'desc' | 'asc',
    fromDate: '',
    toDate: '',
    isModalOpen: false,
    modalMode: 'create' as ModalMode,
    modalTitle: '',
    modalContent: '',
    modalError: '',
    editingNoteId: null as number | null,
    isConfirmOpen: false,
    confirmingNoteId: null as number | null,
  }),
  getters: {
    selectedNote: (state) => state.notes.find(n => n.id === state.selectedId) ?? null,
    displayedNotes: (state) => {
      const query = state.search?.trim().toLowerCase() ?? '';
      
      // Parse start date: handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm" formats
      let start: Date | null = null;
      if (state.fromDate) {
        start = new Date(state.fromDate.includes('T') ? state.fromDate : `${state.fromDate}T00:00:00`);
      }
      
      // Parse end date: handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm" formats
      let end: Date | null = null;
      if (state.toDate) {
        end = new Date(state.toDate.includes('T') ? state.toDate : `${state.toDate}T23:59:59.999`);
      }

      return (state.notes ?? [])
        .filter((note) => {
          if (query) {
            const haystack = [note.title, note.content].join(' ').toLowerCase();
            if (!haystack.includes(query)) return false;
          }

          if (start || end) {
            const noteDate = parseNoteDate(note.createdAt);
            if (!noteDate) return false;
            if (start && noteDate < start) return false;
            if (end && noteDate > end) return false;
          }

          return true;
        })
        .slice()
        .sort((a, b) => {
          return state.sortDir === 'desc' ? b.id - a.id : a.id - b.id;
        });
    },
  },
  actions: {
    select(id: number | null) { this.selectedId = id; },
    resetFilters() {
      this.search = '';
      this.sortKey = 'created';
      this.sortDir = 'desc';
      this.fromDate = '';
      this.toDate = '';
    },
    openCreate() {
      this.isModalOpen = true;
      this.modalMode = 'create';
      this.modalTitle = '';
      this.modalContent = '';
      this.modalError = '';
      this.editingNoteId = null;
    },
    openEdit(note: Note) {
      this.isModalOpen = true;
      this.modalMode = 'edit';
      this.editingNoteId = note.id;
      this.modalTitle = note.title;
      this.modalContent = note.content;
      this.modalError = '';
    },
    closeModal() {
      this.isModalOpen = false;
      this.editingNoteId = null;
    },
    openDeleteConfirm(noteId: number) {
      this.isConfirmOpen = true;
      this.confirmingNoteId = noteId;
    },
    closeDeleteConfirm() {
      this.isConfirmOpen = false;
      this.confirmingNoteId = null;
    },
    async loadNotes() {
      const authStore = useAuthStore();
      const token = authStore.token;
      if (!token || !authStore.isAuthenticated) {
        this.notes = [];
        return;
      }

      this.isLoading = true;
      this.error = '';

      try {
        const response = await fetch(`${apiBaseUrl}/api/Notes`, {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          authStore.logout();
          this.notes = [];
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load notes (${response.status})`);
        }

        const apiNotes = (await response.json()) as ApiNote[];
        this.notes = mapApiNotes(apiNotes);
      } catch (err) {
        this.error = 'Could not load notes from the API.';
        this.notes = [];
      } finally {
        this.isLoading = false;
      }
    },
    async submitModal() {
      const title = this.modalTitle.trim();
      if (!title) {
        this.modalError = 'Title is required.';
        return;
      }

      const authStore = useAuthStore();
      const token = authStore.token;
      if (!token || !authStore.isAuthenticated) {
        authStore.logout();
        return;
      }

      this.isLoading = true;
      this.error = '';

      try {
        const now = new Date().toISOString();
        const url =
          this.modalMode === 'create'
            ? `${apiBaseUrl}/api/Notes`
            : `${apiBaseUrl}/api/Notes/${this.editingNoteId}`;
        const method = this.modalMode === 'create' ? 'POST' : 'PUT';

        const body =
          this.modalMode === 'create'
            ? {
                title,
                content: this.modalContent.trim(),
                createdAt: now,
              }
            : {
                title,
                content: this.modalContent.trim(),
                updatedAt: now,
              };

        const response = await fetch(url, {
          method,
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (response.status === 401 || response.status === 403) {
          authStore.logout();
          this.notes = [];
          return;
        }

        if (!response.ok) {
          const action = this.modalMode === 'create' ? 'create' : 'update';
          throw new Error(`Failed to ${action} note (${response.status})`);
        }

        await this.loadNotes();
        this.closeModal();
      } catch (err) {
        this.error = `Could not ${this.modalMode === 'create' ? 'create' : 'update'} the note.`;
      } finally {
        this.isLoading = false;
      }
    },
    async confirmDelete() {
      if (this.confirmingNoteId === null) return;

      const noteId = this.confirmingNoteId;
      this.closeDeleteConfirm();

      const authStore = useAuthStore();
      const token = authStore.token;
      if (!token || !authStore.isAuthenticated) {
        authStore.logout();
        return;
      }

      this.isLoading = true;
      this.error = '';

      try {
        const response = await fetch(`${apiBaseUrl}/api/Notes/${noteId}`, {
          method: 'DELETE',
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          authStore.logout();
          this.notes = [];
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to delete note (${response.status})`);
        }

        await this.loadNotes();
      } catch (err) {
        this.error = 'Could not delete the note.';
      } finally {
        this.isLoading = false;
      }
    },
  },
});
