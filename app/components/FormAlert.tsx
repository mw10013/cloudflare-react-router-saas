import type * as TechnicalDomain from "~/lib/technical-domain";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

/**
 * Displays an alert based on form action result.
 * @param props - Component props including success, message, details.
 */
export function FormAlert({
  success,
  message,
  details,
  className,
  ...props
}: React.ComponentProps<typeof Alert> & {
  success?: TechnicalDomain.FormActionResult["success"];
  message?: TechnicalDomain.FormActionResult["message"];
  details?: TechnicalDomain.FormActionResult["details"];
}) {
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
