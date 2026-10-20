type FeedbackMessageProps = {
  message: string;
  onDismiss: () => void;
};

export default function FeedbackMessage({
  message,
  onDismiss,
}: FeedbackMessageProps) {
  return (
    <div
      className="mt-4 flex items-center justify-between gap-3 rounded-[0.625rem] border border-danger/30 bg-danger/5 p-3 text-xs leading-relaxed text-danger-light"
      role="alert"
    >
      <span>{message}</span>
      <button
        className="min-h-10 flex-none rounded-[0.625rem] border border-foreground/15 px-3 text-xs text-text-subtle hover:bg-foreground/5"
        onClick={onDismiss}
        aria-label="Fechar aviso"
      >
        Fechar
      </button>
    </div>
  );
}
