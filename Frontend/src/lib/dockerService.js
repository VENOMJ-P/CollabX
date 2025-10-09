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
      this.isDockerAvailable = response.data.data.available;
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
      // Convert files object to the format expected by backend
      const formattedFiles = {};
      files.forEach((file) => {
        formattedFiles[file.filename] = file.contents;
      });

      console.log("Formatted Files:", formattedFiles);
      console.log("Build Command:", buildCommand);
      console.log("Start Command:", startCommand);

      const response = await axiosInstance.post("/execution/run", {
        files: formattedFiles,
        buildCommand,
        startCommand,
      });

      return response.data.data;
    } catch (error) {
      console.error("Code execution failed:", error);
      toast.error(error.response?.data?.message || "Code execution failed");
      return null;
    }
  }

  async runCodeFromMessage(openedFiles, selectedMessage) {
    if (!this.isDockerAvailable) {
      await this.checkDockerStatus();
      if (!this.isDockerAvailable) {
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
