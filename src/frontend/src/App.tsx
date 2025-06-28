import { useState } from "react";
import ReactIcon from "./assets/React-icon.webp";

// Import components and views
import { Loader, ErrorDisplay } from "./components";
import { GreetingView, CounterView, LlmPromptView } from "./views";
import { SmartContractChatView } from "./views/SmartContractChatView";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"chat" | "legacy">("chat");

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const sendTestRequest = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: "Hello" }],
          }),
        },
      );

      const data = await response.json();
      console.log("✅ OpenAI Response:", data);
    } catch (error) {
      console.error("❌ Error calling OpenAI:", error);
      handleError(String(error));
    }
  };

  {
    /* Test API Button - ADD THIS */
  }
  <div className="mt-8">
    <button
      onClick={sendTestRequest}
      className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
    >
      🧪 Test OpenAI API
    </button>
  </div>;

  {
    /* Footer */
  }
  <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm text-gray-400"></div>;

  const clearError = () => {
    setError(undefined);
  };

  const logoStyle = {
    animation: "logo-spin 60s linear infinite",
  };

  return (
    <>
      <style>
        {`
          @keyframes logo-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <div className="flex min-h-screen items-center justify-center bg-gray-800 text-white">
        <div className="mx-auto w-full max-w-6xl space-y-8 p-8 text-center">
          {/* React Logo */}
          <div className="mb-8">
            <a href="https://reactjs.org" target="_blank" rel="noreferrer">
              <img
                src={ReactIcon}
                className="mx-auto h-24 p-6 will-change-[filter] hover:drop-shadow-[0_0_2em_#61dafbaa] motion-reduce:animate-none"
                style={logoStyle}
                alt="React logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  handleError("🚫 React logo not found. Please check /assets.");
                }}
              />
            </a>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">🚀 Smart Contract Explainer</h1>
            <h2 className="text-xl">
              AI-Powered Blockchain Development Assistant
            </h2>
            <p className="mx-auto max-w-2xl text-gray-300">
              Get instant explanations, security audits, and optimization
              suggestions for your smart contracts
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mx-auto flex max-w-md justify-center space-x-1 rounded-lg bg-gray-700 p-1">
            <button
              onClick={() => {
                setActiveTab("chat");
                clearError();
              }}
              className={`rounded-md px-6 py-2 transition-colors ${
                activeTab === "chat"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-600 hover:text-white"
              }`}
            >
              🤖 Smart Contract Chat
            </button>
            <button
              onClick={() => {
                setActiveTab("legacy");
                clearError();
              }}
              className={`rounded-md px-6 py-2 transition-colors ${
                activeTab === "legacy"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-600 hover:text-white"
              }`}
            >
              🛠️ Basic Tools
            </button>
          </div>

          {/* Content Based on Active Tab */}
          <div className="space-y-6">
            {activeTab === "chat" ? (
              <SmartContractChatView
                onError={handleError}
                setLoading={setLoading}
              />
            ) : (
              <div className="space-y-6">
                <GreetingView onError={handleError} setLoading={setLoading} />
                <CounterView onError={handleError} setLoading={setLoading} />
                <LlmPromptView onError={handleError} setLoading={setLoading} />
              </div>
            )}
          </div>

          {/* Loading/Error Feedback */}
          {loading && !error && <Loader />}
          {error && (
            <div className="space-y-2">
              <ErrorDisplay message={error} />
              <button
                onClick={clearError}
                className="text-sm text-blue-400 underline hover:text-blue-300"
              >
                Clear Error
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>Built with React + Rust + Internet Computer</p>
            <p className="mt-2">
              💡 <strong>Tip:</strong> Paste your smart contract code and ask
              specific questions for the best results
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
