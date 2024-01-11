import chalk from 'chalk';
import { $ } from 'execa';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';

const templatesConfig = [
  {
    key: 'web-app-master',
    title: 'web 主应用',
    repoUrl: 'https://e.coding.net/haplox/hapweb/template-web-master.git',
  },
  {
    key: 'web-app',
    title: 'web 子应用',
    repoUrl: 'https://e.coding.net/haplox/hapweb/template-web.git',
  },
]

const appTypeChoices = templatesConfig.map(t => ({
  title: t.title,
  value: t.key
}))

const init = async () => {
  const response = await prompts([
    {
      type: 'select',
      name: 'appType',
      message: '请选择要创建的应用',
      choices: appTypeChoices,
    },
    {
      type: 'text',
      name: 'appName',
      message: '请输入应用名称',
    },
  ]);
  const { appType, appName } = response
  const template = templatesConfig.find(t => t.key === appType)
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
    await $`rm -rf ./${dirName}/.git`

    const pkgPath = path.join(projectPath, `package.json`)
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = appName
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

    console.log(chalk.gray('✨ Generate success!'))
    console.log(chalk.gray(`\nNext run:\n`))
    console.log(`  cd ${dirName}`)
    console.log(`  yarn install`)
    console.log(`  yarn dev`)
    console.log('\n');
  } catch (error) {
    await $`rm -rf ./${dirName}`
    console.error(error)
    process.exit(1);
  }
}

export {
  init
}