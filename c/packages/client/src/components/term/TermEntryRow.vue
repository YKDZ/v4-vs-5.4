<template>
  <tr>
    <td>
      <span v-if="!editing">{{ term.termText }}</span>
      <input v-else v-model="draft.termText" />
    </td>
    <td>
      <span v-if="!editing">{{ term.termType ?? '—' }}</span>
      <select v-else v-model="draft.termType">
        <option :value="null">(none)</option>
        <option value="fullForm">fullForm</option>
        <option value="acronym">acronym</option>
        <option value="abbreviation">abbreviation</option>
        <option value="variant">variant</option>
      </select>
    </td>
    <td>
      <span v-if="!editing" :class="statusClass">
        <span class="badge" :class="term.status ?? ''">{{ term.status ?? '—' }}</span>
      </span>
      <select v-else v-model="draft.status">
        <option :value="null">(none)</option>
        <option value="preferred">preferred</option>
        <option value="admitted">admitted</option>
        <option value="deprecated">deprecated</option>
      </select>
    </td>
    <td>
      <span v-if="!editing" class="muted">{{ term.source ?? '—' }}</span>
      <input v-else v-model="draft.source" />
    </td>
    <td style="text-align: right">
      <button v-if="!editing" @click="startEdit">Edit</button>
      <button v-else class="primary" @click="save">Save</button>
      <button v-if="editing" @click="editing = false">Cancel</button>
      <button v-if="!editing" class="danger" @click="remove">Delete</button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { TermEntry } from '@termbase/shared';
import { termApi } from '@/api/term-entry.api';

const props = defineProps<{ term: TermEntry }>();
const emit = defineEmits<{ (e: 'updated'): void; (e: 'deleted'): void }>();

const editing = ref(false);
const draft = reactive({ termText: '', status: null as any, termType: null as any, source: null as any });

const statusClass = computed(() =>
  props.term.status === 'deprecated' ? 'status-error' : props.term.status === 'preferred' ? 'status-pass' : '',
);

function startEdit() {
  draft.termText = props.term.termText;
  draft.status = props.term.status;
  draft.termType = props.term.termType;
  draft.source = props.term.source;
  editing.value = true;
}
async function save() {
  await termApi.update(props.term.id, {
    termText: draft.termText,
    status: draft.status,
    termType: draft.termType,
    source: draft.source,
  });
  editing.value = false;
  emit('updated');
}
async function remove() {
  if (!confirm('Delete this term?')) return;
  await termApi.remove(props.term.id);
  emit('deleted');
}
</script>
