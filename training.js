'use strict';
const printButton = document.getElementById('print-training');
if (printButton) printButton.addEventListener('click', () => {
  document.querySelectorAll('.training-section').forEach(section => { section.open = true; });
  window.print();
});
