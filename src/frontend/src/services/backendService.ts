import { backend } from "../../../declarations/backend";

/**
 * Service for handling all backend canister API calls
 */
export const backendService = {
  /**
   * Sends a greeting to the backend and returns the response
   * @param name Name to greet
   * @returns Promise with the greeting response
   */
  async greet(name: string): Promise<string> {
    return await backend.greet(name || "World");
  },

  /**
   * Fetches the current counter value
   * @returns Promise with the current count
   */
  async getCount(): Promise<bigint> {
    return await backend.get_count();
  },

  /**
   * Increments the counter on the backend
   * @returns Promise with the new count
   */
  async incrementCounter(): Promise<bigint> {
    return await backend.increment();
  },

  /**
   * Sends a prompt to the LLM backend
   * @param prompt The user's prompt text
   * @returns Promise with the LLM response
   */
  async sendLlmPrompt(prompt: string): Promise<string> {
    return await backend.prompt(prompt);
  },

  /**
   * Explains a smart contract with optional code analysis
   * @param contractCode The smart contract code
   * @param question The user's question about the contract
   * @returns Promise with the explanation
   */
  async explainSmartContract(
    contractCode: string,
    question: string,
  ): Promise<string> {
    return await backend.explain_smart_contract(contractCode, question);
  },

  /**
   * Sends a chat message with context retention
   * @param message The user's message
   * @returns Promise with the AI response
   */
  async sendChatMessage(message: string): Promise<string> {
    return await backend.send_chat_message(message);
  },

  /**
   * Clears the chat history
   * @returns Promise with confirmation message
   */
  async clearChatHistory(): Promise<string> {
    return await backend.clear_chat_history();
  },

  /**
   * Gets the current chat history length
   * @returns Promise with the history length
   */
  async getChatHistoryLength(): Promise<bigint> {
    return await backend.get_chat_history_length();
  },
};
