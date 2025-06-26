import * as cookie from 'cookie';

const setCookie = (cookieName: string, cookieValue: string, expireDays: number): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const date = new Date();
  date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);

  document.cookie = cookie.serialize(cookieName, cookieValue, {
    expires: date,
    path: '/'
  });
};

const getCookie = (cookieName: string): string | undefined => {
  if (typeof document === 'undefined') {
    return;
  }

  try {
    const cookies = cookie.parse(document.cookie);
    return cookies[cookieName];
  } catch (error) {
    console.debug('Error parsing cookies:', error);
    return undefined;
  }
};

const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = cookie.serialize(name, '', {
    expires: new Date(0),
    path: '/'
  });
};

export { setCookie, getCookie, deleteCookie };
