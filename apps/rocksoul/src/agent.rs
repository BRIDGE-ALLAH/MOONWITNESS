use serde::Serialize;
use serde_json::{json, Value};
use std::time::Duration;

use crate::memory::{LlmConfig, Memory, RunRecord};
use crate::tools;

#[derive(Debug, PartialEq)]
pub enum Action {
    Tool {
        thought: String,
        tool: String,
        input: String,
    },
    Final {
        thought: String,
        answer: String,
    },
}

#[derive(Serialize, Clone)]
pub struct Step {
    pub run_id: String,
    pub index: usize,
    pub kind: &'static str,
    pub thought: String,
    pub tool: Option<String>,
    pub input: Option<String>,
    pub output: Value,
}

fn system_prompt() -> String {
    format!(
        "You are ROCKSOUL, a sovereign autonomous operator. Think with chaos, act with discipline. \
         Never invent data: every fact you state must come from a tool observation.\n\
         TOOLS:\n{}\n\n\
         Reply with EXACTLY one JSON object and nothing else:\n\
         {{\"thought\": \"...\", \"tool\": \"<tool name>\", \"input\": \"<string>\"}}\n\
         or when done:\n\
         {{\"thought\": \"...\", \"final\": \"<answer for the operator>\"}}",
        tools::catalog()
    )
}

/// Extracts the first balanced JSON object from model output, tolerating code fences and prose.
pub fn parse_action(raw: &str) -> Result<Action, String> {
    let start = raw.find('{').ok_or("model reply contains no JSON object")?;
    let mut depth = 0i32;
    let mut in_str = false;
    let mut escaped = false;
    let mut end = None;
    for (offset, ch) in raw[start..].char_indices() {
        if in_str {
            match (escaped, ch) {
                (true, _) => escaped = false,
                (false, '\\') => escaped = true,
                (false, '"') => in_str = false,
                _ => {}
            }
            continue;
        }
        match ch {
            '"' => in_str = true,
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    end = Some(start + offset + 1);
                    break;
                }
            }
            _ => {}
        }
    }
    let end = end.ok_or("unterminated JSON object in model reply")?;
    let obj: Value = serde_json::from_str(&raw[start..end]).map_err(|e| e.to_string())?;
    let thought = obj["thought"].as_str().unwrap_or_default().to_string();
    if let Some(answer) = obj["final"].as_str() {
        return Ok(Action::Final {
            thought,
            answer: answer.to_string(),
        });
    }
    let tool = obj["tool"]
        .as_str()
        .ok_or("JSON has neither `final` nor `tool`")?
        .to_string();
    let input = match &obj["input"] {
        Value::String(s) => s.clone(),
        Value::Null => String::new(),
        other => other.to_string(),
    };
    Ok(Action::Tool {
        thought,
        tool,
        input,
    })
}

async fn chat(
    client: &reqwest::Client,
    config: &LlmConfig,
    messages: &[Value],
) -> Result<String, String> {
    let url = format!("{}/chat/completions", config.base_url.trim_end_matches('/'));
    let mut req = client
        .post(&url)
        .timeout(Duration::from_secs(120))
        .json(&json!({ "model": config.model, "messages": messages, "temperature": 0.4 }));
    if !config.api_key.is_empty() {
        req = req.bearer_auth(&config.api_key);
    }
    let resp = req
        .send()
        .await
        .map_err(|e| format!("LLM endpoint {url} unreachable: {e}"))?;
    let status = resp.status();
    let body: Value = resp.json().await.map_err(|e| e.to_string())?;
    if !status.is_success() {
        return Err(format!("LLM HTTP {status}: {body}"));
    }
    body["choices"][0]["message"]["content"]
        .as_str()
        .map(str::to_string)
        .ok_or_else(|| format!("LLM reply missing content: {body}"))
}

pub async fn run(
    client: &reqwest::Client,
    memory: &Memory,
    config: &LlmConfig,
    goal: &str,
    mut emit: impl FnMut(Step),
) -> RunRecord {
    let run_id = uuid::Uuid::new_v4().to_string();
    let started_at = chrono::Utc::now().to_rfc3339();
    let mut messages = vec![
        json!({"role": "system", "content": system_prompt()}),
        json!({"role": "user", "content": goal}),
    ];
    let mut outcome: Result<String, String> =
        Err(format!("step budget of {} exhausted", config.max_steps));
    let mut steps = 0;

    for index in 0..config.max_steps {
        steps = index + 1;
        let reply = match chat(client, config, &messages).await {
            Ok(reply) => reply,
            Err(err) => {
                outcome = Err(err);
                break;
            }
        };
        messages.push(json!({"role": "assistant", "content": reply}));
        match parse_action(&reply) {
            Ok(Action::Final { thought, answer }) => {
                emit(Step {
                    run_id: run_id.clone(),
                    index,
                    kind: "final",
                    thought,
                    tool: None,
                    input: None,
                    output: json!(answer),
                });
                outcome = Ok(answer);
                break;
            }
            Ok(Action::Tool {
                thought,
                tool,
                input,
            }) => {
                let observation = match tools::execute(client, memory, &tool, &input).await {
                    Ok(value) => value,
                    Err(err) => json!({ "error": err }),
                };
                emit(Step {
                    run_id: run_id.clone(),
                    index,
                    kind: "tool",
                    thought,
                    tool: Some(tool),
                    input: Some(input),
                    output: observation.clone(),
                });
                messages.push(json!({"role": "user", "content": format!("OBSERVATION: {observation}")}));
            }
            Err(err) => {
                emit(Step {
                    run_id: run_id.clone(),
                    index,
                    kind: "error",
                    thought: String::new(),
                    tool: None,
                    input: None,
                    output: json!({ "parse_error": err, "raw": reply }),
                });
                messages.push(json!({"role": "user", "content": format!("INVALID REPLY ({err}). Answer with one JSON object only.")}));
            }
        }
    }

    let (ok, answer) = match outcome {
        Ok(answer) => (true, answer),
        Err(err) => {
            emit(Step {
                run_id: run_id.clone(),
                index: steps,
                kind: "error",
                thought: String::new(),
                tool: None,
                input: None,
                output: json!({ "error": err }),
            });
            (false, err)
        }
    };
    RunRecord {
        id: run_id,
        goal: goal.to_string(),
        answer,
        steps,
        ok,
        model: config.model.clone(),
        started_at,
        finished_at: chrono::Utc::now().to_rfc3339(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_tool_call_inside_fences() {
        let raw = "sure\n```json\n{\"thought\":\"check {mesh}\",\"tool\":\"mesh_probe\",\"input\":\"\"}\n```";
        assert_eq!(
            parse_action(raw).unwrap(),
            Action::Tool {
                thought: "check {mesh}".into(),
                tool: "mesh_probe".into(),
                input: String::new()
            }
        );
    }

    #[test]
    fn parses_final_and_non_string_input() {
        assert!(matches!(
            parse_action("{\"thought\":\"x\",\"final\":\"9/9 online\"}").unwrap(),
            Action::Final { answer, .. } if answer == "9/9 online"
        ));
        assert!(matches!(
            parse_action("{\"tool\":\"http_get\",\"input\":{\"u\":1}}").unwrap(),
            Action::Tool { input, .. } if input == "{\"u\":1}"
        ));
    }

    #[test]
    fn rejects_garbage() {
        assert!(parse_action("no json here").is_err());
        assert!(parse_action("{\"thought\":\"x\"}").is_err());
        assert!(parse_action("{\"tool\":\"a\"").is_err());
    }
}
