#!/usr/bin/env node
import { promisify } from "util";
import cp from "child_process";
import path from "path";
import fs from "fs";
import ora from "ora";

const exec = promisify(cp.exec);

if (process.argv.length < 3) {
  console.log("You have to provide a name to your app.");
  console.log("For example : npx create-nrv-template my-api-name");
  process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);

const git_repo = "https://github.com/lvothnrv/nrv-template";

if (fs.existsSync(projectPath)) {
  console.log(
    `The file ${projectName} already exist in the current directory, please give it another name.`
  );
  process.exit(1);
} else {
  fs.mkdirSync(projectPath);
}

try {
  const spinner = ora("Initialization of the project.").start();
  await exec(`git clone --depth 1 ${git_repo} ${projectPath} --quiet`);

  process.chdir(projectPath);

  await fs.promises.readFile("./package.json", "utf8").then(async (data) => {
    let json = JSON.parse(data);
    json.version = '0.0.1';
    json.name = projectName;

    await fs.promises.writeFile("./package.json", JSON.stringify(json));
  });

  spinner.text = "Installing dependencies";
  await exec("npm install");

  spinner.text = "The installation is done.";
  spinner.succeed();

  console.log("");
  console.log("You can now run your app with :");
  console.log(`cd ${projectName}`);
  console.log(`npm run dev`);
} catch (error) {
  fs.rmSync(projectPath, { recursive: true, force: true });
  console.log(error);
}
