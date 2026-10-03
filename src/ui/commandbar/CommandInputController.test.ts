import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandInputController } from './CommandInputController';

const PAUSE_MS = 900;

describe('CommandInputController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('submits as voice once the text stops changing', () => {
    const onSubmit = vi.fn();
    const controller = new CommandInputController(onSubmit, PAUSE_MS);
    controller.textChanged('turn the sun green');
    vi.advanceTimersByTime(PAUSE_MS - 1);
    expect(onSubmit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onSubmit).toHaveBeenCalledWith({ text: 'turn the sun green', source: 'voice' });
  });

  it('restarts the countdown while the text keeps changing', () => {
    const onSubmit = vi.fn();
    const controller = new CommandInputController(onSubmit, PAUSE_MS);
    controller.textChanged('turn');
    vi.advanceTimersByTime(500);
    controller.textChanged('turn the sun');
    vi.advanceTimersByTime(500);
    expect(onSubmit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ text: 'turn the sun', source: 'voice' });
  });

  it('submits immediately as text on Enter and cancels the pending voice submit', () => {
    const onSubmit = vi.fn();
    const controller = new CommandInputController(onSubmit, PAUSE_MS);
    controller.textChanged('heal everyone');
    controller.enterPressed('heal everyone');
    vi.advanceTimersByTime(PAUSE_MS * 2);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ text: 'heal everyone', source: 'text' });
  });

  it('ignores blank text', () => {
    const onSubmit = vi.fn();
    const controller = new CommandInputController(onSubmit, PAUSE_MS);
    controller.textChanged('   ');
    controller.enterPressed('');
    vi.advanceTimersByTime(PAUSE_MS * 2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims surrounding whitespace', () => {
    const onSubmit = vi.fn();
    const controller = new CommandInputController(onSubmit, PAUSE_MS);
    controller.enterPressed('  spawn 50 chickens  ');
    expect(onSubmit).toHaveBeenCalledWith({ text: 'spawn 50 chickens', source: 'text' });
  });

  it('does not submit after dispose', () => {
    const onSubmit = vi.fn();
    const controller = new CommandInputController(onSubmit, PAUSE_MS);
    controller.textChanged('reverse gravity');
    controller.dispose();
    vi.advanceTimersByTime(PAUSE_MS * 2);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
