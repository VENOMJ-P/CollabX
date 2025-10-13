import { axiosInstance } from "./axios";
import toast from "react-hot-toast";

class DockerService {
  constructor() {
    this.isDockerAvailable = false;
    this.checkDockerStatus();
  }

  async checkDockerStatus() {
    try {
      const response = await axiosInstance.get("/execution/docker-status");
      // Response data structure: { success, message, data: { available }, err }
      const available = response.data?.data?.available ?? false;
      this.isDockerAvailable = available;
      return this.isDockerAvailable;
    } catch (error) {
      console.error("Failed to check Docker status:", error);
      this.isDockerAvailable = false;
      return false;
    }
  }

  async executeCode(files, buildCommand, startCommand) {
    if (!this.isDockerAvailable) {
      toast.error("Docker is not available for code execution");
      return null;
    }

    try {
      // Convert files array to object format expected by backend
      const formattedFiles = {};

      if (Array.isArray(files)) {
        files.forEach((file) => {
          formattedFiles[file.filename] = file.contents;
        });
      } else if (typeof files === "object") {
        Object.assign(formattedFiles, files);
      }

      if (Object.keys(formattedFiles).length === 0) {
        toast.error("No files to execute");
        return null;
      }

      console.log("Formatted Files:", formattedFiles);

      const response = await axiosInstance.post("/execution/run", {
        files: formattedFiles,
        buildCommand: buildCommand || {},
        startCommand: startCommand || { commands: [] },
      });

      return response.data.data;
    } catch (error) {
      console.error("Code execution failed:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Code execution failed";
      toast.error(errorMsg);
      return null;
    }
  }

  async runCodeFromMessage(openedFiles, selectedMessage) {
    if (!this.isDockerAvailable) {
      const available = await this.checkDockerStatus();
      if (!available) {
        toast.error("Docker is not available on the server");
        return null;
      }
    }

    const buildCommand = selectedMessage?.buildCommand;
    const startCommand = selectedMessage?.startCommand;

    return await this.executeCode(openedFiles, buildCommand, startCommand);
  }
}

export const dockerService = new DockerService();
