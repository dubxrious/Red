// This script checks for incorrect usage of `next/headers` in client components.
// It's designed to be run as a pre-commit hook.

import chalk from "chalk"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

const rootDir = process.cwd()

function findClientComponents(dir: string): string[] {
  const files: string[] = []

  const items = fs.readdirSync(dir)
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (item !== "node_modules" && item !== ".next") {
        files.push(...findClientComponents(fullPath))
      }
    } else if (
      stat.isFile() &&
      (item.endsWith(".js") || item.endsWith(".jsx") || item.endsWith(".ts") || item.endsWith(".tsx"))
    ) {
      files.push(fullPath)
    }
  }

  return files
}

function checkFileForNextHeadersImport(filePath: string): boolean {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8")
    return fileContent.includes("next/headers") && fileContent.includes("use client")
  } catch (error) {
    console.error(chalk.red(`Error reading file ${filePath}: ${error}`))
    return false
  }
}

function getGitModifiedFiles(): string[] {
  try {
    const output = execSync("git diff --name-only --cached", { encoding: "utf-8" })
    return output.split("\n").filter(Boolean)
  } catch (error) {
    console.error(chalk.red(`Error executing git command: ${error}`))
    return []
  }
}

function main() {
  const modifiedFiles = getGitModifiedFiles()
  const clientComponents = findClientComponents(rootDir)

  let hasErrors = false

  for (const filePath of clientComponents) {
    if (modifiedFiles.includes(filePath) && checkFileForNextHeadersImport(filePath)) {
      console.error(chalk.red(`Error: ${filePath} imports 'next/headers' in a client component. This is not allowed.`))
      hasErrors = true
    }
  }

  if (hasErrors) {
    process.exit(1)
  } else {
    console.log(chalk.green("No invalid next/headers imports found in client components."))
  }
}

main()

