import prompts from 'prompts';

// prompts is badly typed so we have some more specific typed APIs
// prompts also returns an undefined value on SIGINT which we really just want to exit on

async function confirmPromptImpl(message: string, initial = true): Promise<boolean> {
  const { value } = await prompts({
    name: 'value',
    type: 'confirm',
    message,
    initial
  });
  if (value === undefined) {
    process.exit(1);
  }
  return value;
}

async function textPromptImpl(message: string): Promise<string> {
  console.log('propmt get message');
  console.log(message);
  const { value } = await prompts({
    name: 'value',
    type: 'text',
    message
  });
  if (value === undefined) {
    process.exit(1);
  } else {
  }
  console.log(value);
  return value;
}

// eslint-disable-next-line import/no-mutable-exports
export let shouldPrompt = process.stdout.isTTY && !process.env.SKIP_PROMPTS;

// eslint-disable-next-line import/no-mutable-exports
export let confirmPrompt = confirmPromptImpl;
// eslint-disable-next-line import/no-mutable-exports
export let textPrompt = textPromptImpl;

// we could do this with jest.mock but i find jest.mock unpredictable and this is much easier to understand
// eslint-disable-next-line @typescript-eslint/no-shadow
export function mockPrompts(prompts: {
  text: (message: string) => Promise<string>;
  confirm: (message: string) => Promise<boolean>;
  shouldPrompt: boolean;
}) {
  confirmPrompt = prompts.confirm;
  textPrompt = prompts.text;
  shouldPrompt = prompts.shouldPrompt;
}

export function resetPrompts() {
  confirmPrompt = confirmPromptImpl;
  textPrompt = textPromptImpl;
}
