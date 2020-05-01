const $3 = document.getElementById('c3');
const $2 = document.getElementById('c2');
const $1 = document.getElementById('c1');
const $go = document.getElementById('cgo');
const $cd = document.getElementById('round-countdown');

const resetCountdown = () => {
  $3.classList.remove('counting');
  $2.classList.remove('counting');
  $1.classList.remove('counting');
  $go.classList.remove('counting');
}

const doCountdown = (callback) => {

  $cd.style.display = 'block';
  $3.classList.add('counting');

  setTimeout(() => {
    $2.classList.add('counting');

    setTimeout(() => {
      $1.classList.add('counting');

      setTimeout(() => {
        $go.classList.add('counting');

        setTimeout(() => {
          $cd.style.display = 'block';
          resetCountdown();
        },1000);
        callback();
      }, 1000);
    }, 1000);
  }, 1000);
}

export {
  doCountdown,
}