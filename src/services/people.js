import { buildGetService } from '../libs/service-factory';

export const peopleService = (token) => buildGetService('/api/people/');
// In the real world you will pass token to service factory
// which add it to headers or somewhere else
