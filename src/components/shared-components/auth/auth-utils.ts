export const textFieldSx = {
  "& .MuiInputLabel-root": { fontFamily: "Neue_machina" },
  "& .MuiInputLabel-root.Mui-focused": { color: "rgb(57,57,57)" },
  "& .MuiOutlinedInput-root.Mui-focused": {
    "& > fieldset": { borderColor: "rgb(57,57,57)" },
  },
};

export const getErrorMessage = (
  error: unknown,
  fallback = "Что-то пошло не так. Попробуйте снова."
): string => {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }
  return fallback;
};
