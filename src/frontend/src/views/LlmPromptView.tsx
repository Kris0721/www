import { ChangeEvent, useState } from "react";
import { Button, Card, TextArea } from "../components";
import { backendService } from "../services/backendService";

interface LlmPromptViewProps {
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

export function LlmPromptView({ onError, setLoading }: LlmPromptViewProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [llmResponse, setLlmResponse] = useState<string>("");
  const [llmLoading, setLlmLoading] = useState(false);

  const handleChangePrompt = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setPrompt(event.target.value);
  };

  const sendPrompt = async () => {
    if (!prompt.trim()) {
      onError("⚠️ Please enter a prompt.");
      return;
    }

    try {
      setLlmLoading(true);
      setLoading(true);
      const res = await backendService.sendLlmPrompt(prompt);
      setLlmResponse(res);
    } catch (err) {
      console.error("LLM Prompt Error:", err);
      onError("❌ Failed to get response from LLM.");
    } finally {
      setLlmLoading(false);
      setLoading(false);
    }
  };

  return (
    <Card title="LLM Prompt">
      <div className="space-y-4">
        <TextArea
          value={prompt}
          onChange={handleChangePrompt}
          placeholder="Ask the LLM something..."
        />
        <Button onClick={sendPrompt} disabled={llmLoading}>
          {llmLoading ? "Thinking..." : "Send Prompt"}
        </Button>
        {!!llmResponse && (
          <div className="mt-6 rounded bg-gray-800 p-4 text-left">
            <h4 className="mb-2 text-blue-400">Response:</h4>
            <p className="whitespace-pre-wrap text-white">{llmResponse}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
