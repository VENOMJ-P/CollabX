import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { start } from "repl";
import { v4 as uuidv4 } from "uuid";

class DockerService {
  constructor() {
    this.executionsDir = path.join(process.cwd(), "temp-executions");
    this.ensureExecutionsDir();
    this.maxTimeout = 60000; // 60 seconds
    this.maxMemory = "256m";
    this.maxCpus = "1";
  }

  ensureExecutionsDir() {
    if (!fs.existsSync(this.executionsDir)) {
      fs.mkdirSync(this.executionsDir, { recursive: true });
    }
  }

  async executeCode(files, buildCommand, startCommand) {
    const executionId = uuidv4();
    const executionDir = path.join(this.executionsDir, executionId);

    console.log(files, buildCommand, startCommand);

    try {
      // Create execution directory
      fs.mkdirSync(executionDir, { recursive: true });

      // Write files to directory
      await this.writeFiles(executionDir, files);

      // Create Dockerfile based on file types
      const dockerfile = this.generateDockerfile(
        files,
        buildCommand,
        startCommand
      );
      fs.writeFileSync(path.join(executionDir, "Dockerfile"), dockerfile);

      // Build Docker image
      const imageName = `code-execution-${executionId}`.toLowerCase();
      const buildSuccess = await this.buildDockerImage(executionDir, imageName);

      if (!buildSuccess) {
        throw new Error("Docker build failed");
      }

      // Run container and capture output
      const output = await this.runContainer(imageName);

      // Cleanup
      await this.cleanup(executionDir, imageName);

      return {
        success: true,
        output,
        executionId,
      };
    } catch (error) {
      // Ensure cleanup even on error
      const imageName = `code-execution-${executionId}`.toLowerCase();
      await this.cleanup(executionDir, imageName).catch(() => {});

      return {
        success: false,
        error: error.message || "Execution failed",
        executionId,
      };
    }
  }

  async writeFiles(executionDir, files) {
    if (!files || typeof files !== "object") {
      throw new Error("Files must be an object");
    }

    for (const [filename, content] of Object.entries(files)) {
      if (!filename || content === null || content === undefined) {
        continue;
      }

      const filePath = path.join(executionDir, filename);
      const fileDir = path.dirname(filePath);

      // Create subdirectories if needed
      if (fileDir !== executionDir) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      // Write file with proper encoding
      const fileContent =
        typeof content === "string" ? content : String(content);
      fs.writeFileSync(filePath, fileContent, "utf-8");
    }
  }

  generateDockerfile(files, buildCommand, startCommand) {
    if (!files || typeof files !== "object") {
      files = {};
    }

    const fileExtensions = Object.keys(files).map((f) =>
      path.extname(f).toLowerCase()
    );
    const fileNames = Object.keys(files).map((f) =>
      path.basename(f).toLowerCase()
    );

    const hasNodeJs =
      fileExtensions.some((ext) => [".js", ".json"].includes(ext)) ||
      fileNames.includes("package.json");
    const hasPython =
      fileExtensions.some((ext) => ext === ".py") ||
      fileNames.includes("requirements.txt");
    const hasJava = fileExtensions.some((ext) => ext === ".java");

    const getStartCommand = () => {
      if (
        startCommand?.commands &&
        Array.isArray(startCommand.commands) &&
        startCommand.commands.length > 0
      ) {
        // Combine mainItem with commands
        const mainItem = startCommand.mainItem || "";
        const commands = startCommand.commands;

        if (mainItem) {
          // If mainItem exists, prepend it to the first command
          return `${mainItem} ${commands.join(" ")}`;
        } else {
          // Otherwise just join the commands
          return commands.join(" && ");
        }
      }
      return null;
    };

    let dockerfile = "";
    const startCmd = getStartCommand();

    if (hasNodeJs) {
      dockerfile = `FROM node:18-alpine
WORKDIR /app
COPY . .

# Install dependencies if package.json exists
RUN if [ -f package.json ]; then npm install --omit=dev; else true; fi

# Set working directory
WORKDIR /app

# Run the code
${
  startCmd ? `CMD ["sh", "-c", "${startCmd}"]` : `CMD ["node", "index.js"]`
}`.trim();
    } else if (hasPython) {
      dockerfile = `FROM python:3.11-alpine
WORKDIR /app
COPY . .

# Install dependencies if requirements.txt exists
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; else true; fi

# Run the code
${
  startCmd ? `CMD ["sh", "-c", "${startCmd}"]` : `CMD ["python", "main.py"]`
}`.trim();
    } else if (hasJava) {
      dockerfile = `FROM openjdk:17-alpine
WORKDIR /app
COPY . .

# Compile Java files
RUN javac *.java 2>/dev/null || true

# Run the code
${
  startCmd ? `CMD ["sh", "-c", "${startCmd}"]` : `CMD ["java", "Main"]`
}`.trim();
    } else {
      // Default fallback to Node.js
      dockerfile = `FROM node:18-alpine
WORKDIR /app
COPY . .

${
  startCmd ? `CMD ["sh", "-c", "${startCmd}"]` : `CMD ["node", "index.js"]`
}`.trim();
    }

    return dockerfile;
  }

  buildDockerImage(executionDir, imageName) {
    return new Promise((resolve, reject) => {
      const buildProcess = spawn(
        "docker",
        ["build", "-t", imageName, "--platform", "linux/amd64", "."],
        {
          cwd: executionDir,
          stdio: ["pipe", "pipe", "pipe"],
          timeout: 120000,
        }
      );

      let output = "";
      let errorOutput = "";

      buildProcess.stdout.on("data", (data) => {
        output += data.toString();
        console.log("[Docker Build]", data.toString());
      });

      buildProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error("[Docker Build Error]", data.toString());
      });

      buildProcess.on("close", (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`Docker build failed: ${errorOutput || output}`));
        }
      });

      buildProcess.on("error", (error) => {
        reject(new Error(`Docker build process error: ${error.message}`));
      });

      // Timeout after 2 minutes
      setTimeout(() => {
        if (buildProcess.exitCode === null) {
          buildProcess.kill("SIGKILL");
          reject(new Error("Docker build timeout"));
        }
      }, 120000);
    });
  }

  runContainer(imageName) {
    return new Promise((resolve) => {
      const runProcess = spawn(
        "docker",
        [
          "run",
          "--rm",
          "--platform",
          "linux/amd64",
          `--memory=${this.maxMemory}`,
          `--cpus=${this.maxCpus}`,
          "--network=none",
          "--read-only",
          "--tmpfs",
          "/tmp",
          imageName,
        ],
        {
          stdio: ["pipe", "pipe", "pipe"],
          timeout: this.maxTimeout,
        }
      );

      let output = "";
      let errorOutput = "";

      runProcess.stdout.on("data", (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log("[Docker Output]", chunk);
      });

      runProcess.stderr.on("data", (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        console.error("[Docker Error]", chunk);
      });

      runProcess.on("close", (code) => {
        resolve({
          stdout: output,
          stderr: errorOutput,
          exitCode: code || 0,
        });
      });

      runProcess.on("error", (error) => {
        resolve({
          stdout: output,
          stderr: errorOutput + "\nProcess error: " + error.message,
          exitCode: 1,
        });
      });

      // Timeout after maxTimeout
      const timeoutHandle = setTimeout(() => {
        if (runProcess.exitCode === null) {
          runProcess.kill("SIGKILL");
          console.warn("Container execution timeout");
        }
      }, this.maxTimeout);

      runProcess.on("exit", () => {
        clearTimeout(timeoutHandle);
      });
    });
  }

  async cleanup(executionDir, imageName) {
    try {
      // Remove Docker image
      if (imageName) {
        await new Promise((resolve) => {
          const removeImage = spawn("docker", ["rmi", "-f", imageName], {
            stdio: "ignore",
            timeout: 30000,
          });
          removeImage.on("close", () => resolve());
          removeImage.on("error", () => resolve());
        });
      }

      // Remove execution directory
      if (fs.existsSync(executionDir)) {
        fs.rmSync(executionDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }

  async checkDockerAvailability() {
    return new Promise((resolve) => {
      const checkProcess = spawn("docker", ["--version"], {
        stdio: "pipe",
        timeout: 5000,
      });

      checkProcess.on("close", (code) => {
        resolve(code === 0);
      });

      checkProcess.on("error", () => {
        resolve(false);
      });

      setTimeout(() => {
        if (checkProcess.exitCode === null) {
          checkProcess.kill("SIGKILL");
          resolve(false);
        }
      }, 5000);
    });
  }
}

export default new DockerService();
