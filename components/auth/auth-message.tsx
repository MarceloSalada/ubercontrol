type AuthMessageProps = {
  error?: string;
  success?: string;
};

export function AuthMessage({ error, success }: AuthMessageProps) {
  const visibleError =
    error && error.includes("NEXT_REDIRECT") ? undefined : error;

  if (!visibleError && !success) return null;

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "12px 14px",
        background: visibleError ? "rgba(220, 38, 38, 0.12)" : "rgba(22, 163, 74, 0.12)",
        border: visibleError
          ? "1px solid rgba(248, 113, 113, 0.35)"
          : "1px solid rgba(74, 222, 128, 0.35)",
        color: visibleError ? "#fecaca" : "#bbf7d0",
        fontSize: 14,
      }}
    >
      {visibleError ?? success}
    </div>
  );
}
