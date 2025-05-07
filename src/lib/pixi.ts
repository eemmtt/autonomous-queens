import { getContext, setContext } from 'svelte';
import { Application } from 'pixi.js';
import { writable, type Writable } from 'svelte/store';

const PIXI_CONTEXT_KEY = Symbol('pixi');

export interface PixiContext {
  app: Application;
  ready: Writable<boolean>;
}

export function setPixiContext(app: Application): PixiContext {
  const context: PixiContext = {
    app,
    ready: writable(false)
  };
  
  return setContext(PIXI_CONTEXT_KEY, context);
}

export function getPixiContext(): PixiContext {
  return getContext(PIXI_CONTEXT_KEY);
}