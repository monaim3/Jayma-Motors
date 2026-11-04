/**
 * One error shape for the whole frontend (Step 6 §4).
 * `fieldErrors` holds Laravel 422 messages keyed by field name.
 */
export class ApiError extends Error {
  constructor({ status = 0, message = "Something went wrong. Please try again.", fieldErrors = {} } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isValidation() {
    return this.status === 422;
  }

  get isUnauthenticated() {
    return this.status === 401;
  }
}

const DEFAULT_MESSAGES = {
  0: "Cannot reach the server. Check your connection and try again.",
  401: "Please log in to continue.",
  403: "You don't have permission to do this.",
  404: "Not found.",
  409: "This action is no longer possible. Please refresh and try again.",
  419: "Your session expired. Please try again.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again.",
};

/** Build an ApiError from an HTTP status and a parsed Laravel JSON body. */
export function toApiError(status, body) {
  const fieldErrors = {};
  if (body?.errors && typeof body.errors === "object") {
    for (const [field, messages] of Object.entries(body.errors)) {
      fieldErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
    }
  }

  const message =
    (status !== 500 && typeof body?.message === "string" && body.message) ||
    DEFAULT_MESSAGES[status] ||
    DEFAULT_MESSAGES[status >= 500 ? 500 : 0];

  return new ApiError({ status, message, fieldErrors });
}

/**
 * Copy Laravel validation errors onto a React Hook Form instance.
 * Returns true when field errors were applied.
 */
export function applyFieldErrors(error, setError) {
  if (!(error instanceof ApiError) || !error.isValidation) return false;
  const entries = Object.entries(error.fieldErrors);
  entries.forEach(([field, message], index) => {
    setError(field, { type: "server", message }, { shouldFocus: index === 0 });
  });
  return entries.length > 0;
}
