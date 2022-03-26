module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'subject-case': [
      2,
      'always',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case', 'lower-case']
    ],
    'type-enum': [
      2,
      'always',
      [
        'ci',
        'dx',
        'wip',
        'fix',
        'feat',
        'docs',
        'deps',
        'perf',
        'test',
        'build',
        'chore',
        'types',
        'style',
        'sample',
        'release',
        'refactor',
        'workflow'
      ]
    ]
  }
}
