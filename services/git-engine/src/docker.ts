import { spawn } from "node:child_process";

export interface DockerContainerInfo {
  id: string;
  names: string;
  image: string;
  state: string;
  status: string;
  ports: string;
}

export async function listDockerContainers(): Promise<DockerContainerInfo[]> {
  return new Promise((resolve, reject) => {
    const proc = spawn("docker", ["ps", "-a", "--format", "{{json .}}"]);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`docker ps exited with code ${code}: ${stderr}`));
      }

      const lines = stdout.trim().split("\n").filter(Boolean);
      const containers: DockerContainerInfo[] = [];

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          containers.push({
            id: parsed.ID || "",
            names: parsed.Names || "",
            image: parsed.Image || "",
            state: parsed.State || "",
            status: parsed.Status || "",
            ports: parsed.Ports || "",
          });
        } catch {
          // ignore malformed lines
        }
      }

      resolve(containers);
    });
  });
}

export async function controlDockerContainer(
  containerId: string,
  action: "start" | "stop" | "restart" | "logs"
): Promise<{ output: string }> {
  const allowed = ["start", "stop", "restart", "logs"];
  if (!allowed.includes(action)) {
    throw new Error(`Action '${action}' is not supported.`);
  }

  const args = action === "logs" ? ["logs", "--tail", "100", containerId] : [action, containerId];

  return new Promise((resolve, reject) => {
    const proc = spawn("docker", args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0 && action !== "logs") {
        return reject(new Error(`docker ${action} failed: ${stderr || stdout}`));
      }
      resolve({ output: stdout || stderr });
    });
  });
}

