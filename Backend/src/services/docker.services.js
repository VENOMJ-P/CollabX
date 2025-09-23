import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class DockerService {
    constructor() {
        this.executionsDir = path.join(process.cwd(), 'temp-executions');
        this.ensureExecutionsDir();
    }

    ensureExecutionsDir() {
        if (!fs.existsSync(this.executionsDir)) {
            fs.mkdirSync(this.executionsDir, { recursive: true });
        }
    }

    async executeCode(files, buildCommand, startCommand) {
        const executionId = uuidv4();
        const executionDir = path.join(this.executionsDir, executionId);
        
        try {
            // Create execution directory
            fs.mkdirSync(executionDir, { recursive: true });
            
            // Write files to directory
            await this.writeFiles(executionDir, files);
            
            // Create Dockerfile based on file types
            const dockerfile = this.generateDockerfile(files, buildCommand, startCommand);
            fs.writeFileSync(path.join(executionDir, 'Dockerfile'), dockerfile);
            
            // Build Docker image
            const imageName = `code-execution-${executionId}`.toLowerCase();
            await this.buildDockerImage(executionDir, imageName);
            
            // Run container and capture output
            const output = await this.runContainer(imageName);
            
            // Cleanup
            await this.cleanup(executionDir, imageName);
            
            return {
                success: true,
                output,
                executionId
            };
            
        } catch (error) {
            // Ensure cleanup even on error
            await this.cleanup(executionDir, `code-execution-${executionId}`.toLowerCase()).catch(() => {});
            
            return {
                success: false,
                error: error.message,
                executionId
            };
        }
    }

    async writeFiles(executionDir, files) {
        for (const [filename, content] of Object.entries(files)) {
            const filePath = path.join(executionDir, filename);
            const fileDir = path.dirname(filePath);
            
            // Create subdirectories if needed
            if (fileDir !== executionDir) {
                fs.mkdirSync(fileDir, { recursive: true });
            }
            
            fs.writeFileSync(filePath, content);
        }
    }

    generateDockerfile(files, buildCommand, startCommand) {
        const fileExtensions = Object.keys(files).map(f => path.extname(f));
        const hasNodeJs = fileExtensions.some(ext => ['.js', '.json'].includes(ext)) || files['package.json'];
        const hasPython = fileExtensions.some(ext => ext === '.py');
        const hasJava = fileExtensions.some(ext => ext === '.java');
        
        let dockerfile = '';
        
        if (hasNodeJs) {
            dockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY . .

# Install dependencies if package.json exists
RUN if [ -f package.json ]; then npm install; fi

# Set default command
CMD ["sh", "-c", "${startCommand?.commands?.join(' ') || 'node index.js'}"]
            `.trim();
        } else if (hasPython) {
            dockerfile = `
FROM python:3.9-alpine
WORKDIR /app
COPY . .

# Install dependencies if requirements.txt exists
RUN if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

CMD ["sh", "-c", "${startCommand?.commands?.join(' ') || 'python main.py'}"]
            `.trim();
        } else if (hasJava) {
            dockerfile = `
FROM openjdk:11-jre-slim
WORKDIR /app
COPY . .

# Compile Java files
RUN javac *.java

CMD ["sh", "-c", "${startCommand?.commands?.join(' ') || 'java Main'}"]
            `.trim();
        } else {
            // Default to Node.js
            dockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY . .
CMD ["sh", "-c", "${startCommand?.commands?.join(' ') || 'node index.js'}"]
            `.trim();
        }
        
        return dockerfile;
    }

    buildDockerImage(executionDir, imageName) {
        return new Promise((resolve, reject) => {
            const buildProcess = spawn('docker', ['build', '-t', imageName, '.'], {
                cwd: executionDir,
                stdio: 'pipe'
            });

            let output = '';
            let errorOutput = '';

            buildProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            buildProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            buildProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Docker build failed: ${errorOutput}`));
                }
            });

            // Timeout after 2 minutes
            setTimeout(() => {
                buildProcess.kill();
                reject(new Error('Docker build timeout'));
            }, 120000);
        });
    }

    runContainer(imageName) {
        return new Promise((resolve, reject) => {
            const runProcess = spawn('docker', [
                'run', 
                '--rm', 
                '--memory=128m', 
                '--cpus=0.5',
                '--network=none', // No network access for security
                '--timeout', '30', // 30 second timeout
                imageName
            ], {
                stdio: 'pipe'
            });

            let output = '';
            let errorOutput = '';

            runProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            runProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            runProcess.on('close', (code) => {
                resolve({
                    stdout: output,
                    stderr: errorOutput,
                    exitCode: code
                });
            });

            // Timeout after 35 seconds (5 seconds buffer)
            setTimeout(() => {
                runProcess.kill();
                resolve({
                    stdout: output,
                    stderr: errorOutput + '\n[Execution timeout]',
                    exitCode: 124
                });
            }, 35000);
        });
    }

    async cleanup(executionDir, imageName) {
        try {
            // Remove Docker image
            if (imageName) {
                await new Promise((resolve) => {
                    const removeImage = spawn('docker', ['rmi', imageName], { stdio: 'ignore' });
                    removeImage.on('close', () => resolve());
                });
            }
            
            // Remove execution directory
            if (fs.existsSync(executionDir)) {
                fs.rmSync(executionDir, { recursive: true, force: true });
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    // Health check method
    async checkDockerAvailability() {
        return new Promise((resolve) => {
            const checkProcess = spawn('docker', ['--version'], { stdio: 'pipe' });
            checkProcess.on('close', (code) => {
                resolve(code === 0);
            });
        });
    }
}

export default new DockerService();