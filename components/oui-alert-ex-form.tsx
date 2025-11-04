import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import * as Rac from "react-aria-components";

export interface AlertExFormActionResult {
  success: boolean;
  message?: string;
  details?: string | string[];
  validationErrors?: Rac.FormProps["validationErrors"];
}

/**
 * Reusable wrapper for shadcn Alert that displays an alert based on form action result.
 * @param props - Component props including success, message, details.
 */
export function AlertExForm({
  success,
  message,
  details,
  className,
  ...props
}: React.ComponentProps<typeof Alert> &
  Partial<Pick<AlertExFormActionResult, "success" | "message" | "details">>) {
  const detailsArray = Array.isArray(details)
    ? details
    : details
      ? [details]
      : [];
  if (success === undefined) return null;
  if (!message && detailsArray.length === 0) return null;

  return (
    <Alert
      variant={success ? "default" : "destructive"}
      className={className}
      {...props}
    >
      {message && <AlertTitle>{message}</AlertTitle>}
      {detailsArray.length > 0 && (
        <AlertDescription>
          {detailsArray.map((detail, i) => (
            <div key={i}>{detail}</div>
          ))}
        </AlertDescription>
      )}
    </Alert>
  );
}
