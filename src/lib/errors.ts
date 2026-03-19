type MaybeErrorLike = {
  message?: unknown;
  error_description?: unknown;
  details?: unknown;
  hint?: unknown;
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;

  if (error && typeof error === "object") {
    const err = error as MaybeErrorLike;
    if (typeof err.message === "string" && err.message.trim().length > 0) return err.message;
    if (typeof err.error_description === "string" && err.error_description.trim().length > 0) return err.error_description;
    if (typeof err.details === "string" && err.details.trim().length > 0) return err.details;
    if (typeof err.hint === "string" && err.hint.trim().length > 0) return err.hint;
  }

  return fallback;
};
