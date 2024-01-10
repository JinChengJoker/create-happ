import chalk from 'chalk';
import { $ } from 'execa';
import prompts from 'prompts';

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

  console.log(chalk.gray('🚚 Generating...'))

  try {
    await $`git clone ${template.repoUrl} ${appName} --depth=1`
    await $`rm -rf ./${appName}/.git`
    console.log(chalk.gray('✨ Generate success!'))
    console.log(chalk.gray(`\nNext run:\n`))
    console.log(`  cd ${appName}`)
    console.log(`  yarn install`)
    console.log(`  yarn dev`)
    console.log()
  } catch (error) {
    console.error(error)
    process.exit(1);
  }
}

export {
  init
}