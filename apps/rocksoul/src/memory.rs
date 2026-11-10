use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RunRecord {
    pub id: String,
    pub goal: String,
    pub answer: String,
    pub steps: usize,
    pub ok: bool,
    pub model: String,
    pub started_at: String,
    pub finished_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LlmConfig {
    pub base_url: String,
    pub model: String,
    pub api_key: String,
    pub max_steps: usize,
}

impl Default for LlmConfig {
    fn default() -> Self {
        Self {
            base_url: std::env::var("ROCKSOUL_LLM_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:11434/v1".into()),
            model: std::env::var("ROCKSOUL_LLM_MODEL").unwrap_or_else(|_| "qwen2.5:7b".into()),
            api_key: std::env::var("ROCKSOUL_LLM_KEY").unwrap_or_default(),
            max_steps: 8,
        }
    }
}

pub struct Memory {
    root: PathBuf,
}

impl Memory {
    pub fn open(root: PathBuf) -> std::io::Result<Self> {
        fs::create_dir_all(&root)?;
        Ok(Self { root })
    }

    fn runs_path(&self) -> PathBuf {
        self.root.join("runs.jsonl")
    }

    fn config_path(&self) -> PathBuf {
        self.root.join("config.json")
    }

    pub fn append(&self, record: &RunRecord) -> std::io::Result<()> {
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(self.runs_path())?;
        let line = serde_json::to_string(record)?;
        writeln!(file, "{line}")
    }

    pub fn history(&self, limit: usize) -> Vec<RunRecord> {
        let Ok(file) = fs::File::open(self.runs_path()) else {
            return Vec::new();
        };
        let mut runs: Vec<RunRecord> = BufReader::new(file)
            .lines()
            .map_while(Result::ok)
            .filter_map(|line| serde_json::from_str(&line).ok())
            .collect();
        runs.reverse();
        runs.truncate(limit);
        runs
    }

    pub fn recall(&self, keyword: &str, limit: usize) -> Vec<RunRecord> {
        let needle = keyword.trim().to_lowercase();
        self.history(500)
            .into_iter()
            .filter(|run| {
                needle.is_empty()
                    || run.goal.to_lowercase().contains(&needle)
                    || run.answer.to_lowercase().contains(&needle)
            })
            .take(limit)
            .collect()
    }

    pub fn load_config(&self) -> LlmConfig {
        fs::read_to_string(self.config_path())
            .ok()
            .and_then(|raw| serde_json::from_str(&raw).ok())
            .unwrap_or_default()
    }

    pub fn save_config(&self, config: &LlmConfig) -> std::io::Result<()> {
        fs::write(self.config_path(), serde_json::to_vec_pretty(config)?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scratch() -> Memory {
        let dir = std::env::temp_dir().join(format!("rocksoul-test-{}", uuid::Uuid::new_v4()));
        Memory::open(dir).expect("scratch memory")
    }

    fn record(goal: &str, answer: &str) -> RunRecord {
        RunRecord {
            id: uuid::Uuid::new_v4().to_string(),
            goal: goal.into(),
            answer: answer.into(),
            steps: 1,
            ok: true,
            model: "m".into(),
            started_at: "t0".into(),
            finished_at: "t1".into(),
        }
    }

    #[test]
    fn history_is_newest_first_and_recall_filters() {
        let memory = scratch();
        memory.append(&record("probe mesh", "9/9 online")).unwrap();
        memory.append(&record("cpu load", "12%")).unwrap();
        let history = memory.history(10);
        assert_eq!(history.len(), 2);
        assert_eq!(history[0].goal, "cpu load");
        let hits = memory.recall("MESH", 5);
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].answer, "9/9 online");
    }

    #[test]
    fn config_roundtrips() {
        let memory = scratch();
        let mut config = memory.load_config();
        config.model = "riot-7b".into();
        memory.save_config(&config).unwrap();
        assert_eq!(memory.load_config().model, "riot-7b");
    }
}
