import { describe, expect, it } from 'vitest';
import { COMMAND_CONFIG } from '../core/config/commandConfig';
import type { ISpawnConfig } from '../core/config/spawnConfig';
import { EventBus } from '../core/events/EventBus';
import type { IGameEventMap } from '../core/events/GameEvents';
import { CHICKEN_DEFINITION } from '../entities/definitions/chickenDefinition';
import { SUN_DEFINITION } from '../entities/definitions/sunDefinition';
import { EntityFactory } from '../entities/factory/EntityFactory';
import { EntityIdGenerator } from '../entities/factory/EntityIdGenerator';
import { EntitySpawner } from '../entities/factory/EntitySpawner';
import { EntityManager } from '../entities/registry/EntityManager';
import { createFakeLogger } from '../utils/testing/createFakeLogger';
import { CommandManager } from './CommandManager';
import { COLOR_WORDS } from './vocabulary/vocabulary';

const TEST_SPAWN_CONFIG: ISpawnConfig = {
  maxPerCommand: 500,
  maxTotalEntities: 1500,
  area: { minX: 60, maxX: 1220, minY: 220, maxY: 580 },
};

function createSetup() {
  const logger = createFakeLogger();
  const bus = new EventBus<IGameEventMap>(logger, 1000);
  const entities = new EntityManager(bus, logger);
  const factory = new EntityFactory(entities, new EntityIdGenerator(6));
  const sun = factory.create(SUN_DEFINITION);
  if (!sun) throw new Error('sun was not created');
  const spawner = new EntitySpawner(
    factory,
    entities,
    TEST_SPAWN_CONFIG,
    new Map([[CHICKEN_DEFINITION.entityType, CHICKEN_DEFINITION]]),
    () => 0.5,
  );
  const manager = new CommandManager(bus, entities, spawner, logger);
  manager.start();

  const executed: string[] = [];
  const rejected: string[] = [];
  const changed: string[] = [];
  const spawnedEvents: string[] = [];
  const destroyedEvents: string[] = [];
  bus.on('CommandExecuted', (event) => executed.push(event.summary));
  bus.on('CommandRejected', (event) => rejected.push(event.reason));
  bus.on('EntitiesSpawned', (event) => spawnedEvents.push(`${event.entityType}:${event.requested}:${event.spawned}`));
  bus.on('EntitiesDestroyed', (event) => destroyedEvents.push(`${event.targetName}:${event.destroyed}`));
  bus.on('EntityPropertyChanged', (event) => changed.push(`${event.entityId}:${event.property}`));

  const say = (text: string): void => {
    bus.emit('CommandSubmitted', { text, source: 'voice' });
    bus.flush();
  };
  return { sun, entities, bus, say, executed, rejected, changed, spawnedEvents, destroyedEvents };
}

describe('CommandManager', () => {
  it('turns the sun green', () => {
    const { sun, say, executed } = createSetup();
    say('Turn the sun green.');
    expect(sun.components.render?.tint).toBe(COLOR_WORDS.green);
    expect(executed).toEqual(["The Sun's color is now green"]);
  });

  it('understands the mishearings Wispr Flow produced', () => {
    const { sun, say } = createSetup();
    say('make the sun red');
    say('Sun do sun green.');
    expect(sun.components.render?.tint).toBe(COLOR_WORDS.green);
    say('make the sun red');
    say('Turn this on green.');
    expect(sun.components.render?.tint).toBe(COLOR_WORDS.green);
  });

  it('makes the sun bigger and then smaller', () => {
    const { sun, say } = createSetup();
    say('make the sun bigger');
    expect(sun.components.transform?.scale).toBeCloseTo(1.5);
    say('make the sun smaller');
    expect(sun.components.transform?.scale).toBeCloseTo(1.005);
  });

  it('stops growing at the maximum size', () => {
    const { sun, say } = createSetup();
    for (let index = 0; index < 20; index += 1) say('make the sun bigger');
    expect(sun.components.transform?.scale).toBe(COMMAND_CONFIG.maxScale);
  });

  it('hides and shows the sun', () => {
    const { sun, say } = createSetup();
    say('hide the sun');
    expect(sun.components.render?.visible).toBe(false);
    say('show the sun');
    expect(sun.components.render?.visible).toBe(true);
  });

  it('moves the sun but keeps it inside the world', () => {
    const { sun, say } = createSetup();
    const startX = sun.components.transform?.x ?? 0;
    say('move the sun left');
    expect(sun.components.transform?.x).toBe(startX - COMMAND_CONFIG.moveStepPixels);
    for (let index = 0; index < 20; index += 1) say('move the sun left');
    expect(sun.components.transform?.x).toBe(0);
  });

  it('rejects text it cannot understand and leaves the sun alone', () => {
    const { sun, say, rejected, executed } = createSetup();
    const tintBefore = sun.components.render?.tint;
    say('do a backflip');
    expect(rejected).toHaveLength(1);
    expect(executed).toHaveLength(0);
    expect(sun.components.render?.tint).toBe(tintBefore);
  });

  it('says what is missing when no change is named', () => {
    const { say, rejected } = createSetup();
    say('turn the sun');
    expect(rejected[0]).toContain('What should happen to the sun');
  });

  it('explains when the thing does not exist in the world', () => {
    const { sun, entities, say, rejected } = createSetup();
    entities.destroy(sun.id);
    say('make the sun red');
    expect(rejected[0]).toContain("couldn't find");
  });

  it('runs commands in the order they were submitted', () => {
    const { sun, bus } = createSetup();
    bus.emit('CommandSubmitted', { text: 'make the sun green', source: 'voice' });
    bus.emit('CommandSubmitted', { text: 'make the sun red', source: 'voice' });
    bus.flush();
    expect(sun.components.render?.tint).toBe(COLOR_WORDS.red);
  });

  it('announces which property of which entity changed', () => {
    const { sun, say, changed } = createSetup();
    say('make the sun huge');
    expect(changed).toEqual([`${sun.id}:size`]);
  });

  it('spawns chickens by number', () => {
    const { entities, say, executed } = createSetup();
    say('Spawn 5 chickens.');
    expect(entities.getByTag('animal')).toHaveLength(5);
    expect(executed).toEqual(['Spawned 5 chickens']);
  });

  it('spawns chickens by spoken number', () => {
    const { entities, say } = createSetup();
    say('spawn fifty chickens');
    expect(entities.getByTag('animal')).toHaveLength(50);
  });

  it('spawns one chicken when no amount is given', () => {
    const { entities, say, executed } = createSetup();
    say('spawn a chicken');
    expect(entities.getByTag('animal')).toHaveLength(1);
    expect(executed).toEqual(['Spawned 1 chicken']);
  });

  it('spawns 500 chickens and tells the player when asked for more', () => {
    const { entities, say, executed } = createSetup();
    say('spawn 1,000 chickens');
    expect(entities.getByTag('animal')).toHaveLength(500);
    expect(executed).toEqual(['Spawned 500 chickens (the most I can spawn at once; you asked for 1000)']);
  });

  it('refuses to spawn zero', () => {
    const { entities, say, rejected, executed } = createSetup();
    say('spawn zero chickens');
    expect(entities.getByTag('animal')).toHaveLength(0);
    expect(executed).toHaveLength(0);
    expect(rejected[0]).toContain('zero chickens');
  });

  it('says so when it cannot create the thing', () => {
    const { say, rejected } = createSetup();
    say('spawn 3 dragons');
    expect(rejected[0]).toContain("don't know how to create that");
  });

  it('announces one summary event per spawn command', () => {
    const { say, spawnedEvents } = createSetup();
    say('spawn 7 chickens');
    expect(spawnedEvents).toEqual(['chicken:7:7']);
  });

  it('keeps treating a create-word as a change when nothing creatable is named', () => {
    const { sun, entities, say } = createSetup();
    say('add some green to the sun');
    expect(sun.components.render?.tint).toBe(COLOR_WORDS.green);
    expect(entities.getByTag('animal')).toHaveLength(0);
  });

  it('reports a full world instead of spawning', () => {
    const { entities, say, rejected } = createSetup();
    for (let round = 0; round < 3; round += 1) say('spawn 500 chickens');
    expect(entities.count).toBe(1500);
    say('spawn 5 chickens');
    expect(rejected[0]).toContain('world is full');
  });

  it('changes a whole group at once', () => {
    const { sun, entities, say, executed } = createSetup();
    say('spawn 3 chickens');
    say('turn the chickens blue');
    const tints = entities.getByTag('animal').map((chicken) => chicken.components.render?.tint);
    expect(tints).toEqual([COLOR_WORDS.blue, COLOR_WORDS.blue, COLOR_WORDS.blue]);
    expect(executed.at(-1)).toBe('3 chickens are now blue');
    expect(sun.components.render?.tint).not.toBe(COLOR_WORDS.blue);
  });

  it('keeps the single-thing sentence when a group has one member', () => {
    const { say, executed } = createSetup();
    say('spawn a chicken');
    say('turn the chicken blue');
    expect(executed.at(-1)).toBe("Chicken's color is now blue");
  });

  it('changes everything, the sun included', () => {
    const { sun, entities, say } = createSetup();
    say('spawn 2 chickens');
    say('make everything red');
    expect(sun.components.render?.tint).toBe(COLOR_WORDS.red);
    expect(entities.getByTag('animal')[0]?.components.render?.tint).toBe(COLOR_WORDS.red);
  });

  it('hides a tagged group and leaves the rest', () => {
    const { sun, entities, say } = createSetup();
    say('spawn 2 chickens');
    say('hide all animals');
    expect(entities.getByTag('animal').every((chicken) => chicken.components.render?.visible === false)).toBe(true);
    expect(sun.components.render?.visible).toBe(true);
  });

  it('moves a group together', () => {
    const { entities, say, executed } = createSetup();
    say('spawn 2 chickens');
    say('move the chickens down');
    expect(entities.getByTag('animal')[0]?.components.transform?.y).toBe(400 + COMMAND_CONFIG.moveStepPixels);
    expect(executed.at(-1)).toBe('2 chickens moved down');
  });

  it('deletes a group and announces it', () => {
    const { sun, entities, say, executed, destroyedEvents } = createSetup();
    say('spawn 4 chickens');
    say('Delete all the chickens.');
    expect(entities.getByTag('animal')).toHaveLength(0);
    expect(entities.get(sun.id)).toBe(sun);
    expect(executed.at(-1)).toBe('Deleted 4 chickens');
    expect(destroyedEvents).toEqual(['chicken:4']);
  });

  it('refuses to delete the sun', () => {
    const { sun, entities, say, rejected } = createSetup();
    say('delete the sun');
    expect(entities.get(sun.id)).toBe(sun);
    expect(rejected[0]).toContain("can't be deleted");
  });

  it('deletes everything it may and spares the sun', () => {
    const { sun, entities, say, executed } = createSetup();
    say('spawn 3 chickens');
    say('delete everything');
    expect(entities.count).toBe(1);
    expect(entities.get(sun.id)).toBe(sun);
    expect(executed.at(-1)).toBe("Deleted 3 things (1 can't be deleted)");
  });

  it('says so when there is nothing to delete or change', () => {
    const { say, rejected } = createSetup();
    say('delete the chickens');
    say('hide the chickens');
    expect(rejected).toHaveLength(2);
    expect(rejected[0]).toContain("couldn't find");
  });

  it('lets chickens spawn again after they were deleted', () => {
    const { entities, say } = createSetup();
    say('spawn 2 chickens');
    say('remove the hens');
    say('spawn 3 chickens');
    expect(entities.getByTag('animal')).toHaveLength(3);
  });
});
