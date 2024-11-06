const setCookie = function (cookieName, cookieValue, expireDays) {
  if (typeof document === 'undefined') {
    return;
  }
  const date = new Date();
  date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + date.toUTCString();
  document.cookie = cookieName + '=' + cookieValue + ';' + expires + ';path=/';
};

const getCookie = function (cookieName) {
  if (typeof document === 'undefined') {
    return;
  }
  let name = cookieName + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let cookieArray = decodedCookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return undefined;
};

const deleteCookie = function (name) {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 2000 00:00:01 GMT;';
};

module.exports = {
  setCookie,
  getCookie,
  deleteCookie
};
