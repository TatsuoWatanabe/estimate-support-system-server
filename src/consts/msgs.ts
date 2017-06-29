export const Msgs = {
  authFailed: 'Authentication failed.',
  authFailedBy(reason: string) { return `${Msgs.authFailed} ${reason}`; },
  badRequest: 'Bad Request.',
  notFound: 'Not Found.',
  notFoundThat(target: string) { return `${target} Not Found.`; },
  forbidden: 'User is not permitted to perform the requested operation.',
  noToken: 'No token provided.',
  userNotFound: 'User not found.',
  wrongPassword: 'Wrong password.',
  needSuperSecret: 'Need to set superSecret variable.',
  requiredThat(target: string) { return `${target} required.`; },
  requiredUserNotFound: 'required user not found.',
  saved: 'save succeeded.',
  success: 'success.',
  validationFailed: 'validation failed.'
};
