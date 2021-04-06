"use strict";

const commander = require("commander");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const envinfo = require("envinfo");
const chalk = require("chalk");
const childProcess = require("child_process");
const validate = require("validate-npm-package-name");
const packageJson = require("./package.json");

const { execSync, spawn } = childProcess;

// 用于后面直接一次性在该目录生成文件
let currentPath;

function init() {
  const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments("<directory>")
    .usage(`${chalk.green("<directory>")} [options]`)
    .description("初始化项目, 简单的脚手架")
    .action((cmd) => {
      currentPath = cmd;
    })
    .option("--lerna", "use lerna")
    .option("--ts", "use TypeScript")
    .option("--info", "print environment debug info")
    .allowUnknownOption()
    .parse(process.argv);

  if (program.info) {
    console.log(chalk.bold("\nEnvironment Info:"));
    console.log(
      `\n  current version of ${packageJson.name}: ${packageJson.version}`
    );
    console.log(`  running from ${__dirname}`);
    return envinfo
      .run(
        {
          System: ["OS", "CPU"],
          Binaries: ["Node", "npm", "Yarn"],
          Browsers: [
            "Chrome",
            "Edge",
            "Internet Explorer",
            "Firefox",
            "Safari",
          ],
          npmGlobalPackages: ["pan-cli"],
        },
        {
          duplicates: true,
          showNotFound: true,
        }
      )
      .then(console.log);
  }

  if (typeof currentPath === "undefined") {
    console.error("Please specify the project directory:");
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green("<directory>")}`
    );
    console.log();
    console.log("For example:");
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green("my-react-app")}`
    );
    console.log();
    console.log(
      `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  createProject();

  async function createProject() {
    const root = path.resolve(currentPath);
    const appName = path.basename(root);

    checkAppName(appName);

    if (fs.existsSync(root)) {
      const isExist = await inquirer.prompt({
        type: "confirm",
        name: "exist",
        message: `是否覆盖该${appName}目录下的数据`,
      });

      if (!isExist.exist) {
        process.exit(1);
      } else {
        fs.emptyDirSync(root);
      }
    } else {
      fs.ensureDirSync(root);
    }

    // const  = await inquirer.prompt({
    //   type:"list",

    // })

    console.log();

    console.log(`Creating a new project in ${chalk.green(root)}.`);

    console.log();

    console.log(__dirname);

    fs.copySync(path.resolve(__dirname, "./template"), root);

    fs.writeFileSync(
      path.resolve(root, "package.json"),
      JSON.stringify(
        {
          ...fs.readJsonSync(
            path.resolve(__dirname, "./template/package.json")
          ),
          name: appName,
        },
        null,
        2
      ) + os.EOL
    );

    const useYarn = shouldUseYarn();

    const useNpm = shouldUseNpm();

    let command;
    let args = [];

    if (!useYarn && !useNpm) {
      process.exit(1);
    }

    // const originalDirectory = process.cwd();

    process.chdir(root);

    if (useYarn) {
      command = "yarn";
      args = ["install", "--exact"];
    } else if (useNpm) {
      command = "npm";
      args = ["install", "--save", "--save-exact", "--loglevel", "error"];
    }

    spawn(command, args, { stdio: "inherit" }).on("close", (code) => {
      if (code !== 0) {
        console.log();
        console.log("Aborting installation.");
        console.log(`  ${chalk.cyan(command)} has failed.`);

        process.exit(1);
      }
    });
  }

  function checkAppName(appName) {
    const validationResult = validate(appName);

    if (!validationResult.validForNewPackages) {
      console.error(
        chalk.red(
          `Cannot create a project named ${chalk.green(
            `"${appName}"`
          )} because of npm naming restrictions:\n`
        )
      );
      [
        ...(validationResult.errors || []),
        ...(validationResult.warnings || []),
      ].forEach((error) => {
        console.error(chalk.red(`  * ${error}`));
      });
      console.error(chalk.red("\nPlease choose a different project name."));
      process.exit(1);
    }
  }

  function shouldUseYarn() {
    try {
      execSync("yarn --version", { stdio: "ignore" });
      return true;
    } catch (e) {
      return false;
    }
  }

  function shouldUseNpm() {
    try {
      execSync("npm --version", { stdio: "ignore" });
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = {
  init,
};
