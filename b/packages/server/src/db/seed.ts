import { createServiceContainer } from '../services/container';

async function main() {
  const services = await createServiceContainer({
    initializeDatabase: true,
  });

  try {
    await services.seedIfEmpty();
    console.log('Seed completed.');
  } finally {
    await services.close();
  }
}

void main();
