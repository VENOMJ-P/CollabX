import dockerService from "../services/docker.services.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

export const executeCode = async (req, res) => {
  try {
    const { files, buildCommand, startCommand } = req.body;

    if (!files || Object.keys(files).length === 0) {
      return errorResponse(res, 400, "No files provided for execution");
    }

    // Check if Docker is available
    const dockerAvailable = await dockerService.checkDockerAvailability();
    if (!dockerAvailable) {
      return errorResponse(res, 500, "Docker is not available on this server");
    }

    // Execute code using Docker
    const result = await dockerService.executeCode(
      files,
      buildCommand,
      startCommand
    );

    if (result.success) {
      return successResponse(res, 200, "Code executed successfully", {
        output: result.output,
        executionId: result.executionId,
      });
    } else {
      return errorResponse(res, 500, "Code execution failed", {
        error: result.error,
        executionId: result.executionId,
      });
    }
  } catch (error) {
    console.error("Execution controller error:", error);
    return errorResponse(res, 500, "Internal server error", error.message);
  }
};

export const checkDockerStatus = async (req, res) => {
  try {
    const dockerAvailable = await dockerService.checkDockerAvailability();
    return successResponse(res, 200, "Docker status checked", {
      available: dockerAvailable,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to check Docker status",
      error.message
    );
  }
};
