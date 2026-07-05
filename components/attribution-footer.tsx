export function AttributionFooter() {
  return (
    <footer className="mt-auto border-t py-4 px-6 text-center text-xs text-muted-foreground">
      <p>
        AgentPath was built entirely by{" "}
        <a href="https://claude.ai/code" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          Claude (Anthropic)
        </a>{" "}
        using a personal setup called Lumbergh.{" "}
        <strong>This is not a competition entry.</strong> It is shared freely — fork it, improve it, translate it.{" "}
        Course content © Kaggle &amp; Google.
      </p>
    </footer>
  );
}
