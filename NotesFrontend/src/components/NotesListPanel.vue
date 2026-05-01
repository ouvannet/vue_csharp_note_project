<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotesStore } from '../stores/notes';

const authStore = useAuthStore();
const notesStore = useNotesStore();

const modalInput = ref<HTMLInputElement | null>(null);

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      void notesStore.loadNotes();
    } else {
      notesStore.notes = [];
    }
  },
  { immediate: true },
);

// Sync filter updates to store (keep as v-models in template)
const searchModel = computed({
  get: () => notesStore.search,
  set: (value: string) => { notesStore.search = value; },
});

const sortKeyModel = computed({
  get: () => notesStore.sortKey,
  set: (value: 'created' | 'updated') => { notesStore.sortKey = value; },
});

const sortDirModel = computed({
  get: () => notesStore.sortDir,
  set: (value: 'desc' | 'asc') => { notesStore.sortDir = value; },
});

const fromDateModel = computed({
  get: () => notesStore.fromDate,
  set: (value: string) => { notesStore.fromDate = value; },
});

const toDateModel = computed({
  get: () => notesStore.toDate,
  set: (value: string) => { notesStore.toDate = value; },
});

// Wrapper for openCreate to auto-focus
const openCreate = async () => {
  notesStore.openCreate();
  await nextTick();
  modalInput.value?.focus();
};

// Wrapper for openEdit to auto-focus
const openEdit = async (note: any) => {
  notesStore.openEdit(note);
  await nextTick();
  modalInput.value?.focus();
};
</script>

<template>
  <section v-if="!notesStore.selectedNote" class="rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-soft p-6 flex flex-col gap-4">
    <div class="w-full">
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-soft px-4 py-3 flex items-center gap-2 transition focus-within:border-[var(--accent)]">
        <input v-model="searchModel" type="search" class="flex-1 border-none outline-none bg-transparent text-sm placeholder-[var(--muted)]" placeholder="Find notes" />
      </div>
      <div class="flex items-center gap-4 flex-wrap mt-4">
        <div class="flex gap-2 max-sm:w-full">
          <div class="flex flex-col gap-1 w-full hidden">
            <span class="text-xs text-[var(--muted)] font-medium">Sort by</span>
            <select v-model="sortKeyModel" class="input-base text-sm">
              <option value="created">Created date</option>
              <option value="updated">Updated date</option>
            </select>
          </div>
          <div class="flex flex-col gap-1 w-full">
            <span class="text-xs text-[var(--muted)] font-medium">Order</span>
            <select v-model="sortDirModel" class="input-base text-sm">
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap max-sm:w-full">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-[var(--muted)] font-medium">From</span>
            <input v-model="fromDateModel" type="datetime-local" class="input-base text-sm" />
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-[var(--muted)] font-medium">To</span>
            <input v-model="toDateModel" type="datetime-local" class="input-base text-sm" />
          </div>
        </div>
        <div class="flex gap-1">
          <button class="btn-ghost text-sm mt-[20px]" type="button" @click="notesStore.resetFilters">Clear</button>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-between mb-2">
      <div>
        <h2>All notes</h2>
        <p class="m-0 text-sm text-[var(--muted)]">{{ notesStore.displayedNotes.length }} notes</p>
      </div>
      <button class="btn-primary text-sm" type="button" @click="openCreate">New note</button>
    </div>

    <p v-if="notesStore.isLoading" class="m-0 text-sm text-[var(--muted)]">Loading notes...</p>
    <p v-else-if="notesStore.error" class="m-0 text-sm text-[#c4472c]">{{ notesStore.error }}</p>
    <p v-else-if="!notesStore.displayedNotes.length" class="m-0 text-sm text-[var(--muted)]">No notes found.</p>

    <ul v-else class="list-none m-0 p-0 flex flex-col gap-2">
      <li v-for="note in notesStore.displayedNotes" :key="note.id">
        <button
          :class="[
            'w-full text-left rounded-2xl border transition p-4 cursor-pointer',
            note.id === notesStore.selectedId
              ? 'border-[var(--accent)] bg-[rgba(227,98,68,0.06)] shadow-soft'
              : 'border-[var(--border)] hover:border-[var(--accent-2)]'
          ]"
          type="button"
          @click="notesStore.select(note.id)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="m-0 text-base font-semibold text-[var(--text)]">{{ note.title }}</p>
              <p class="m-0.5 text-sm text-[var(--muted)]">Created {{ note.createdAt }}</p>
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <button class="rounded-lg bg-[var(--accent-2)] px-2.5 py-1 text-xs font-medium text-white transition hover:opacity-90" type="button" @click.stop="openEdit(note)">
              Edit
            </button>
            <button class="rounded-lg bg-[#c4472c] px-2.5 py-1 text-xs font-medium text-white transition hover:opacity-90" type="button" @click.stop="notesStore.openDeleteConfirm(note.id)">
              Delete
            </button>
          </div>
        </button>
      </li>
    </ul>
  </section>

  <section v-if="notesStore.selectedNote" class="rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-soft p-6 flex flex-col gap-4">
    <div class="flex items-start justify-between gap-4 mb-2">
      <div class="flex-1">
        <p class="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Note details</p>
        <h2>{{ notesStore.selectedNote.title }}</h2>
      </div>
      <div class="flex gap-2">
        <button class="btn-ghost text-sm px-3 py-1.5" type="button" @click="notesStore.select(null)">
          Back
        </button>
        <button class="rounded-lg bg-[var(--accent-2)] px-2.5 py-1 text-xs font-medium text-white transition hover:opacity-90" type="button" @click="openEdit(notesStore.selectedNote)">
          Edit
        </button>
        <button class="rounded-lg bg-[#c4472c] px-2.5 py-1 text-xs font-medium text-white transition hover:opacity-90" type="button" @click="notesStore.openDeleteConfirm(notesStore.selectedNote.id)">
          Delete
        </button>
      </div>
    </div>

    <div class="flex gap-4 text-xs text-[var(--muted)]">
      <div>
        <span class="font-medium">Created:</span> {{ notesStore.selectedNote.createdAt }}
      </div>
      <div>
        <span class="font-medium">Updated:</span> {{ notesStore.selectedNote.updatedAt }}
      </div>
    </div>

    <div class="border-t border-[var(--border)] pt-4">
      <p class="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text)]">{{ notesStore.selectedNote.content }}</p>
    </div>
  </section>

  <div v-if="notesStore.isModalOpen" class="modal-backdrop" @click.self="notesStore.closeModal">
    <div class="modal animate-rise" role="dialog" aria-modal="true" :aria-labelledby="`${notesStore.modalMode}-note-title`">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">{{ notesStore.modalMode === "create" ? "New note" : "Edit note" }}</p>
          <h3 :id="`${notesStore.modalMode}-note-title`">{{ notesStore.modalMode === "create" ? "Create a note" : "Update your note" }}</h3>
        </div>
        <button class="btn-ghost text-sm px-3 py-1.5" type="button" @click="notesStore.closeModal">
          Close
        </button>
      </div>
      <form class="flex flex-col gap-4" @submit.prevent="notesStore.submitModal">
        <div class="flex flex-col gap-2">
          <label for="modal-title" class="text-xs text-[var(--muted)]">Title *</label>
          <input
            id="modal-title"
            ref="modalInput"
            v-model="notesStore.modalTitle"
            :class="['input-base', { 'input-error': notesStore.modalError }]"
            placeholder="Note title"
            required
          />
          <p v-if="notesStore.modalError" class="error-text">{{ notesStore.modalError }}</p>
        </div>
        <div class="flex flex-col gap-2">
          <label for="modal-content" class="text-xs text-[var(--muted)]">Content</label>
          <textarea
            id="modal-content"
            v-model="notesStore.modalContent"
            rows="4"
            class="input-base"
            placeholder="Write your note content"
          ></textarea>
        </div>
        <div class="flex gap-2 flex-wrap justify-end">
          <button class="btn-secondary text-sm" type="button" @click="notesStore.closeModal">Cancel</button>
          <button class="btn-primary text-sm" type="submit">{{ notesStore.modalMode === "create" ? "Create note" : "Save changes" }}</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="notesStore.isConfirmOpen" class="modal-backdrop" @click.self="notesStore.closeDeleteConfirm">
    <div class="modal animate-rise" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 id="confirm-delete-title">Delete note?</h3>
          <p class="m-0 text-sm text-[var(--muted)] mt-2">This action cannot be undone.</p>
        </div>
        <button class="btn-ghost text-sm px-3 py-1.5" type="button" @click="notesStore.closeDeleteConfirm">
          Close
        </button>
      </div>
      <div class="flex gap-2 flex-wrap justify-end mt-4">
        <button class="btn-secondary text-sm" type="button" @click="notesStore.closeDeleteConfirm">Cancel</button>
        <button class="rounded-lg bg-[#c4472c] px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90" type="button" @click="notesStore.confirmDelete">Delete</button>
      </div>
    </div>
  </div>
</template>
