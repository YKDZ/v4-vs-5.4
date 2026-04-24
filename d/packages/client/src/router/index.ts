import { createRouter, createWebHistory } from "vue-router";

import ConceptDetailView from "../views/ConceptDetailView.vue";
import ConceptListView from "../views/ConceptListView.vue";
import ImportExportView from "../views/ImportExportView.vue";
import RegressionView from "../views/RegressionView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/concepts" },
    { path: "/concepts", component: ConceptListView },
    { path: "/concepts/:id", component: ConceptDetailView, props: true },
    { path: "/regression", component: RegressionView },
    { path: "/import-export", component: ImportExportView },
  ],
});
