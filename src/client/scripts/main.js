const $pages = Array.from(document.querySelectorAll('.page'));

const hideAllElements = () => {
  $pages.forEach($page => $page.style.display = 'none');
}

export {
  hideAllElements,
}