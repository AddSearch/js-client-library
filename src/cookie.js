const setCookie = function(cookieName, cookieValue, expireDays) {
  const date = new Date();
  date.setTime(date.getTime() + (expireDays * 24 * 60 * 60 * 1000));
  let expires = "expires="+ date.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

const getCookie = function(cookieName) {
  let name = cookieName + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let cookieArray = decodedCookie.split(';');
  for(let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}

const deleteCookie = function(name) {
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 2000 00:00:01 GMT;';
}

const checkCookie = function(){
  var cookieEnabled = navigator.cookieEnabled;
  var testCookieName = 'addstestcookie';
  if (!cookieEnabled){
    setCookie(testCookieName);
    cookieEnabled = !!getCookie(testCookieName);
    deleteCookie(testCookieName);
  }
  return cookieEnabled;
}

module.exports = {
  setCookie,
  getCookie,
  deleteCookie,
  checkCookie
}