use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{info, warn, error};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CrdtType {
    LwwRegister,
    OrSet,
    Rga,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LwwRegister<T> {
    pub value: T,
    pub timestamp: u64,
    pub actor_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrSet {
    pub adds: HashMap<String, HashSet<String>>,
    pub removes: HashSet<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rga {
    pub elements: Vec<RgaElement>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RgaElement {
    pub id: String,
    pub value: String,
    pub origin_left: Option<String>,
    pub origin_right: Option<String>,
    pub deleted: bool,
    pub actor_id: String,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CrdtValue {
    Lww(LwwRegister<serde_json::Value>),
    OrSet(OrSet),
    Rga(Rga),
}

impl CrdtValue {
    pub fn merge(&self, other: &Self) -> Result<Self> {
        match (self, other) {
            (CrdtValue::Lww(a), CrdtValue::Lww(b)) => Ok(CrdtValue::Lww(LwwRegister::merge(a, b)?)),
            (CrdtValue::OrSet(a), CrdtValue::OrSet(b)) => Ok(CrdtValue::OrSet(OrSet::merge(a, b)?)),
            (CrdtValue::Rga(a), CrdtValue::Rga(b)) => Ok(CrdtValue::Rga(Rga::merge(a, b)?)),
            _ => anyhow::bail!("Crdt type mismatch for merge"),
        }
    }
}

impl<T: Clone + Serialize + for<'de> Deserialize<'de> + PartialEq + Eq + std::hash::Hash> LwwRegister<T> {
    pub fn new(value: T, actor_id: String) -> Self {
        Self {
            value,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
            actor_id,
        }
    }

    pub fn merge(a: &Self, b: &Self) -> Result<Self> {
        if a.timestamp > b.timestamp {
            Ok(a.clone())
        } else if b.timestamp > a.timestamp {
            Ok(b.clone())
        } else {
            // Tie-break by actor_id
            if a.actor_id > b.actor_id {
                Ok(a.clone())
            } else {
                Ok(b.clone())
            }
        }
    }
}

impl OrSet {
    pub fn new() -> Self {
        Self {
            adds: HashMap::new(),
            removes: HashSet::new(),
        }
    }

    pub fn add(&mut self, value: serde_json::Value, tag: String) {
        let key = serde_json::to_string(&value).unwrap();
        self.adds.entry(key).or_default().insert(tag);
    }

    pub fn remove(&mut self, tag: String) {
        self.removes.insert(tag);
    }

    pub fn contains(&self, value: &serde_json::Value) -> bool {
        let key = serde_json::to_string(value).unwrap();
        self.adds.get(&key).map_or(false, |tags| {
            tags.iter().any(|tag| !self.removes.contains(tag))
        })
    }

    pub fn values(&self) -> Vec<serde_json::Value> {
        self.adds
            .iter()
            .filter_map(|(v, tags)| {
                if tags.iter().any(|tag| !self.removes.contains(tag)) {
                    serde_json::from_str(v).ok()
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn merge(a: &Self, b: &Self) -> Result<Self> {
        let mut result = Self::new();

        // Union of adds
        for (value, tags) in &a.adds {
            for tag in tags {
                result.adds.entry(value.clone()).or_default().insert(tag.clone());
            }
        }
        for (value, tags) in &b.adds {
            for tag in tags {
                result.adds.entry(value.clone()).or_default().insert(tag.clone());
            }
        }

        // Union of removes
        for tag in &a.removes {
            result.remove(tag.clone());
        }
        for tag in &b.removes {
            result.remove(tag.clone());
        }

        Ok(result)
    }
}

impl Rga {
    pub fn new() -> Self {
        Self { elements: vec![] }
    }

    pub fn insert(&mut self, value: String, origin_left: Option<String>, actor_id: String) {
        let element = RgaElement {
            id: Uuid::new_v4().to_string(),
            value,
            origin_left,
            origin_right: None,
            deleted: false,
            actor_id,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
        };
        self.elements.push(element);
    }

    pub fn delete(&mut self, id: &str) {
        if let Some(elem) = self.elements.iter_mut().find(|e| e.id == id) {
            elem.deleted = true;
        }
    }

    pub fn to_string(&self) -> String {
        self.elements
            .iter()
            .filter(|e| !e.deleted)
            .map(|e| e.value.as_str())
            .collect()
    }

    pub fn merge(a: &Self, b: &Self) -> Result<Self> {
        // Simplified RGA merge - in production use a proper implementation
        let mut result = a.clone();
        for elem in &b.elements {
            if !result.elements.iter().any(|e| e.id == elem.id) {
                result.elements.push(elem.clone());
            }
        }
        // Sort by timestamp for consistency
        result.elements.sort_by_key(|e| e.timestamp);
        Ok(result)
    }
}

pub struct ConflictResolver;

impl ConflictResolver {
    pub fn resolve(local: CrdtValue, remote: CrdtValue, _crdt_type: CrdtType) -> Result<CrdtValue> {
        local.merge(&remote)
    }
}