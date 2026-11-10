use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::command;
use git2::{Repository, Signature, BranchType, RemoteCallbacks, Cred, PushOptions, FetchOptions};
use std::path::PathBuf;
use crate::state::AppState;
use tauri::State;
use std::collections::BTreeMap;
use surrealdb::sql::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct GitRepo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub remote_url: Option<String>,
    pub branch: String,
    pub last_fetched: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitCommit {
    pub id: String,
    pub message: String,
    pub author: String,
    pub timestamp: String,
    pub parents: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitBranch {
    pub name: String,
    pub is_current: bool,
    pub is_remote: bool,
    pub commit_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatus {
    pub staged: Vec<String>,
    pub unstaged: Vec<String>,
    pub untracked: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitDiff {
    pub file: String,
    pub diff: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitRemote {
    pub name: String,
    pub url: String,
    pub fetch_refspec: String,
}

#[command]
pub async fn git_repo_init(
    path: String,
    name: String,
    state: State<'_, AppState>,
) -> Result<GitRepo, String> {
    let repo_path = PathBuf::from(&path);
    std::fs::create_dir_all(&repo_path).map_err(|e| e.to_string())?;

    let repo = Repository::init(&repo_path).map_err(|e| e.to_string())?;

    // Create initial commit
    let mut index = repo.index().map_err(|e| e.to_string())?;
    let tree_id = index.write_tree().map_err(|e| e.to_string())?;
    let tree = repo.find_tree(tree_id).map_err(|e| e.to_string())?;

    let signature = Signature::now("Sovereign User", "user@sovereign.local").map_err(|e| e.to_string())?;
    repo.commit(
        Some("HEAD"),
        &signature,
        &signature,
        "Initial commit",
        &tree,
        &[],
    ).map_err(|e| e.to_string())?;

    // Store in database
    let db = &state.db;
    let mut repo_record = BTreeMap::new();
    repo_record.insert("name".to_string(), Value::from(name.clone()));
    repo_record.insert("path".to_string(), Value::from(path.clone()));
    repo_record.insert("remote_url".to_string(), Value::None);
    repo_record.insert("branch".to_string(), Value::from("main".to_string()));
    repo_record.insert("last_fetched".to_string(), Value::None);
    let _ = db.create("git_repositories").content(Value::from(repo_record)).await;

    Ok(GitRepo {
        id: "new".to_string(),
        name,
        path,
        remote_url: None,
        branch: "main".to_string(),
        last_fetched: None,
    })
}

#[command]
pub async fn git_repo_open(
    path: String,
    state: State<'_, AppState>,
) -> Result<GitRepo, String> {
    let repo = Repository::open(&path).map_err(|e| e.to_string())?;
    let head = repo.head().map_err(|e| e.to_string())?;
    let branch = head.shorthand().unwrap_or("main").to_string();

    let remote_url = repo.find_remote("origin")
        .ok()
        .and_then(|r| r.url().map(|s| s.to_string()));

    Ok(GitRepo {
        id: "opened".to_string(),
        name: path.split('/').last().unwrap_or("repo").to_string(),
        path,
        remote_url,
        branch,
        last_fetched: None,
    })
}

#[command]
pub async fn git_repo_list(
    state: State<'_, AppState>,
) -> Result<Vec<GitRepo>, String> {
    let db = &state.db;
    let mut result = db.query("SELECT * FROM git_repositories").await.map_err(|e| e.to_string())?;
    let repos: Vec<GitRepo> = result.take(0).map_err(|e| e.to_string())?;
    Ok(repos)
}

#[command]
pub async fn git_repo_remove(
    id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let db = &state.db;
    let thing: surrealdb::sql::Thing = format!("git_repositories:{}", id).parse().map_err(|e| e.to_string())?;
    db.delete(thing).await.map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn git_commit_create(
    repo_path: String,
    message: String,
    files: Vec<String>,
) -> Result<String, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut index = repo.index().map_err(|e| e.to_string())?;

    for file in files {
        index.add_path(PathBuf::from(file).as_path()).map_err(|e| e.to_string())?;
    }

    let tree_id = index.write_tree().map_err(|e| e.to_string())?;
    let tree = repo.find_tree(tree_id).map_err(|e| e.to_string())?;

    let head = repo.head().map_err(|e| e.to_string())?;
    let parent_commit = head.peel_to_commit().map_err(|e| e.to_string())?;

    let signature = Signature::now("Sovereign User", "user@sovereign.local").map_err(|e| e.to_string())?;
    let commit_id = repo.commit(
        Some("HEAD"),
        &signature,
        &signature,
        &message,
        &tree,
        &[&parent_commit],
    ).map_err(|e| e.to_string())?;

    Ok(commit_id.to_string())
}

#[command]
pub async fn git_branch_list(
    repo_path: String,
) -> Result<Vec<GitBranch>, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut branches = Vec::new();

    let head = repo.head().ok();
    let current_branch = head.as_ref().and_then(|h| h.shorthand()).unwrap_or("");

    for branch in repo.branches(Some(BranchType::Local)).map_err(|e| e.to_string())? {
        let (branch, _) = branch.map_err(|e| e.to_string())?;
        let name = branch.name().map_err(|e| e.to_string())?.unwrap_or("").to_string();
        let commit = branch.get().peel_to_commit().map_err(|e| e.to_string())?;
        branches.push(GitBranch {
            is_current: name == current_branch,
            is_remote: false,
            name,
            commit_id: commit.id().to_string(),
        });
    }

    for branch in repo.branches(Some(BranchType::Remote)).map_err(|e| e.to_string())? {
        let (branch, _) = branch.map_err(|e| e.to_string())?;
        let name = branch.name().map_err(|e| e.to_string())?.unwrap_or("").to_string();
        let commit = branch.get().peel_to_commit().map_err(|e| e.to_string())?;
        branches.push(GitBranch {
            is_current: false,
            is_remote: true,
            name,
            commit_id: commit.id().to_string(),
        });
    }

    Ok(branches)
}

#[command]
pub async fn git_branch_create(
    repo_path: String,
    branch_name: String,
    from_commit: Option<String>,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let commit = if let Some(commit_id) = from_commit {
        repo.find_commit(git2::Oid::from_str(&commit_id).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?
    } else {
        let head = repo.head().map_err(|e| e.to_string())?;
        head.peel_to_commit().map_err(|e| e.to_string())?
    };

    repo.branch(&branch_name, &commit, false).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn git_branch_delete(
    repo_path: String,
    branch_name: String,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut branch = repo.find_branch(&branch_name, BranchType::Local).map_err(|e| e.to_string())?;
    branch.delete().map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn git_status(
    repo_path: String,
) -> Result<GitStatus, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut status_opts = git2::StatusOptions::new();
    status_opts.include_untracked(true);
    let statuses = repo.statuses(Some(&mut status_opts)).map_err(|e| e.to_string())?;

    let mut staged = Vec::new();
    let mut unstaged = Vec::new();
    let mut untracked = Vec::new();

    for entry in statuses.iter() {
        let path_str = entry.path().unwrap_or("").to_string();
        let status = entry.status();
        if status.contains(git2::Status::INDEX_NEW) || status.contains(git2::Status::INDEX_MODIFIED) || status.contains(git2::Status::INDEX_DELETED) {
            staged.push(path_str.clone());
        }
        if status.contains(git2::Status::WT_MODIFIED) || status.contains(git2::Status::WT_DELETED) {
            unstaged.push(path_str.clone());
        }
        if status.contains(git2::Status::WT_NEW) {
            untracked.push(path_str.clone());
        }
    }

    Ok(GitStatus { staged, unstaged, untracked })
}

#[command]
pub async fn git_diff(
    repo_path: String,
    file: String,
    staged: bool,
) -> Result<GitDiff, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let head = repo.head().map_err(|e| e.to_string())?;
    let tree = head.peel_to_tree().map_err(|e| e.to_string())?;

    let mut diff_opts = git2::DiffOptions::new();
    let diff = if staged {
        let mut index = repo.index().map_err(|e| e.to_string())?;
        repo.diff_index_to_workdir(Some(&mut index), Some(&mut diff_opts)).map_err(|e| e.to_string())?
    } else {
        repo.diff_tree_to_workdir(Some(&tree), Some(&mut diff_opts)).map_err(|e| e.to_string())?
    };

    let mut diff_output = String::new();
    diff.print(git2::DiffFormat::Patch, |_, _, line| {
        diff_output.push_str(std::str::from_utf8(line.content()).unwrap_or(""));
        true
    }).map_err(|e| e.to_string())?;

    Ok(GitDiff {
        file,
        diff: diff_output,
    })
}

#[command]
pub async fn git_log(
    repo_path: String,
    limit: usize,
) -> Result<Vec<GitCommit>, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut revwalk = repo.revwalk().map_err(|e| e.to_string())?;
    revwalk.push_head().map_err(|e| e.to_string())?;
    revwalk.set_sorting(git2::Sort::TIME).map_err(|e| e.to_string())?;

    let mut commits = Vec::new();
    for (i, oid) in revwalk.enumerate() {
        if i >= limit { break; }
        let oid = oid.map_err(|e| e.to_string())?;
        let commit = repo.find_commit(oid).map_err(|e| e.to_string())?;
        commits.push(GitCommit {
            id: commit.id().to_string(),
            message: commit.message().unwrap_or("").to_string(),
            author: commit.author().name().unwrap_or("").to_string(),
            timestamp: commit.time().seconds().to_string(),
            parents: commit.parent_ids().map(|id| id.to_string()).collect(),
        });
    }

    Ok(commits)
}

#[command]
pub async fn git_remote_list(
    repo_path: String,
) -> Result<Vec<GitRemote>, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut remotes = Vec::new();

    for remote_name in repo.remotes().map_err(|e| e.to_string())?.iter().flatten() {
        let remote = repo.find_remote(remote_name).map_err(|e| e.to_string())?;
        let fetch_refspec = remote.fetch_refspecs()
            .iter()
            .flatten()
            .next()
            .map(|s| s.to_string())
            .unwrap_or_default();
        remotes.push(GitRemote {
            name: remote_name.to_string(),
            url: remote.url().unwrap_or("").to_string(),
            fetch_refspec,
        });
    }

    Ok(remotes)
}

#[command]
pub async fn git_remote_add(
    repo_path: String,
    name: String,
    url: String,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    repo.remote(&name, &url).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn git_remote_remove(
    repo_path: String,
    name: String,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    repo.remote_delete(&name).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn git_fetch(
    repo_path: String,
    remote: String,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut remote_obj = repo.find_remote(&remote).map_err(|e| e.to_string())?;
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, username_from_url, _allowed_types| {
        Cred::ssh_key_from_agent(username_from_url.unwrap_or("git"))
    });
    let mut fetch_opts = FetchOptions::new();
    fetch_opts.remote_callbacks(callbacks);
    remote_obj.fetch(&["refs/heads/*:refs/remotes/origin/*"], Some(&mut fetch_opts), None).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn git_pull(
    repo_path: String,
    remote: String,
    branch: String,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut remote_obj = repo.find_remote(&remote).map_err(|e| e.to_string())?;
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, username_from_url, _allowed_types| {
        Cred::ssh_key_from_agent(username_from_url.unwrap_or("git"))
    });
    let mut fetch_opts = FetchOptions::new();
    fetch_opts.remote_callbacks(callbacks);
    remote_obj.fetch(&[&format!("refs/heads/{}:refs/heads/{}", branch, branch)], Some(&mut fetch_opts), None).map_err(|e| e.to_string())?;
    // Merge would be needed here - simplified
    Ok(true)
}

#[command]
pub async fn git_push(
    repo_path: String,
    remote: String,
    branch: String,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut remote_obj = repo.find_remote(&remote).map_err(|e| e.to_string())?;
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, username_from_url, _allowed_types| {
        Cred::ssh_key_from_agent(username_from_url.unwrap_or("git"))
    });
    let mut push_options = PushOptions::new();
    push_options.remote_callbacks(callbacks);
    remote_obj.push(&[&format!("refs/heads/{}:refs/heads/{}", branch, branch)], Some(&mut push_options)).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn git_stash_list(
    repo_path: String,
) -> Result<Vec<String>, String> {
    let mut repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let mut stashes = Vec::new();
    repo.stash_foreach(|index, message, _| {
        stashes.push(format!("stash@{{{}}}: {}", index, message));
        true
    }).map_err(|e| e.to_string())?;
    Ok(stashes)
}

#[command]
pub async fn git_stash_create(
    repo_path: String,
    message: String,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    let signature = Signature::now("Sovereign User", "user@sovereign.local").map_err(|e| e.to_string())?;
    repo.stash_save(&signature, &message, git2::StashFlags::DEFAULT).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn git_stash_pop(
    repo_path: String,
    index: usize,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    repo.stash_pop(index, None).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn git_stash_drop(
    repo_path: String,
    index: usize,
) -> Result<bool, String> {
    let repo = Repository::open(&repo_path).map_err(|e| e.to_string())?;
    repo.stash_drop(index).map_err(|e| e.to_string())?;
    Ok(true)
}
