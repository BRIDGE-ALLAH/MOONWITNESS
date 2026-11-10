use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::storage::surrealdb::SurrealLocal;
use crate::state::AppState;
use tracing::{info, warn, error};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitRepository {
    pub id: String,
    pub name: String,
    pub path: String,
    pub remote_url: Option<String>,
    pub branch: String,
    pub last_fetched: Option<chrono::DateTime<chrono::Utc>>,
    pub status: GitRepoStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitRepoStatus {
    pub current_branch: String,
    pub ahead: i32,
    pub behind: i32,
    pub dirty: bool,
    pub untracked_files: Vec<String>,
    pub staged_files: Vec<String>,
    pub unstaged_files: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitCommit {
    pub hash: String,
    pub short_hash: String,
    pub author: String,
    pub email: String,
    pub date: String,
    pub subject: String,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitDiff {
    pub files: Vec<GitDiffFile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitDiffFile {
    pub path: String,
    pub status: String,
    pub additions: i32,
    pub deletions: i32,
    pub patch: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitBranch {
    pub name: String,
    pub is_current: bool,
    pub is_remote: bool,
    pub upstream: Option<String>,
    pub last_commit: Option<GitCommit>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitRemote {
    pub name: String,
    pub url: String,
    pub fetch_refspec: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitStash {
    pub index: i32,
    pub message: String,
    pub branch: String,
    pub commit_hash: String,
    pub date: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitBlameLine {
    pub line_number: i32,
    pub commit_hash: String,
    pub author: String,
    pub date: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegisterRepoRequest {
    pub path: String,
    pub name: String,
    pub remote_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitRequest {
    pub message: String,
    pub sign: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PushRequest {
    pub remote: Option<String>,
    pub branch: Option<String>,
    pub force: Option<bool>,
}

async fn get_git_engine_url() -> String {
    std::env::var("GIT_ENGINE_URL").unwrap_or_else(|_| "http://localhost:3200".to_string())
}

async fn get_auth_token(state: &AppState) -> Result<String> {
    let jwt = crate::commands::auth::get_jwt_internal(state).await?;
    Ok(jwt)
}

async fn call_git_engine(method: &str, path: &str, body: Option<serde_json::Value>, state: &AppState) -> Result<reqwest::Response> {
    let base_url = get_git_engine_url().await;
    let url = format!("{}{}", base_url, path);
    let token = get_auth_token(state).await?;
    
    let client = reqwest::Client::new();
    let mut req = client.request(method.parse()?, &url)
        .bearer_auth(&token)
        .header("Content-Type", "application/json");
    
    if let Some(body) = body {
        req = req.json(&body);
    }
    
    let resp = req.send().await?;
    Ok(resp)
}

#[command]
pub async fn git_list_repos(state: State<'_, AppState>) -> Result<Vec<GitRepository>, String> {
    let resp = call_git_engine("GET", "/api/v1/repositories", None, &state).await.map_err(|e| e.to_string())?;
    
    if !resp.status().is_success() {
        return Err(format!("Git engine error: {}", resp.status()));
    }
    
    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let repos: Vec<GitRepository> = serde_json::from_value(data["items"].clone()).map_err(|e| e.to_string())?;
    Ok(repos)
}

#[command]
pub async fn git_register_repo(request: RegisterRepoRequest, state: State<'_, AppState>) -> Result<GitRepository, String> {
    let body = serde_json::json!({
        "name": request.name,
        "slug": request.name.to_lowercase().replace(" ", "-"),
        "description": "",
        "visibility": "private"
    });
    
    let resp = call_git_engine("POST", "/api/v1/repositories", Some(body), &state).await.map_err(|e| e.to_string())?;
    
    if !resp.status().is_success() {
        let err: serde_json::Value = resp.json().await.unwrap_or_default();
        return Err(err["error"].as_str().unwrap_or("Failed to register repository").to_string());
    }
    
    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    
    let repo = GitRepository {
        id: data["id"].as_str().unwrap_or("").to_string(),
        name: data["name"].as_str().unwrap_or("").to_string(),
        path: data["path"].as_str().unwrap_or("").to_string(),
        remote_url: request.remote_url,
        branch: "main".to_string(),
        last_fetched: None,
        status: GitRepoStatus {
            current_branch: "main".to_string(),
            ahead: 0,
            behind: 0,
            dirty: false,
            untracked_files: vec![],
            staged_files: vec![],
            unstaged_files: vec![],
        },
    };
    
    // Store in local SurrealDB
    let query = r#"
        UPSERT git_repositories SET 
            name = $name, path = $path, remote_url = $remote_url, branch = $branch
    "#;
    state.db.query(query)
        .bind(("name", repo.name.clone()))
        .bind(("path", repo.path.clone()))
        .bind(("remote_url", repo.remote_url.clone()))
        .bind(("branch", repo.branch.clone()))
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(repo)
}

#[command]
pub async fn git_open_repo(path: String, state: State<'_, AppState>) -> Result<GitRepository, String> {
    let resp = call_git_engine("GET", "/api/v1/repositories", None, &state).await.map_err(|e| e.to_string())?;
    
    if !resp.status().is_success() {
        return Err("Failed to list repositories".to_string());
    }
    
    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let repos: Vec<serde_json::Value> = serde_json::from_value(data["items"].clone()).map_err(|e| e.to_string())?;
    
    let repo_data = repos.iter().find(|r| r["path"].as_str() == Some(&path))
        .ok_or_else(|| format!("Repository not found: {}", path))?;
    
    // Get status via git CLI
    let status = get_repo_status(&path).await?;
    
    Ok(GitRepository {
        id: repo_data["id"].as_str().unwrap_or("").to_string(),
        name: repo_data["name"].as_str().unwrap_or("").to_string(),
        path: repo_data["path"].as_str().unwrap_or("").to_string(),
        remote_url: None,
        branch: repo_data["default_branch"].as_str().unwrap_or("main").to_string(),
        last_fetched: None,
        status,
    })
}

async fn get_repo_status(path: &str) -> Result<GitRepoStatus> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(["-C", path, "status", "--porcelain=v1", "--branch"])
        .output()
        .map_err(|e| anyhow::anyhow!("Git status failed: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let lines: Vec<&str> = stdout.lines().collect();
    
    let mut current_branch = "main".to_string();
    let mut ahead = 0;
    let mut behind = 0;
    let mut dirty = false;
    let mut untracked_files = Vec::new();
    let mut staged_files = Vec::new();
    let mut unstaged_files = Vec::new();
    
    for line in lines {
        if line.starts_with("## ") {
            let branch_info = &line[3..];
            if let Some(idx) = branch_info.find("...") {
                current_branch = branch_info[..idx].to_string();
                let rest = &branch_info[idx+3..];
                if let Some(ahead_idx) = rest.find("ahead ") {
                    let ahead_str = &rest[ahead_idx+6..];
                    if let Some(end) = ahead_str.find(|c: char| !c.is_ascii_digit()) {
                        ahead = ahead_str[..end].parse().unwrap_or(0);
                    } else {
                        ahead = ahead_str.parse().unwrap_or(0);
                    }
                }
                if let Some(behind_idx) = rest.find("behind ") {
                    let behind_str = &rest[behind_idx+7..];
                    if let Some(end) = behind_str.find(|c: char| !c.is_ascii_digit()) {
                        behind = behind_str[..end].parse().unwrap_or(0);
                    } else {
                        behind = behind_str.parse().unwrap_or(0);
                    }
                }
            } else {
                current_branch = branch_info.trim().to_string();
            }
        } else if line.len() >= 3 {
            let status_code = &line[..2];
            let file_path = &line[3..];
            dirty = true;
            
            if status_code.starts_with("?") {
                untracked_files.push(file_path.to_string());
            } else {
                if status_code.chars().nth(0) != Some(' ') {
                    staged_files.push(file_path.to_string());
                }
                if status_code.chars().nth(1) != Some(' ') {
                    unstaged_files.push(file_path.to_string());
                }
            }
        }
    }
    
    Ok(GitRepoStatus {
        current_branch,
        ahead,
        behind,
        dirty,
        untracked_files,
        staged_files,
        unstaged_files,
    })
}

#[command]
pub async fn git_log(repo_path: String, limit: Option<i32>, offset: Option<i32>, state: State<'_, AppState>) -> Result<Vec<GitCommit>, String> {
    let limit = limit.unwrap_or(50);
    let offset = offset.unwrap_or(0);
    
    // First try git-engine API
    let resp = call_git_engine("GET", &format!("/api/v1/repositories/{}/commits?limit={}&offset={}", repo_path, limit, offset), None, &state).await;
    
    if let Ok(resp) = resp {
        if resp.status().is_success() {
            let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
            let commits: Vec<GitCommit> = serde_json::from_value(data["items"].clone()).map_err(|e| e.to_string())?;
            return Ok(commits);
        }
    }
    
    // Fallback to local git CLI
    use std::process::Command;
    let output = Command::new("git")
        .args(["-C", &repo_path, "log", &format!("-{}", limit), &format!("--skip={}", offset), "--pretty=format:%H\x1f%an\x1f%ae\x1f%at\x1f%s\x1f%B"])
        .output()
        .map_err(|e| format!("Git log failed: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let commits: Vec<GitCommit> = stdout
        .trim()
        .split("\n")
        .filter(|l| !l.is_empty())
        .map(|line| {
            let parts: Vec<&str> = line.split("\x1f").collect();
            GitCommit {
                hash: parts.get(0).unwrap_or(&"").to_string(),
                short_hash: parts.get(0).unwrap_or(&"").chars().take(7).collect(),
                author: parts.get(1).unwrap_or(&"Unknown").to_string(),
                email: parts.get(2).unwrap_or(&"").to_string(),
                date: parts.get(3).and_then(|ts| ts.parse::<i64>().ok())
                    .map(|ts| chrono::DateTime::from_timestamp(ts, 0).unwrap().to_rfc3339())
                    .unwrap_or_default(),
                subject: parts.get(4).unwrap_or(&"No commit message").to_string(),
                message: parts.get(5).map(|s| s.to_string()),
            }
        })
        .collect();
    
    Ok(commits)
}

#[command]
pub async fn git_diff(repo_path: String, commit_sha: Option<String>, state: State<'_, AppState>) -> Result<GitDiff, String> {
    use std::process::Command;
    
    let args = if let Some(sha) = commit_sha {
        vec!["-C", &repo_path, "diff", &sha]
    } else {
        vec!["-C", &repo_path, "diff", "HEAD"]
    };
    
    let output = Command::new("git")
        .args(&args)
        .output()
        .map_err(|e| format!("Git diff failed: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    
    let mut files = Vec::new();
    let mut current_file: Option<GitDiffFile> = None;
    let mut current_patch = String::new();
    
    for line in stdout.lines() {
        if line.starts_with("diff --git") {
            if let Some(f) = current_file.take() {
                files.push(GitDiffFile {
                    path: f.path,
                    status: f.status,
                    additions: f.additions,
                    deletions: f.deletions,
                    patch: current_patch.clone(),
                });
                current_patch.clear();
            }
            
            let parts: Vec<&str> = line.split_whitespace().collect();
            let path = parts.get(3).unwrap_or(&"").trim_start_matches("b/").to_string();
            current_file = Some(GitDiffFile {
                path,
                status: "modified".to_string(),
                additions: 0,
                deletions: 0,
                patch: String::new(),
            });
        } else if line.starts_with("+++") || line.starts_with("---") {
            current_patch.push_str(line);
            current_patch.push('\n');
        } else if line.starts_with("+") && !line.starts_with("+++") {
            current_patch.push_str(line);
            current_patch.push('\n');
            if let Some(f) = current_file.as_mut() {
                f.additions += 1;
            }
        } else if line.starts_with("-") && !line.starts_with("---") {
            current_patch.push_str(line);
            current_patch.push('\n');
            if let Some(f) = current_file.as_mut() {
                f.deletions += 1;
            }
        } else {
            current_patch.push_str(line);
            current_patch.push('\n');
        }
    }
    
    if let Some(f) = current_file.take() {
        files.push(GitDiffFile {
            path: f.path,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            patch: current_patch,
        });
    }
    
    Ok(GitDiff { files })
}

#[command]
pub async fn git_branch_list(repo_path: String, state: State<'_, AppState>) -> Result<Vec<GitBranch>, String> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(["-C", &repo_path, "branch", "-a", "-v"])
        .output()
        .map_err(|e| format!("Git branch failed: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut branches = Vec::new();
    
    for line in stdout.lines() {
        let line = line.trim();
        if line.is_empty() { continue; }
        
        let is_current = line.starts_with("* ");
        let line = line.trim_start_matches("* ").trim_start_matches("  ");
        
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 { continue; }
        
        let name = parts[0].trim_start_matches("remotes/").to_string();
        let is_remote = line.starts_with("remotes/");
        let commit_hash = parts[1].to_string();
        
        let upstream = if is_remote && parts.len() > 2 {
            Some(parts[2].to_string())
        } else {
            None
        };
        
        branches.push(GitBranch {
            name: name.clone(),
            is_current,
            is_remote,
            upstream,
            last_commit: Some(GitCommit {
                hash: commit_hash.clone(),
                short_hash: commit_hash.chars().take(7).collect(),
                author: "".to_string(),
                email: "".to_string(),
                date: "".to_string(),
                subject: "".to_string(),
                message: None,
            }),
        });
    }
    
    Ok(branches)
}

#[command]
pub async fn git_branch_create(repo_path: String, name: String, start_point: Option<String>, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let mut args = vec!["-C", &repo_path, "branch", &name];
    if let Some(start) = start_point {
        args.push(&start);
    }
    
    let output = Command::new("git")
        .args(&args)
        .output()
        .map_err(|e| format!("Git branch create failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_branch_delete(repo_path: String, name: String, force: Option<bool>, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let flag = if force.unwrap_or(false) { "-D" } else { "-d" };
    let output = Command::new("git")
        .args(["-C", &repo_path, "branch", flag, &name])
        .output()
        .map_err(|e| format!("Git branch delete failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_checkout(repo_path: String, target: String, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(["-C", &repo_path, "checkout", &target])
        .output()
        .map_err(|e| format!("Git checkout failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_status(repo_path: String, state: State<'_, AppState>) -> Result<GitRepoStatus, String> {
    get_repo_status(&repo_path).await.map_err(|e| e.to_string())
}

#[command]
pub async fn git_add(repo_path: String, paths: Vec<String>, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let mut args = vec!["-C", &repo_path, "add"];
    args.extend(paths.iter().map(|s| s.as_str()));
    
    let output = Command::new("git")
        .args(&args)
        .output()
        .map_err(|e| format!("Git add failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_commit(repo_path: String, request: CommitRequest, state: State<'_, AppState>) -> Result<String, String> {
    use std::process::Command;
    
    let mut args = vec!["-C", &repo_path, "commit", "-m", &request.message];
    if request.sign.unwrap_or(false) {
        args.push("-S");
    }
    
    let output = Command::new("git")
        .args(&args)
        .output()
        .map_err(|e| format!("Git commit failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let commit_hash = stdout.lines()
        .find(|l| l.starts_with("["))
        .and_then(|l| l.split_whitespace().nth(1))
        .map(|s| s.trim_end_matches(']').to_string())
        .unwrap_or_default();
    
    Ok(commit_hash)
}

#[command]
pub async fn git_push(repo_path: String, request: PushRequest, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let mut args = vec!["-C", &repo_path, "push"];
    if request.force.unwrap_or(false) {
        args.push("--force");
    }
    if let Some(remote) = request.remote {
        args.push(&remote);
    }
    if let Some(branch) = request.branch {
        args.push(&branch);
    }
    
    let output = Command::new("git")
        .args(&args)
        .output()
        .map_err(|e| format!("Git push failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_pull(repo_path: String, remote: Option<String>, branch: Option<String>, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let mut args = vec!["-C", &repo_path, "pull"];
    if let Some(remote) = remote {
        args.push(&remote);
    }
    if let Some(branch) = branch {
        args.push(&branch);
    }
    
    let output = Command::new("git")
        .args(&args)
        .output()
        .map_err(|e| format!("Git pull failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_fetch(repo_path: String, remote: Option<String>, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let mut args = vec!["-C", &repo_path, "fetch"];
    if let Some(remote) = remote {
        args.push(&remote);
    } else {
        args.push("--all");
    }
    
    let output = Command::new("git")
        .args(&args)
        .output()
        .map_err(|e| format!("Git fetch failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_remote_list(repo_path: String, state: State<'_, AppState>) -> Result<Vec<GitRemote>, String> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(["-C", &repo_path, "remote", "-v"])
        .output()
        .map_err(|e| format!("Git remote failed: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut remotes = Vec::new();
    let mut seen = std::collections::HashSet::new();
    
    for line in stdout.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 && parts[2] == "(fetch)" {
            let name = parts[0].to_string();
            if seen.insert(name.clone()) {
                remotes.push(GitRemote {
                    name,
                    url: parts[1].to_string(),
                    fetch_refspec: format!("+refs/heads/*:refs/remotes/{}/*", parts[0]),
                });
            }
        }
    }
    
    Ok(remotes)
}

#[command]
pub async fn git_remote_add(repo_path: String, name: String, url: String, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(["-C", &repo_path, "remote", "add", &name, &url])
        .output()
        .map_err(|e| format!("Git remote add failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_stash_list(repo_path: String, state: State<'_, AppState>) -> Result<Vec<GitStash>, String> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(["-C", &repo_path, "stash", "list", "--pretty=format:%gd\x1f%s\x1f%H\x1f%ai"])
        .output()
        .map_err(|e| format!("Git stash list failed: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut stashes = Vec::new();
    
    for (idx, line) in stdout.lines().enumerate() {
        let parts: Vec<&str> = line.split("\x1f").collect();
        if parts.len() >= 4 {
            stashes.push(GitStash {
                index: idx as i32,
                message: parts[1].to_string(),
                branch: "".to_string(),
                commit_hash: parts[2].to_string(),
                date: parts[3].to_string(),
            });
        }
    }
    
    Ok(stashes)
}

#[command]
pub async fn git_stash_push(repo_path: String, message: Option<String>, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let mut args = vec!["-C", &repo_path, "stash", "push"];
    if let Some(msg) = message {
        args.push("-m");
        args.push(&msg);
    }
    
    let output = Command::new("git")
        .args(&args)
        .output()
        .map_err(|e| format!("Git stash push failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_stash_pop(repo_path: String, index: Option<i32>, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let mut args = vec!["-C", &repo_path, "stash", "pop"];
    if let Some(idx) = index {
        args.push(&format!("stash@{{{}}}", idx));
    }
    
    let output = Command::new("git")
        .args(&args)
        .output()
        .map_err(|e| format!("Git stash pop failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_stash_drop(repo_path: String, index: i32, state: State<'_, AppState>) -> Result<(), String> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(["-C", &repo_path, "stash", "drop", &format!("stash@{{{}}}", index)])
        .output()
        .map_err(|e| format!("Git stash drop failed: {}", e))?;
    
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}

#[command]
pub async fn git_blame(repo_path: String, file: String, start_line: i32, end_line: i32, state: State<'_, AppState>) -> Result<Vec<GitBlameLine>, String> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(["-C", &repo_path, "blame", "-L", &format!("{},{}", start_line, end_line), &file])
        .output()
        .map_err(|e| format!("Git blame failed: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut blame_lines = Vec::new();
    
    for (idx, line) in stdout.lines().enumerate() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 {
            let commit_hash = parts[0].trim_start_matches('^');
            let author = parts[1].to_string();
            let date = parts[2..].iter().take_while(|s| !s.starts_with(')')).collect::<Vec<_>>().join(" ");
            let content = line.split(')').nth(1).unwrap_or("").trim().to_string();
            
            blame_lines.push(GitBlameLine {
                line_number: start_line + idx as i32,
                commit_hash: commit_hash.to_string(),
                author,
                date,
                content,
            });
        }
    }
    
    Ok(blame_lines)
}

#[command]
pub async fn git_show(repo_path: String, commit_sha: String, state: State<'_, AppState>) -> Result<GitCommit, String> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(["-C", &repo_path, "show", &commit_sha, "--pretty=format:%H\x1f%an\x1f%ae\x1f%at\x1f%s\x1f%B", "--stat"])
        .output()
        .map_err(|e| format!("Git show failed: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let parts: Vec<&str> = stdout.split("\x1f").collect();
    
    if parts.len() >= 6 {
        Ok(GitCommit {
            hash: parts[0].to_string(),
            short_hash: parts[0].chars().take(7).collect(),
            author: parts[1].to_string(),
            email: parts[2].to_string(),
            date: parts[3].parse::<i64>()
                .map(|ts| chrono::DateTime::from_timestamp(ts, 0).unwrap().to_rfc3339())
                .unwrap_or_default(),
            subject: parts[4].to_string(),
            message: Some(parts[5].to_string()),
        })
    } else {
        Err("Failed to parse git show output".to_string())
    }
}