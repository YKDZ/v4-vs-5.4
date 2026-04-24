import { createDatabaseContext, type DatabaseContext } from '../db/index';
import { ConceptRepository } from '../repositories/concept.repository';
import { RegressionRepository } from '../repositories/regression.repository';
import { TermEntryRepository } from '../repositories/term-entry.repository';
import { ConceptService } from './concept.service';
import { RegressionService } from './regression.service';
import { TbxService } from './tbx.service';
import { TermEntryService } from './term-entry.service';

export interface ServiceContainer {
  conceptService: ConceptService;
  termEntryService: TermEntryService;
  regressionService: RegressionService;
  tbxService: TbxService;
  seedIfEmpty: () => Promise<void>;
  close: () => Promise<void>;
}

interface CreateServiceContainerOptions {
  databaseContext?: DatabaseContext;
  initializeDatabase?: boolean;
  autoSeed?: boolean;
}

export async function createServiceContainer(
  options: CreateServiceContainerOptions = {},
): Promise<ServiceContainer> {
  const databaseContext =
    options.databaseContext ??
    (await createDatabaseContext({
      initialize: options.initializeDatabase ?? true,
    }));

  const conceptRepository = new ConceptRepository(databaseContext.db);
  const termEntryRepository = new TermEntryRepository(databaseContext.db);
  const regressionRepository = new RegressionRepository(databaseContext.db);

  const conceptService = new ConceptService(conceptRepository);
  const termEntryService = new TermEntryService(termEntryRepository);
  const regressionService = new RegressionService(conceptRepository, regressionRepository);
  const tbxService = new TbxService(conceptService, conceptRepository);

  const container: ServiceContainer = {
    conceptService,
    termEntryService,
    regressionService,
    tbxService,
    seedIfEmpty: () => conceptService.seedIfEmpty(),
    close: () => databaseContext.close(),
  };

  if (options.autoSeed) {
    await container.seedIfEmpty();
  }

  return container;
}
