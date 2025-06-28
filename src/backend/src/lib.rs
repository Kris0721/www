use ic_cdk::export_candid;
use ic_llm::{AssistantMessage, ChatMessage, Model};
use std::cell::RefCell;

// Store chat history for context
thread_local! {
    static CHAT_HISTORY: RefCell<Vec<ChatMessage>> = const { RefCell::new(Vec::new()) };
    static COUNTER: RefCell<u64> = const { RefCell::new(0) };
}

#[ic_cdk::update]
async fn explain_smart_contract(contract_code: String, question: String) -> String {
    let system_prompt = "You are a smart contract expert assistant. Your role is to explain smart contracts in a clear, educational manner. Focus on:
    1. Code functionality and logic
    2. Security considerations
    3. Gas optimization opportunities  
    4. Best practices
    5. Potential vulnerabilities
    6. Business logic explanation

    Always provide practical, actionable insights. If code is provided, analyze it step by step.";

    let user_message = if contract_code.trim().is_empty() {
        question
    } else {
        format!(
            "Here's a smart contract I'd like you to explain:\n\n```solidity\n{}\n```\n\nQuestion: {}",
            contract_code, question
        )
    };

    let messages = vec![
        ChatMessage::System {
            content: system_prompt.to_string(),
        },
        ChatMessage::User {
            content: user_message,
        },
    ];

    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages)
        .send()
        .await;

    response.message.content.unwrap_or_default()
}

#[ic_cdk::update]
async fn chat_with_context(message: String) -> Vec<ChatMessage> {
    CHAT_HISTORY.with(|history| {
        let mut hist = history.borrow_mut();
        // Add system message if this is the first message
        if hist.is_empty() {
            hist.push(ChatMessage::System {
                content: "You are a helpful smart contract expert. Explain smart contracts, blockchain concepts, and help users understand decentralized applications. Always be educational and provide clear examples.".to_string(),
            });
        }

        hist.push(ChatMessage::User { content: message });

        // Keep only the last 20 messages
        let len = hist.len();
        if len > 20 {
            hist.drain(0..len - 20);
        }


        hist.clone()
    })
}

#[ic_cdk::update]
async fn send_chat_message(message: String) -> String {
    let messages = chat_with_context(message).await;

    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages.clone())
        .send()
        .await;

    let response_content = response.message.content.unwrap_or_default();

    // Push assistant reply into chat history
    CHAT_HISTORY.with(|history| {
        history
            .borrow_mut()
            .push(ChatMessage::Assistant(AssistantMessage {
                content: Some(response_content.clone()),
                tool_calls: vec![],
            }));
    });

    response_content
}

#[ic_cdk::update]
fn clear_chat_history() -> String {
    CHAT_HISTORY.with(|history| {
        history.borrow_mut().clear();
    });
    "Chat history cleared!".to_string()
}

#[ic_cdk::query]
fn get_chat_history_length() -> u64 {
    CHAT_HISTORY.with(|history| history.borrow().len() as u64)
}

#[ic_cdk::update]
async fn prompt(prompt_str: String) -> String {
    ic_llm::prompt(Model::Llama3_1_8B, prompt_str).await
}

#[ic_cdk::update]
async fn chat(messages: Vec<ChatMessage>) -> String {
    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages)
        .send()
        .await;

    response.message.content.unwrap_or_default()
}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[ic_cdk::update]
fn increment() -> u64 {
    COUNTER.with(|counter| {
        let val = *counter.borrow() + 1;
        *counter.borrow_mut() = val;
        val
    })
}

#[ic_cdk::query]
fn get_count() -> u64 {
    COUNTER.with(|counter| *counter.borrow())
}

#[ic_cdk::update]
fn set_count(value: u64) -> u64 {
    COUNTER.with(|counter| {
        *counter.borrow_mut() = value;
        value
    })
}

export_candid!();
