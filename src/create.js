import chalk from 'chalk';
import { $ } from 'execa';
import prompts from 'prompts';

const codingUrl = 'https://e.coding.net/haplox/hdc/hdc-web.git'

const init = async () => {
  const response = await prompts([
    {
      type: 'select',
      name: 'appType',
      message: '请选择要创建的应用',
      choices: [
        { title: 'web 主应用', value: 'web-app-main' },
        { title: 'web 子应用', value: 'web-app' },
      ],
    },
    {
      type: 'text',
      name: 'appName',
      message: '请输入应用名称',
    },
  ]);
  const { appName } = response

  console.log(chalk.gray('🚚 Generating...'))

  try {
    await $`git clone ${codingUrl} ${appName} --depth=1`
    await $`rm -rf ./${appName}/.git`
    console.log(chalk.gray('✅ Generate success!'))
  } catch (error) {
    console.error(error)
    process.exit(1);
  }
}

export {
  init
}