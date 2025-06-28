import { useState, useEffect } from "react";
import { Button, Card } from "../components";
import { backendService } from "../services/backendService";

interface CounterViewProps {
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * CounterView component for handling the counter functionality
 */
export function CounterView({ onError, setLoading }: CounterViewProps) {
  const [count, setCount] = useState<bigint>(BigInt(0));
  const [localLoading, setLocalLoading] = useState(false);

  const fetchCount = async () => {
    try {
      setLocalLoading(true);
      setLoading(true);
      const res = await backendService.getCount();
      setCount(res);
    } catch (err) {
      console.error("Fetch count error:", err);
      onError("❌ Failed to fetch count.");
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  const incrementCounter = async () => {
    try {
      setLocalLoading(true);
      setLoading(true);
      const res = await backendService.incrementCounter();
      setCount(res);
    } catch (err) {
      console.error("Increment counter error:", err);
      onError("❌ Failed to increment counter.");
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  // Fetch initial count on mount
  // Fetch initial count when component mounts
  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <Card title={`Counter: ${count.toString()}`}>
      <div className="flex gap-4">
        <Button onClick={incrementCounter} disabled={localLoading}>
          ➕ Increment
        </Button>
        <Button onClick={fetchCount} disabled={localLoading}>
          🔄 Refresh Count
        </Button>
      </div>
    </Card>
  );
}
