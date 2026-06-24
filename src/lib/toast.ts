import { toast as sonner } from "sonner";

export const toast = {
  success: (message: string) => sonner.success(message),
  error: (message: string) => sonner.error(message),
  info: (message: string) => sonner.message(message),
  warning: (message: string, opts?: { duration?: number }) =>
    sonner.warning(message, opts),
};
