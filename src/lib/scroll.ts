// Блокировка прокрутки, которая работает и с плавным скроллом Lenis.
type LenisLike = { stop(): void; start(): void };

export function lockScroll(on: boolean) {
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (on) lenis?.stop();
  else lenis?.start();
  document.documentElement.classList.toggle('dz-locked', on);
}
