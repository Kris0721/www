import { ChangeEvent, useState, useRef, useEffect } from "react";
import { Button, Card, TextArea } from "../components";
import { backendService } from "../services/backendService";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface SmartContractChatViewProps {
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * SmartContractChatView component for interactive smart contract explanations
 */
export function SmartContractChatView({
  onError,
  setLoading,
}: SmartContractChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [contractCode, setContractCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showContractInput, setShowContractInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      content:
        "👋 Hi! I'm your Smart Contract Expert Assistant. I can help you:\n\n• Explain smart contract code\n• Identify security vulnerabilities\n• Suggest optimizations\n• Answer blockchain questions\n• Review contract logic\n\nFeel free to paste your contract code or ask me anything about smart contracts!",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleMessageChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setCurrentMessage(event.target.value);
  };

  const handleContractCodeChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setContractCode(event.target.value);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);
    setLoading(true);

    try {
      let response: string;

      if (contractCode.trim()) {
        // Use smart contract explanation function
        response = await backendService.explainSmartContract(
          contractCode,
          currentMessage,
        );
      } else {
        // Use regular chat with context
        response = await backendService.sendChatMessage(currentMessage);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      onError(String(err));
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await backendService.clearChatHistory();
      setMessages([]);
      setContractCode("");

      // Re-add welcome message
      const welcomeMessage: Message = {
        id: "welcome-new",
        content:
          "Chat cleared! Ready to help with more smart contract questions.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (err) {
      console.error(err);
      onError(String(err));
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Simple formatting for code blocks and lists
    return content.split("\n").map((line, index) => {
      if (line.startsWith("```")) {
        return (
          <div
            key={index}
            className="my-1 rounded bg-gray-900 p-2 font-mono text-sm"
          >
            {line.replace("```", "")}
          </div>
        );
      }
      if (line.startsWith("•") || line.startsWith("-")) {
        return (
          <div key={index} className="ml-4">
            {line}
          </div>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }
      return <div key={index}>{line}</div>;
    });
  };

  return (
    <Card title="🤖 Smart Contract Expert Chat" className="max-w-4xl">
      <div className="space-y-4">
        {/* Contract Code Input Section */}
        <div className="border-b border-gray-600 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Smart Contract Code (Optional)
            </label>
            <Button
              onClick={() => setShowContractInput(!showContractInput)}
              className="px-2 py-1 text-xs"
            >
              {showContractInput ? "Collapse" : "Add Contract"}
            </Button>
          </div>

          {showContractInput && (
            <TextArea
              value={contractCode}
              onChange={handleContractCodeChange}
              placeholder="Paste your smart contract code here (Solidity, Rust, etc.)..."
              rows={8}
              className="font-mono text-sm"
            />
          )}

          {contractCode && (
            <div className="mt-1 text-xs text-green-400">
              ✅ Contract code loaded - questions will include contract analysis
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto rounded-lg border border-gray-600 bg-gray-900 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {formatMessage(message.content)}
                  </div>
                  <div className="mt-1 text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-700 p-3 text-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <TextArea
            value={currentMessage}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask about smart contracts, security, gas optimization, or paste contract code..."
            rows={2}
            disabled={isLoading}
            className="flex-1"
          />
          <div className="flex flex-col space-y-2">
            <Button
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim()}
              className="px-6 py-2"
            >
              {isLoading ? "..." : "Send"}
            </Button>
            <Button
              onClick={clearChat}
              disabled={isLoading}
              className="bg-red-600 px-6 py-2 hover:bg-red-700"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 border-t border-gray-600 pt-2">
          <Button
            onClick={() =>
              setCurrentMessage(
                "Explain this smart contract and its main functions",
              )
            }
            className="bg-purple-600 px-2 py-1 text-xs hover:bg-purple-700"
            disabled={isLoading}
          >
            📋 Explain Contract
          </Button>
          <Button
            onClick={() =>
              setCurrentMessage(
                "Check this contract for security vulnerabilities",
              )
            }
            className="bg-red-600 px-2 py-1 text-xs hover:bg-red-700"
            disabled={isLoading}
          >
            🔒 Security Check
          </Button>
          <Button
            onClick={() =>
              setCurrentMessage(
                "How can I optimize this contract for gas efficiency?",
              )
            }
            className="bg-green-600 px-2 py-1 text-xs hover:bg-green-700"
            disabled={isLoading}
          >
            ⛽ Gas Optimization
          </Button>
          <Button
            onClick={() =>
              setCurrentMessage(
                "What are the best practices for this type of contract?",
              )
            }
            className="bg-blue-600 px-2 py-1 text-xs hover:bg-blue-700"
            disabled={isLoading}
          >
            ✨ Best Practices
          </Button>
        </div>
      </div>
    </Card>
  );
}
