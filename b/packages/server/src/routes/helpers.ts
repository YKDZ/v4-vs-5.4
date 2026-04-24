import type { Context } from 'hono';
import { BadRequestError } from '../utils/errors';
import type { ServiceContainer } from '../services/container';

export function getServices(c: Context) {
  return c.get('services') as ServiceContainer;
}

export function parseId(value: string, label: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new BadRequestError(`Invalid ${label}`);
  }

  return parsed;
}
