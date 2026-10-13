import React from "react";

const ErrorBox = ({ title = "Something went wrong", error, onRetry, isRetrying }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-6">
    <h3 className="mb-2 font-semibold text-red-800">{title}</h3>
    <p className="text-sm text-red-600">
      {error?.response?.data?.responseMessage || error?.message || "Something went wrong"}
    </p>
    {onRetry && (
      <button
        onClick={() => onRetry()}
        disabled={isRetrying}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
      >
        {isRetrying ? "Retrying..." : "Retry"}
      </button>
    )}
  </div>
);

export default ErrorBox;
