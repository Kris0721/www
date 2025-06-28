use candid::{CandidType, Deserialize};
use ic_llm::{ChatMessage, Model};

use std::cell::RefCell;

// Struct to store conversation history
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ConversationEntry {
    pub timestamp: u64,
    pub user_message: String,
    pub bot_response: String,
    pub contract_type: Option<String>,
}

// Struct for smart contract analysis
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ContractAnalysis {
    pub contract_type: String,
    pub programming_language: String,
    pub key_functions: Vec<String>,
    pub security_notes: Vec<String>,
    pub explanation: String,
}

thread_local! {
    static CONVERSATION_HISTORY: RefCell<Vec<ConversationEntry>> = const { RefCell::new(Vec::new()) };
    static COUNTER: RefCell<u64> = const { RefCell::new(0) };
}

// System prompt for the smart contract bot
const SYSTEM_PROMPT: &str = r#"
You are a smart contract expert and educator. Your role is to:

1. Explain smart contracts in simple, understandable terms
2. Analyze smart contract code and identify key components
3. Highlight security considerations and best practices
4. Help users understand different blockchain platforms (Ethereum, Internet Computer, Solana, etc.)
5. Explain concepts like gas fees, consensus mechanisms, and DeFi protocols
6. Provide educational content about blockchain technology

Always be helpful, accurate, and educational. Break down complex concepts into digestible explanations.
When analyzing code, focus on:
- What the contract does
- Key functions and their purposes
- Potential security risks
- Gas optimization opportunities
- Best practices being followed or missed

Keep responses concise but comprehensive. Use examples when helpful.
"#;

#[ic_cdk::update]
async fn explain_smart_contract(contract_code: String, user_question: Option<String>) -> String {
    let question =
        user_question.unwrap_or_else(|| "Please explain this smart contract code.".to_string());

    let prompt = format!(
        "Here's a smart contract code:\n\n```\n{}\n```\n\nUser question: {}\n\nPlease provide a comprehensive explanation covering:\n1. What this contract does\n2. Key functions and their purposes\n3. Any security considerations\n4. Best practices used or missing",
        contract_code, question
    );

    let messages = vec![
        ChatMessage::System {
            content: SYSTEM_PROMPT.to_string(),
        },
        ChatMessage::User {
            content: prompt.clone(),
        },
    ];

    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages)
        .send()
        .await;

    let bot_response = response.message.content.unwrap_or_default();

    // Store in conversation history
    CONVERSATION_HISTORY.with(|history| {
        let entry = ConversationEntry {
            timestamp: ic_cdk::api::time(),
            user_message: prompt,
            bot_response: bot_response.clone(),
            contract_type: detect_contract_type(&contract_code),
        };
        history.borrow_mut().push(entry);
    });

    bot_response
}

#[ic_cdk::update]
async fn ask_smart_contract_question(question: String) -> String {
    let messages = vec![
        ChatMessage::System {
            content: SYSTEM_PROMPT.to_string(),
        },
        ChatMessage::User {
            content: question.clone(),
        },
    ];

    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages)
        .send()
        .await;

    let bot_response = response.message.content.unwrap_or_default();

    // Store in conversation history
    CONVERSATION_HISTORY.with(|history| {
        let entry = ConversationEntry {
            timestamp: ic_cdk::api::time(),
            user_message: question,
            bot_response: bot_response.clone(),
            contract_type: None,
        };
        history.borrow_mut().push(entry);
    });

    bot_response
}

#[ic_cdk::update]
async fn analyze_contract_security(contract_code: String) -> String {
    let prompt = format!(
        "Perform a security analysis of this smart contract:\n\n```\n{}\n```\n\nPlease identify:\n1. Potential security vulnerabilities\n2. Common attack vectors that could be exploited\n3. Best practices that are missing\n4. Recommendations for improvement\n5. Gas optimization opportunities",
        contract_code
    );

    let messages = vec![
        ChatMessage::System {
            content: SYSTEM_PROMPT.to_string(),
        },
        ChatMessage::User {
            content: prompt.clone(),
        },
    ];

    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages)
        .send()
        .await;

    let bot_response = response.message.content.unwrap_or_default();

    // Store in conversation history
    CONVERSATION_HISTORY.with(|history| {
        let entry = ConversationEntry {
            timestamp: ic_cdk::api::time(),
            user_message: prompt,
            bot_response: bot_response.clone(),
            contract_type: detect_contract_type(&contract_code),
        };
        history.borrow_mut().push(entry);
    });

    bot_response
}

#[ic_cdk::update]
async fn explain_blockchain_concept(concept: String) -> String {
    let prompt = format!(
        "Please explain the blockchain/smart contract concept: '{}'\n\nProvide:\n1. A clear definition\n2. How it works\n3. Why it's important\n4. Real-world examples or use cases\n5. Any related concepts I should know about",
        concept
    );

    let messages = vec![
        ChatMessage::System {
            content: SYSTEM_PROMPT.to_string(),
        },
        ChatMessage::User {
            content: prompt.clone(),
        },
    ];

    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages)
        .send()
        .await;

    let bot_response = response.message.content.unwrap_or_default();

    // Store in conversation history
    CONVERSATION_HISTORY.with(|history| {
        let entry = ConversationEntry {
            timestamp: ic_cdk::api::time(),
            user_message: prompt,
            bot_response: bot_response.clone(),
            contract_type: None,
        };
        history.borrow_mut().push(entry);
    });

    bot_response
}

#[ic_cdk::query]
fn get_conversation_history() -> Vec<ConversationEntry> {
    CONVERSATION_HISTORY.with(|history| history.borrow().clone())
}

#[ic_cdk::query]
fn get_recent_conversations(limit: usize) -> Vec<ConversationEntry> {
    CONVERSATION_HISTORY.with(|history| {
        let conversations = history.borrow();
        let start = if conversations.len() > limit {
            conversations.len() - limit
        } else {
            0
        };
        conversations[start..].to_vec()
    })
}

#[ic_cdk::update]
fn clear_conversation_history() -> String {
    CONVERSATION_HISTORY.with(|history| {
        history.borrow_mut().clear();
    });
    "Conversation history cleared successfully.".to_string()
}

// Helper function to detect contract type from code
fn detect_contract_type(code: &str) -> Option<String> {
    let code_lower = code.to_lowercase();

    if code_lower.contains("pragma solidity")
        || code_lower.contains("contract ")
        || code_lower.contains("interface ")
    {
        Some("Solidity".to_string())
    } else if code_lower.contains("use anchor_lang")
        || code_lower.contains("anchor_program")
        || code_lower.contains("#[program]")
    {
        Some("Anchor (Solana)".to_string())
    } else if code_lower.contains("use near_sdk") || code_lower.contains("#[near_bindgen]") {
        Some("NEAR".to_string())
    } else if code_lower.contains("use ic_cdk") || code_lower.contains("#[ic_cdk::") {
        Some("Internet Computer".to_string())
    } else if code_lower.contains("use cosmwasm") || code_lower.contains("#[entry_point]") {
        Some("CosmWasm".to_string())
    } else {
        None
    }
}
