import type { IAuthUser } from "@/api/api";

export const textFieldSx = {
  "& .MuiInputLabel-root": { fontFamily: "Neue_machina" },
  "& .MuiInputLabel-root.Mui-focused": { color: "rgb(57,57,57)" },
  "& .MuiOutlinedInput-root.Mui-focused": {
    "& > fieldset": { borderColor: "rgb(57,57,57)" },
  },
};

export const getPostAuthPath = (_user?: Pick<IAuthUser, "role">) =>
  "/profile";


export const getErrorMessage = (
  error: unknown,
  fallback = "Что-то пошло не так. Попробуйте снова."
): string => {
  if (error && typeof error === "object") {
    if ("status" in error && (error as { status?: unknown }).status === "FETCH_ERROR") {
      return "Нет связи с сервером. Проверьте, что API запущен.";
    }
    if ("data" in error) {
      const data = (error as { data?: unknown }).data;
      if (data && typeof data === "object" && "message" in data) {
        const message = (data as { message?: unknown }).message;
        if (typeof message === "string") return message;
      }
    }
  }
  return fallback;
};
