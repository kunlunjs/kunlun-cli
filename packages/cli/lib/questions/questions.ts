import type { Answers, Question } from 'inquirer'

export const generateInput = (name: string, message: string) => {
  return (defaultAnswer: string): Question<Answers> => ({
    type: 'input',
    name,
    message,
    default: defaultAnswer
  })
}

export const generateSelect = (
  name: string
): ((message: string) => (choices: string[]) => Question<Answers>) => {
  return (message: string) => {
    return (choices: string[]) => ({
      type: 'list',
      name,
      message,
      choices
    })
  }
}
