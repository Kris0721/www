import { ChangeEvent, useState } from "react";
import { Button, Card, InputField } from "../components";
import { backendService } from "../services/backendService";

interface GreetingViewProps {
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * GreetingView component for handling the greeting functionality
 */
export function GreetingView({ onError, setLoading }: GreetingViewProps) {
  const [name, setName] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  const handleChangeText = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const fetchGreeting = async () => {
    if (!name.trim()) {
      onError("⚠️ Please enter a name.");
      return;
    }

    try {
      setLoading(true);
      const res = await backendService.greet(name);
      setResponse(res);
    } catch (err) {
      console.error("Greeting error:", err);
      onError("❌ Failed to fetch greeting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Greeting">
      <div className="space-y-4">
        <InputField
          value={name}
          onChange={handleChangeText}
          placeholder="Enter your name"
        />
        <Button onClick={fetchGreeting}>Get Greeting</Button>

        {response && (
          <div className="mt-4 rounded bg-gray-700 p-4 font-bold text-green-400">
            {response}
          </div>
        )}
      </div>
    </Card>
  );
}
