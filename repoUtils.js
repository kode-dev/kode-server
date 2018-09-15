const shellExec = (shell, command) => {
  if (res = shell.exec(command).code !== 0) {
    console.error(`Shell command failed: ${command}`);
    throw new Error(`Shell command failed: ${command}`);
  }
};

module.exports = function({ ghOrg, shell }) {
  return {
    pushTestAssessmentToGit(url) {
      if (!shell.which('git')) {
        shell.echo('please install git.');
        shell.exit(1);
        throw new error('please install git.');
      }

      shell.cd('assessment-test');

      shellExec(shell, 'git init');
      shellExec(shell, 'git add .');
      shellExec(shell, 'git commit -m "Add test assessment"');
      // RIGHT HERE
      shellExec(shell, `git remote add origin ${url}`);
      shellExec(shell, 'git push -u origin master');

      shell.rm('-rf', '.git');
    },

    async createRepo({ name, description, private=true }) {
      try {
        return await ghOrg.repoAsync({
          name,
          description,
          private,
        });
      }
      catch(e) {
        throw new Error('An error occurred while creating a repo.');
      }
    },

    async forkRepo(repo) {
      const owner   = process.env.GITHUB_ORGANIZATION,
            path    = `/repos/${owner}/${repo}/forks`,
            options = {
              organization: process.env.GITHUB_ORGANIZATION,
            };

      try {
        return await client.postAsync(path, options);
      }
      catch(e) {
        throw new Error(`An error occurred while forking ${repo}`);
      }
    },
  };
};
