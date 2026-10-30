// Сигнал «прелоадер закончился»: главный экран начинает свою анимацию после него.
export const INTRO_EVENT = 'dz:intro-done';

export const introIsDone = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dz-intro-done');

export function finishIntro() {
  document.documentElement.classList.add('dz-intro-done');
  window.dispatchEvent(new Event(INTRO_EVENT));
}

// Выполняется до отрисовки страницы: если заставку уже видели в этой вкладке
// или включено «уменьшить движение», прячем её сразу, без мелькания.
export const INTRO_BOOT_SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem('dz-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('dz-seen','dz-intro-done')}}catch(e){}`;
