import { describe, expect, it } from 'vitest';
import { COMMAND_CONFIG } from '../core/config/commandConfig';
import { EventBus } from '../core/events/EventBus';
import type { IGameEventMap } from '../core/events/GameEvents';
import { SUN_DEFINITION } from '../entities/definitions/sunDefinition';
import { EntityFactory } from '../entities/factory/EntityFactory';
import { EntityIdGenerator } from '../entities/factory/EntityIdGenerator';
import { EntityManager } from '../entities/registry/EntityManager';
import { createFakeLogger } from '../utils/testing/createFakeLogger';
import { CommandManager } from './CommandManager';
import { COLOR_WORDS } from './vocabulary/vocabulary';

function createSetup() {
  const logger = createFakeLogger();
  const bus = new EventBus<IGameEventMap>(logger, 1000);
  const entities = new EntityManager(bus, logger);
  const factory = new EntityFactory(entities, new EntityIdGenerator(6));
  const sun = factory.create(SUN_DEFINITION);
  if (!sun) throw new Error('sun was not created');
  const manager = new CommandManager(bus, entities, logger);
  manager.start();

  const executed: string[] = [];
  const rejected: string[] = [];
  const changed: string[] = [];
  bus.on('CommandExecuted', (event) => executed.push(event.summary));
  bus.on('CommandRejected', (event) => rejected.push(event.reason));
  bus.on('EntityPropertyChanged', (event) => changed.push(`${event.entityId}:${event.property}`));

  const say = (text: string): void => {
    bus.emit('CommandSubmitted', { text, source: 'voice' });
    bus.flush();
  };
  return { sun, entities, bus, say, executed, rejected, changed };
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
});
