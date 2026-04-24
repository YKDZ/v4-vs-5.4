import { Hono } from "hono";

import { ConceptRepository } from "../repositories/concept.repository";
import { RegressionRepository } from "../repositories/regression.repository";
import { TermEntryRepository } from "../repositories/term-entry.repository";
import { ConceptService } from "../services/concept.service";
import { RegressionService } from "../services/regression.service";
import { TbxService } from "../services/tbx.service";
import { TermEntryService } from "../services/term-entry.service";
import type { NodeDatabase } from "../types/database";
import { createConceptRoutes } from "./concept.routes";
import { createRegressionRoutes } from "./regression.routes";
import { createTbxRoutes } from "./tbx.routes";
import { createTermEntryRoutes } from "./term-entry.routes";

export function registerRoutes(db: NodeDatabase) {
  const route = new Hono();

  const conceptRepository = new ConceptRepository(db);
  const termEntryRepository = new TermEntryRepository(db);
  const regressionRepository = new RegressionRepository(db);

  const conceptService = new ConceptService(conceptRepository);
  const termEntryService = new TermEntryService(conceptRepository, termEntryRepository);
  const regressionService = new RegressionService(termEntryRepository, regressionRepository);
  const tbxService = new TbxService(db);

  route.route("/concepts", createConceptRoutes(conceptService));
  route.route("/", createTermEntryRoutes(termEntryService));
  route.route("/", createRegressionRoutes(regressionService));
  route.route("/", createTbxRoutes(tbxService));

  return route;
}
