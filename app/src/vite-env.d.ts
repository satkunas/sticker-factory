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

  var DragEvent: {
    prototype: DragEvent;
    new(type: string, eventInitDict?: DragEventInit): DragEvent;
  };

  var FileReader: {
    prototype: FileReader;
    new(): FileReader;
  };

  var DOMException: {
    prototype: DOMException;
    new(message?: string, name?: string): DOMException;
  };

  var FontFace: {
    prototype: FontFace;
    new(family: string, source: string | ArrayBuffer, descriptors?: FontFaceDescriptors): FontFace;
  };

  var Crypto: {
    prototype: Crypto;
  };

  var TextEncoder: {
    prototype: TextEncoder;
    new(): TextEncoder;
  };

  var IntersectionObserver: {
    prototype: IntersectionObserver;
    new(callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver;
  };

  var performance: Performance;
}