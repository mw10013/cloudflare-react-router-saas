import * as ReactRouter from "react-router";
import React from "react";

/**
 * Creates a form submit handler that prevents default submission and uses the provided submit function.
 * @param submit - Submit function (e.g., useSubmit(), fetcher.submit)
 * @returns Event handler function for form onSubmit.
 */
export const onSubmitReactRouter =
  (submit: ReactRouter.SubmitFunction) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nativeEvent = e.nativeEvent;
    const submitter =
      nativeEvent instanceof SubmitEvent &&
      (nativeEvent.submitter instanceof HTMLButtonElement ||
        nativeEvent.submitter instanceof HTMLInputElement)
        ? nativeEvent.submitter
        : null;
    void submit(submitter ?? e.currentTarget, { method: "post" });
  };
