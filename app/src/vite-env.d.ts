/// <reference types="vite/client" />

// Global type definitions for browser APIs
declare global {
  var Event: {
    prototype: Event;
    new(type: string, eventInitDict?: EventInit): Event;
  };

  var Touch: {
    prototype: Touch;
    new(touchInitDict: TouchInit): Touch;
  };

  var MouseEvent: {
    prototype: MouseEvent;
    new(type: string, eventInitDict?: MouseEventInit): MouseEvent;
  };

  var TouchEvent: {
    prototype: TouchEvent;
    new(type: string, eventInitDict?: TouchEventInit): TouchEvent;
  };

  var performance: Performance;
}