/**
 * Financial Concierge – Cognito Auth Service
 *
 * Leichtgewichtiger Auth-Service basierend auf amazon-cognito-identity-js.
 * Stellt signUp, signIn, signOut, getToken und getCurrentUser bereit.
 */
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

function getPoolData() {
  const config = window.APP_CONFIG || {};
  return {
    UserPoolId: config.COGNITO_USER_POOL_ID || '',
    ClientId: config.COGNITO_CLIENT_ID || '',
  };
}

function getUserPool() {
  const poolData = getPoolData();
  if (!poolData.UserPoolId || !poolData.ClientId) {
    console.warn('Cognito not configured – check config.js');
    return null;
  }
  return new CognitoUserPool(poolData);
}

/**
 * Registriert einen neuen Benutzer.
 * @param {string} email
 * @param {string} password
 * @param {string} name - Anzeigename
 * @param {boolean} taxInterest - Steuerliche Absetzbarkeit nutzen?
 * @param {string} profession - Beruf/Tätigkeit (nur wenn taxInterest = true)
 * @returns {Promise<{user: CognitoUser, userSub: string}>}
 */
export function signUp(email, password, name, taxInterest = false, profession = '') {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    if (!pool) return reject(new Error('Cognito nicht konfiguriert'));

    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
      new CognitoUserAttribute({ Name: 'custom:taxInterest', Value: String(taxInterest) }),
      new CognitoUserAttribute({ Name: 'custom:profession', Value: profession }),
    ];

    pool.signUp(email, password, attributes, null, (err, result) => {
      if (err) return reject(err);
      resolve({ user: result.user, userSub: result.userSub });
    });
  });
}

/**
 * Bestätigt die Registrierung mit dem Verifizierungscode.
 * @param {string} email
 * @param {string} code
 * @returns {Promise<string>}
 */
export function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    if (!pool) return reject(new Error('Cognito nicht konfiguriert'));

    const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

/**
 * Meldet einen Benutzer an.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{idToken: string, accessToken: string, refreshToken: string}>}
 */
export function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    if (!pool) return reject(new Error('Cognito nicht konfiguriert'));

    const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve({
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        });
      },
      onFailure: (err) => reject(err),
    });
  });
}

/**
 * Meldet den aktuellen Benutzer ab.
 */
export function signOut() {
  const pool = getUserPool();
  if (!pool) return;
  const user = pool.getCurrentUser();
  if (user) user.signOut();
}

/**
 * Gibt das aktuelle ID-Token zurück (für Authorization Header).
 * Erneuert die Session automatisch falls nötig.
 * @returns {Promise<string|null>}
 */
export function getIdToken() {
  return new Promise((resolve) => {
    const pool = getUserPool();
    if (!pool) return resolve(null);

    const user = pool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err, session) => {
      if (err || !session || !session.isValid()) return resolve(null);
      resolve(session.getIdToken().getJwtToken());
    });
  });
}

/**
 * Gibt die Daten des aktuellen Benutzers zurück.
 * @returns {Promise<{sub: string, email: string, name: string, taxInterest: boolean, profession: string}|null>}
 */
export function getCurrentUser() {
  return new Promise((resolve) => {
    const pool = getUserPool();
    if (!pool) return resolve(null);

    const user = pool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err, session) => {
      if (err || !session || !session.isValid()) return resolve(null);

      user.getUserAttributes((attrErr, attributes) => {
        if (attrErr || !attributes) return resolve(null);

        const attrs = {};
        attributes.forEach((a) => {
          attrs[a.getName()] = a.getValue();
        });

        resolve({
          sub: attrs['sub'] || '',
          email: attrs['email'] || '',
          name: attrs['name'] || '',
          taxInterest: attrs['custom:taxInterest'] === 'true',
          profession: attrs['custom:profession'] || '',
        });
      });
    });
  });
}

/**
 * Prüft ob ein Benutzer aktuell eingeloggt ist.
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const token = await getIdToken();
  return !!token;
}

/**
 * Sendet den Verifizierungscode erneut.
 * @param {string} email
 * @returns {Promise<void>}
 */
export function resendConfirmationCode(email) {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    if (!pool) return reject(new Error('Cognito nicht konfiguriert'));

    const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}
