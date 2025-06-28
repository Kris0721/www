import { useState } from "react";
import ReactIcon from "./assets/React-icon.webp";

// Import individual components
import { Loader } from "./src/components/Loader";
import { ErrorDisplay } from "./src/components/ErrorDisplay";

// Import views
import { GreetingView } from "./src/views/GreetingView";
import { CounterView } from "./src/views/CounterView";
import { LlmPromptView } from "./src/views/LlmPromptView";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const logoStyle = {
    animation: "logo-spin 60s linear infinite",
  };

  return (
    <>
      {/* Custom animation styling */}
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

      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="mx-auto w-full max-w-4xl space-y-10 p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <a href="https://reactjs.org" target="_blank" rel="noreferrer">
              <img
                src={ReactIcon}
                className="mx-auto h-24 p-4 will-change-[filter] hover:drop-shadow-[0_0_2em_#61dafbaa] motion-reduce:animate-none"
                style={logoStyle}
                alt="React logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  handleError("🚫 React logo not found. Please check /assets.");
                }}
              />
            </a>
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Vibe Coding Template</h1>
            <h2 className="text-xl">React + Rust + Internet Computer</h2>
          </div>

          {/* Views */}
          <div className="space-y-8">
            <GreetingView onError={handleError} setLoading={setLoading} />
            <CounterView onError={handleError} setLoading={setLoading} />
            <LlmPromptView onError={handleError} setLoading={setLoading} />
          </div>

          {/* Feedback: Loading or Error */}
          {loading && !error && <Loader />}
          {error && <ErrorDisplay message={error} />}
        </div>
      </div>
    </>
  );
}

export default App;
