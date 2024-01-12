import chalk from 'chalk';
import { $ } from 'execa';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url'
import { Command, Option } from 'commander'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesConfig = [
  {
    type: 'web-master',
    title: 'web 主应用',
    repoUrl: 'https://e.coding.net/haplox/hapweb/template-web-master.git',
  },
  {
    type: 'web',
    title: 'web 子应用',
    repoUrl: 'https://e.coding.net/haplox/hapweb/template-web.git',
  },
]

const runCommander = () => {
  const pkgPath = path.join(__dirname, '..', 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const program = new Command();
  const typeChoices = templatesConfig.map(t => t.type)

  program
    .version(pkg.version)
    .addOption(new Option('-t, --type <type>', 'project type').choices(typeChoices))
    .option('-n, --name <name>', 'project name')

  program.parse();

  const options = program.opts();
  const { type, name } = options

  if (!type) {
    console.log('\n');
    console.log(chalk.red(`✖ 参数 '-t, --type <type>' 缺失`))
    console.log('\n');
    process.exit(1);
  }

  if (!name) {
    console.log('\n');
    console.log(chalk.red(`✖ 参数 '-n, --name <name>' 缺失`))
    console.log('\n');
    process.exit(1);
  }

  generator({
    templateType: type,
    appName: name
  })
}

const runPrompts = async () => {
  const appTypeChoices = templatesConfig.map(t => ({
    title: t.title,
    value: t.type
  }))

  const response = await prompts(
    [
      {
        type: 'select',
        name: 'templateType',
        message: '请选择要创建的应用',
        choices: appTypeChoices,
      },
      {
        type: 'text',
        name: 'appName',
        message: '请输入应用名称',
      },
    ],
    {
      onCancel: () => {
        console.log('\n');
        console.log(chalk.red(`✖ 操作已取消`))
        console.log('\n');
        process.exit()
      },
    },
  );
  const { templateType, appName } = response

  generator({
    templateType, appName
  })
}

const generator = async (options) => {
  const { templateType, appName } = options
  const template = templatesConfig.find(t => t.type === templateType)
  const dirName = /-web$/.test(appName) ? appName : `${appName}-web`
  const projectPath = path.resolve(dirName);

  if (
    fs.existsSync(projectPath) &&
    fs.statSync(projectPath).isDirectory() &&
    fs.readdirSync(projectPath).length > 0
  ) {
    console.log('\n');
    console.log(chalk.red('🙈 当前目录下已存在同名且非空项目'));
    console.log('\n');
    process.exit(1);
  }

  console.log(chalk.gray('🚚 Generating...'))

  try {
    await $`git clone ${template.repoUrl} ${dirName} --depth=1`

    // 删除 .git
    const gitDirPath = path.join(projectPath, '.git')
    fs.removeSync(gitDirPath)

    // 更新 package.json
    const projectPkgPath = path.join(projectPath, 'package.json')
    const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, 'utf-8'))
    projectPkg.name = appName
    fs.writeFileSync(projectPkgPath, JSON.stringify(projectPkg, null, 2) + '\n')

    if (templateType === 'web') {
      // 生成 Dockerfile
      const dfTemplatePath = path.join(__dirname, '..', `template-${templateType}`, 'Dockerfile')
      const dfTemplateString = fs.readFileSync(dfTemplatePath, 'utf-8')
      const dfPath = path.join(projectPath, 'Dockerfile')
      const dfString = dfTemplateString.replace(/{{template}}/g, appName)
      fs.writeFileSync(dfPath, dfString)
    }

    console.log(chalk.gray('✨ Generate success!'))
    console.log(chalk.gray(`\nNext run:\n`))
    console.log(`  cd ${dirName}`)
    console.log(`  yarn install`)
    console.log(`  yarn dev`)
    console.log('\n');
  } catch (error) {
    fs.removeSync(projectPath)
    console.log(chalk.red(`✖ ${error.message}`))
    process.exit(1);
  }
}

const init = () => {
  if (process.argv.length > 2) {
    runCommander()
  } else {
    runPrompts()
  }
}

export {
  init
}