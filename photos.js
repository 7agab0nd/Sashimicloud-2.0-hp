(() => {
  'use strict';
  if (!window.HTMLDialogElement) return;
  const links = document.querySelectorAll('.photo-open');
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-dialog';
  dialog.setAttribute('aria-label', 'Photo viewer');
  dialog.innerHTML = '<button type="button" class="photo-close" autofocus>Close ×</button><img alt=""><p></p>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('p');
  let opener;
  for (const link of links) link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    caption.textContent = link.dataset.caption || '';
    dialog.showModal();
    document.documentElement.classList.add('photo-viewing');
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('photo-viewing');
    opener?.focus({preventScroll:true});
  });
})();
