import { createRouter, createWebHistory } from 'vue-router';
import ConceptListView from '../views/ConceptListView.vue';
import ConceptDetailView from '../views/ConceptDetailView.vue';
import RegressionView from '../views/RegressionView.vue';
import ImportExportView from '../views/ImportExportView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/concepts' },
    { path: '/concepts', name: 'concept-list', component: ConceptListView },
    { path: '/concepts/:id', name: 'concept-detail', component: ConceptDetailView, props: true },
    { path: '/regression', name: 'regression', component: RegressionView },
    { path: '/import-export', name: 'import-export', component: ImportExportView },
  ],
});
