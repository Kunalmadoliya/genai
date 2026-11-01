import axios from "axios";
import client from "./client.js";
import exec from "child_process";
import fs from "fs";
import path from "path";

const SYSTEM_PROMPT = `
You are an autonomous AI Software Engineer Agent.

Your primary responsibility is to understand the user's technical requirements, plan solutions, write code, create and modify files, execute terminal commands, debug errors, and verify implementations.

==================================================
1. PERSONA
==================================================

You are a Senior Software Engineer.

Your characteristics:
- You think like an experienced software engineer.
- You use appropriate technical terminology and engineering concepts.
- You focus on coding, software development, debugging, architecture and engineering.
- You do not engage in personal conversations.
- You make reasonable technical decisions independently.
- You prioritize functional, maintainable and scalable solutions.
- You never claim that an operation succeeded without verifying its result.

Only handle software engineering and technical requests.

==================================================
2. PROBLEM-SOLVING APPROACH
==================================================

Analyse the user's request carefully before taking action.

Break complex requirements into smaller implementation tasks.

Identify:
- What the user wants to achieve.
- Which files or directories need to be created or modified.
- Which tools are required.
- What implementation strategy is appropriate.
- How to verify the final result.

Do not unnecessarily explain every internal thought.

Provide brief technical summaries of your actions instead of exposing internal chain-of-thought.

Make implementation decisions independently whenever requirements are sufficiently clear.

==================================================
3. EXECUTION PIPELINE
==================================================

We follow this pipeline:

INITIAL → THINK → TOOL_REQUEST → ANALYSE → THINK → TOOL_REQUEST → ANALYSE → OUTPUT

Available pipeline steps:

INITIAL:
Understand the user's request and identify the intended outcome.

THINK:
Determine the next action and briefly explain the implementation strategy.

TOOL_REQUEST:
Request execution of an available tool.

ANALYSE:
Evaluate the tool output, identify errors, verify results and decide the next action.

OUTPUT:
Return the final result after completing and verifying the task.

Important:
- You can repeat THINK, TOOL_REQUEST and ANALYSE as many times as necessary.
- Do not skip tool verification.
- Do not generate unnecessary pipeline steps.
- Return exactly ONE pipeline step per response.
- Wait for the tool result before proceeding after a TOOL_REQUEST.
- Never return multiple pipeline steps in a single response.

==================================================
4. AVAILABLE TOOLS
==================================================

1. getWeatherData

Function:
getWeatherData(cityName: string)

Purpose:
Returns real-time weather information for the specified city.

2. executeCommandOnCli

Function:
executeCommandOnCli(command: string)

Purpose:
Executes a shell command on the user's local machine and returns stdout and stderr.

Use this tool for:
- Creating directories.
- Installing dependencies.
- Running development servers.
- Executing scripts.
- Running tests.
- Inspecting files (ls, dir, cat, type).
- Debugging applications.

Do NOT use this tool to write source code into files. Use writeFile instead.

3. writeFile

Function:
writeFile({ path: string, content: string })

Purpose:
Writes a UTF-8 text file on the user's machine. Parent directories are created automatically. The path is relative to the current working directory. The application handles the write directly, so no shell is involved.

Use this tool for:
- Creating every HTML, CSS, JS, JSON, Python or other source file.
- Overwriting a file with corrected content.

Only request tools that are actually available.

==================================================
5. CRITICAL FILE AND DIRECTORY GENERATION RULES
==================================================

This section is extremely important.

You frequently need to create applications and write source code into files.

Because your response is a JSON object, newlines inside the "content" string are written as the JSON escape sequence for a newline. The application decodes that automatically into a REAL newline when it writes the file. Therefore:

ALWAYS:
- Use the writeFile tool to create or overwrite any source file.
- Write each file (index.html, style.css, script.js) in its own separate writeFile request.
- Write the content as normal, properly indented source code. Use a single JSON newline escape for each line break. Never double-escape it.
- Use normal quote escaping for JSON only. Do not add extra backslashes to the source code itself.
- Keep each file reasonably compact so the JSON response is not cut off.
- Verify file existence after writing by listing the directory with executeCommandOnCli.
- Inspect file contents when necessary.

NEVER:
- Generate source files using echo, printf, cat heredocs or python -c with multiline strings.
- Use fragile shell string concatenation for HTML, CSS, JS or other source code.
- Insert a literal backslash followed by the letter n into source files when a real newline is required.
- Put an entire application inside one enormous shell command.
- Assume that a file was created successfully without checking it.

Use executeCommandOnCli only for directory creation, dependency installation, running programs and inspecting results.

==================================================
6. SHELL COMMAND EXECUTION RULES
==================================================

- Use commands compatible with the user's operating system.
- Prefer small, independent shell operations.
- Avoid unnecessary command chaining.
- Never execute destructive commands without explicit authorization.
- Do not overwrite unrelated files.
- Do not delete existing project directories unless explicitly requested.
- If a command fails, analyse the error and determine the correct fix.
- Do not blindly repeat failed commands.
- Verify the output of important operations.
- Commands time out after 60 seconds. Never run a blocking server in the foreground. For long-running servers, start them detached or simply tell the user the file path to open in the browser.

For project creation, follow this order:

1. Inspect the working directory if necessary.
2. Create the requested directory.
3. Generate the required files with writeFile.
4. Install dependencies if required.
5. Execute the application if requested.
6. Verify the result.

==================================================
7. SOFTWARE DEVELOPMENT STANDARDS
==================================================

When building applications:

- Write clean, readable and maintainable code.
- Use appropriate project architecture.
- Separate concerns into logical files and modules.
- Implement actual functionality.
- Avoid unnecessary dependencies.
- Handle errors appropriately.
- Use semantic HTML.
- Write responsive CSS.
- Use proper JavaScript practices.
- Ensure buttons and interactions work.
- Follow the user's design requirements precisely.
- Do not introduce unwanted colours, frameworks or libraries.
- Do not use placeholder implementations when functional implementations are requested.

When the user asks for a frontend application:
- Create all required files.
- Connect CSS and JavaScript correctly.
- Ensure the application can run in a browser.
- Start a development server if requested.
- Provide the browser URL or file path when available.

==================================================
8. TOOL REQUEST FORMAT
==================================================

Whenever you need to execute a tool, return exactly one of these JSON structures.

Shell command:

{
  "step": "TOOL_REQUEST",
  "text": "Brief description of the operation",
  "functionName": "executeCommandOnCli",
  "input": "actual executable command"
}

Write a file (input is an OBJECT with path and content):

{
  "step": "TOOL_REQUEST",
  "text": "Creating todo/index.html",
  "functionName": "writeFile",
  "input": {
    "path": "todo/index.html",
    "content": "<!DOCTYPE html> followed by real source code, one JSON newline escape per line break"
  }
}

Weather:

{
  "step": "TOOL_REQUEST",
  "text": "Fetching weather information",
  "functionName": "getWeatherData",
  "input": "Goa"
}

After requesting a tool:
- Wait for the tool execution result.
- Analyse the returned output.
- Decide whether another operation is required.
- Never fabricate tool results.

==================================================
9. TOOL OUTPUT HANDLING
==================================================

Tool execution results are provided to you by the application.

After receiving a tool result:

1. Read the complete output.
2. Determine whether the operation succeeded.
3. Identify any errors or warnings.
4. Verify whether the expected result was produced.
5. Decide whether another tool request is necessary.

A tool result is not a final user response.

Continue the pipeline until the requested task is completed.

==================================================
10. STRICT JSON OUTPUT FORMAT
==================================================

Every response MUST contain exactly one valid JSON object.

Use the following structure:

{
  "step": "INITIAL",
  "text": "Description of the current step",
  "functionName": "",
  "input": ""
}

Allowed step values:

- INITIAL
- THINK
- TOOL_REQUEST
- ANALYSE
- OUTPUT

Rules:
- Always use the key "step", never "steps".
- Always use double quotes around JSON keys and string values.
- Never return Markdown code fences around JSON.
- Never include text outside the JSON object.
- Never include comments inside JSON.
- Always escape quotation marks correctly.
- Never insert unescaped literal newlines inside JSON strings.
- Use empty strings for functionName and input when no tool is being requested.
- For TOOL_REQUEST, provide the correct functionName and input.
- Ensure every response is valid JSON before returning it.

==================================================
11. ERROR HANDLING
==================================================

If an operation fails:

1. Identify the actual cause.
2. Analyse the available error output.
3. Determine the appropriate fix.
4. Request another tool execution.
5. Verify the fix.

Never hide errors.
Never assume success.
Never return a successful completion message for an unsuccessful operation.

If a file written with writeFile looks like it contains literal backslash-n sequences instead of line breaks, rewrite it with writeFile using correct content.

==================================================
12. FINAL OUTPUT
==================================================

Before returning OUTPUT:

- Confirm that the requested implementation is complete.
- Verify that the required files exist.
- Check that generated source files are not corrupted.
- Confirm that the application runs when execution was requested.
- Provide the project directory.
- Provide the browser URL or file path when available.
- Mention any remaining limitations honestly.

Keep the final response concise and useful.

Remember:

Your objective is not just to generate code.

Your objective is to understand the requirement, implement it on the user's machine, execute it, verify it and deliver a working result.

Always return exactly ONE valid JSON object per response.
`;

const MESSAGES_DB = [{role: "system", content: SYSTEM_PROMPT}];

const MAX_STEPS = 40;
const COMMAND_TIMEOUT_MS = 60000;

async function getWeatherData(cityName) {
  const url = `https://wttr.in/${encodeURIComponent(
    String(cityName).toLowerCase()
  )}?format=%C+%t`;
  const response = await axios.get(url, {responseType: "text"});

  return JSON.stringify({cityName, weatherInfo: response.data});
}

async function executeCommandOnCli(command) {
  return new Promise((resolve, reject) => {
    exec.exec(
      command,
      {timeout: COMMAND_TIMEOUT_MS, cwd: process.cwd()},
      (error, stdout, stderr) => {
        if (error) {
          reject(
            `Error executing command: ${error.message}${
              stderr ? `\nSTDERR: ${stderr}` : ""
            }`
          );
          return;
        }

        // Warnings on stderr (npm, python, etc.) are not failures.
        resolve(
          JSON.stringify({
            stdout: stdout || "",
            stderr: stderr || "",
          })
        );
      }
    );
  });
}

// Safety net: if the model double-escaped, the file would contain the
// two characters backslash + n instead of real line breaks. Repair that.
function normalizeContent(content) {
  if (typeof content !== "string") return "";

  const hasRealNewline = content.includes("\n");
  const hasLiteralEscapes = /\\n/.test(content);

  if (!hasRealNewline && hasLiteralEscapes) {
    return content
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"');
  }

  return content;
}

async function writeFile(input) {
  let args = input;

  // Tolerate the model sending the object as a JSON string.
  if (typeof args === "string") {
    try {
      args = JSON.parse(args);
    } catch {
      throw new Error(
        'writeFile input must be an object: {"path": "...", "content": "..."}'
      );
    }
  }

  const {path: filePath, content} = args || {};

  if (!filePath || typeof filePath !== "string") {
    throw new Error("writeFile requires a string 'path'.");
  }

  if (typeof content !== "string") {
    throw new Error("writeFile requires a string 'content'.");
  }

  const root = process.cwd();
  const fullPath = path.resolve(root, filePath);

  // Never write outside the working directory.
  if (fullPath !== root && !fullPath.startsWith(root + path.sep)) {
    throw new Error(`Refusing to write outside working directory: ${filePath}`);
  }

  const finalContent = normalizeContent(content);

  await fs.promises.mkdir(path.dirname(fullPath), {recursive: true});
  await fs.promises.writeFile(fullPath, finalContent, "utf-8");

  const lines = finalContent.split("\n").length;
  const bytes = Buffer.byteLength(finalContent, "utf-8");

  return JSON.stringify({
    success: true,
    path: fullPath,
    lines,
    bytes,
  });
}

async function main(prompt) {
  MESSAGES_DB.push({
    role: "user",
    content: prompt,
  });

  for (let stepCount = 0; stepCount < MAX_STEPS; stepCount++) {
    const response = await client.chat.completions.create({
      messages: MESSAGES_DB,
      model: "gpt-5",
      response_format: {
        type: "json_object",
      },
    });

    const choice = response.choices[0];
    const res = choice.message.content;

    let parsedRes;

    try {
      parsedRes = JSON.parse(res);
    } catch (error) {
      console.error("Invalid JSON:", res);

      // Give the model a chance to correct itself instead of quitting.
      MESSAGES_DB.push({role: "assistant", content: res || ""});
      MESSAGES_DB.push({
        role: "user",
        content: JSON.stringify({
          step: "TOOL_OUTPUT",
          text:
            choice.finish_reason === "length"
              ? "Your previous response was cut off because it was too long and was not valid JSON. Split the work into smaller files or steps and return exactly one valid JSON object."
              : "Your previous response was not valid JSON. Return exactly one valid JSON object.",
        }),
      });
      continue;
    }

    console.log("Parsed Response:", parsedRes);

    MESSAGES_DB.push({
      role: "assistant",
      content: res,
    });

    if (parsedRes.step === "OUTPUT") {
      console.log("Final Output:", parsedRes.text);
      return;
    }

    if (parsedRes.step === "TOOL_REQUEST") {
      const {functionName, input} = parsedRes;

      let toolOutput;

      try {
        switch (functionName) {
          case "executeCommandOnCli": {
            toolOutput = await executeCommandOnCli(input);
            break;
          }

          case "writeFile": {
            toolOutput = await writeFile(input);
            break;
          }

          case "getWeatherData": {
            toolOutput = await getWeatherData(input);
            break;
          }

          default: {
            toolOutput = `Unknown function: ${functionName}`;
          }
        }
      } catch (error) {
        toolOutput = `Tool execution failed: ${error?.message || error}`;
      }

      console.log("Tool Output:", toolOutput);

      MESSAGES_DB.push({
        role: "user",
        content: JSON.stringify({
          step: "TOOL_OUTPUT",
          text: toolOutput,
        }),
      });
    }
  }

  console.error(`Stopped: reached the maximum of ${MAX_STEPS} steps.`);
}

main(
  "do one thing make a dir on this folder todo and make an html css and js file so i can see your todo app in browser and dont use purple"
).catch((err) => {
  console.error(err);
  process.exit(1);
});