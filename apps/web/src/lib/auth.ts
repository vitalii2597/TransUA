import Cookies from 'js-cookie';

export function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set('accessToken', accessToken, { expires: 1 / 96 }); // 15 min
  Cookies.set('refreshToken', refreshToken, { expires: 7 });
}

export function removeTokens() {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
}

export function isAuthenticated(): boolean {
  return !!Cookies.get('accessToken');
}
