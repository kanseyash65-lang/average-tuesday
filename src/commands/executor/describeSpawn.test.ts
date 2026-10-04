import { describe, expect, it } from 'vitest';
import type { ISpawnable } from '../Command';
import { describeSpawn } from './describeSpawn';

const CHICKEN: ISpawnable = { entityType: 'chicken', singularName: 'chicken', pluralName: 'chickens' };

describe('describeSpawn', () => {
  it('uses the plural for several', () => {
    expect(describeSpawn(CHICKEN, { requested: 5, spawned: 5, limit: 'none' })).toBe('Spawned 5 chickens');
  });

  it('uses the singular for one', () => {
    expect(describeSpawn(CHICKEN, { requested: 1, spawned: 1, limit: 'none' })).toBe('Spawned 1 chicken');
  });

  it('explains the per-command limit', () => {
    expect(describeSpawn(CHICKEN, { requested: 1000, spawned: 500, limit: 'perCommand' })).toBe(
      'Spawned 500 chickens (the most I can spawn at once; you asked for 1000)',
    );
  });

  it('explains a full world', () => {
    expect(describeSpawn(CHICKEN, { requested: 300, spawned: 120, limit: 'worldFull' })).toBe(
      'Spawned 120 chickens (the world is full; you asked for 300)',
    );
  });
});
