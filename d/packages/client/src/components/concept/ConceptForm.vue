<script setup lang="ts">
import { reactive, watch } from "vue";

const props = withDefaults(
  defineProps<{
    initial?: {
      definition?: string;
      subjectField?: string;
      note?: string;
    };
    submitLabel?: string;
  }>(),
  {
    initial: () => ({}),
    submitLabel: "保存",
  },
);

const emit = defineEmits<{
  submit: [payload: { definition: string; subjectField?: string; note?: string }];
}>();

const form = reactive({
  definition: "",
  subjectField: "",
  note: "",
});

watch(
  () => props.initial,
  (value) => {
    form.definition = value.definition ?? "";
    form.subjectField = value.subjectField ?? "";
    form.note = value.note ?? "";
  },
  { immediate: true, deep: true },
);

function handleSubmit() {
  emit("submit", {
    definition: form.definition.trim(),
    subjectField: form.subjectField.trim() || undefined,
    note: form.note.trim() || undefined,
  });
}
</script>

<template>
  <form class="card" @submit.prevent="handleSubmit">
    <h3>概念表单</h3>
    <label class="field">
      <span>定义</span>
      <textarea v-model="form.definition" required rows="3" />
    </label>
    <label class="field">
      <span>领域</span>
      <input v-model="form.subjectField" />
    </label>
    <label class="field">
      <span>备注</span>
      <textarea v-model="form.note" rows="2" />
    </label>
    <button type="submit">{{ submitLabel }}</button>
  </form>
</template>
