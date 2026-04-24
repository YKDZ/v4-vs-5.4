<script setup lang="ts">
import type { UpdateTermEntryPayload } from "@termbase/shared";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import ConceptForm from "../components/concept/ConceptForm.vue";
import ConceptInfo from "../components/concept/ConceptInfo.vue";
import LanguageSection from "../components/term/LanguageSection.vue";
import { useConceptStore } from "../stores/concept.store";

const route = useRoute();
const router = useRouter();
const conceptStore = useConceptStore();
const extraLanguageCode = ref("ja");

const conceptId = computed(() => Number(route.params.id));

onMounted(async () => {
  await conceptStore.loadConceptDetail(conceptId.value);
});

const languageSections = computed(() => conceptStore.conceptDetail?.languageSections ?? []);

async function handleUpdateConcept(payload: {
  definition: string;
  subjectField?: string;
  note?: string;
}) {
  await conceptStore.editConcept(conceptId.value, payload);
}

async function handleDeleteConcept() {
  await conceptStore.removeConcept(conceptId.value);
  await router.push("/concepts");
}

async function handleCreateTerm(payload: {
  languageCode: string;
  termText: string;
  partOfSpeech?: "noun" | "verb" | "adjective" | "adverb" | "phrase" | "other";
  termType?: "fullForm" | "acronym" | "abbreviation" | "variant";
  status?: "preferred" | "admitted" | "deprecated";
  source?: string;
}) {
  await conceptStore.addTerm(conceptId.value, payload);
}

async function handleUpdateTerm(termId: number, payload: UpdateTermEntryPayload) {
  await conceptStore.editTerm(conceptId.value, termId, payload);
}

async function handleDeleteTerm(termId: number) {
  await conceptStore.removeTerm(conceptId.value, termId);
}
</script>

<template>
  <section class="page">
    <button @click="router.push('/concepts')">返回列表</button>
    <h2 class="mt-16">概念详情</h2>
    <p v-if="conceptStore.loading">加载中...</p>
    <p v-if="conceptStore.error" class="error-text">{{ conceptStore.error }}</p>
    <template v-if="conceptStore.conceptDetail">
      <ConceptInfo :concept="conceptStore.conceptDetail" />
      <ConceptForm
        :initial="{
          definition: conceptStore.conceptDetail.definition,
          subjectField: conceptStore.conceptDetail.subjectField || undefined,
          note: conceptStore.conceptDetail.note || undefined
        }"
        submit-label="更新概念"
        @submit="handleUpdateConcept"
      />
      <button class="danger" @click="handleDeleteConcept">删除概念</button>

      <h3 class="mt-16">术语条目</h3>
      <LanguageSection
        v-for="section in languageSections"
        :key="section.id"
        :language-code="section.languageCode"
        :terms="section.termEntries"
        @create="handleCreateTerm"
        @update="handleUpdateTerm"
        @remove="handleDeleteTerm"
      />

      <section class="card">
        <h3>新增语言段（添加首个术语）</h3>
        <label class="field">
          <span>语言代码</span>
          <input v-model="extraLanguageCode" />
        </label>
        <LanguageSection
          :language-code="extraLanguageCode"
          :terms="[]"
          @create="handleCreateTerm"
          @update="handleUpdateTerm"
          @remove="handleDeleteTerm"
        />
      </section>
    </template>
  </section>
</template>
