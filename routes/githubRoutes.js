const shell = require('shelljs');
const config = require('config');

// https://github.com/pksunkara/octonode
// Rate limit: 5000 calls per hour
const github = require('octonode');
const client = github.client(config.get('github.access_token'));
const ghOrg = client.org(config.get('github.organization_name'));

const Utils = require('../repoUtils')({ ghOrg, shell });

// Generate repo for candidate
app.post('/generate_assessment', async function (req, res) {
  const name = 'TEST-REPO'
        description = 'Test repo for assessment.',
        private = false; // Private repos are only allowed for paid accounts.

  try {
    let response = await Utils.createRepo({
      name,
      description,
      private,
    });

    // Push local files to repo
    let url = response[0].html_url;
    Utils.pushTestAssessmentToGit(url);
  }
  catch(e) {
    console.error(e.message);
    res
      .status(500)
      .send(e.message);
  }

  res.send('Repo was successfully created.');
});

// Add collaborator to repo
app.put('/repos/:repoId/collaborators/:collaboratorId', async function(req, res) {
  // repoId: kode-dev
  // collaboratorId: candidate github handle
  const { repoId, collaboratorId } = req.params;

  const owner    = process.env.GITHUB_ORGANIZATION,
        repo     = repoId,
        username = collaboratorId,
        path     = `/repos/${owner}/${repo}/collaborators/${username}`,
        options  = {
          permission: 'push',
        };

  try {
    await client.putAsync(path, options);
  }
  catch(e) {
    console.error(e.message);
    res
      .status(500)
      .send(`An error occurred while adding ${collaboratorId} as a collaborator to ${repoId}.`);
  }

  res.send(`${collaboratorId} was successfully added as a collaborator to ${repoId}`)
});

// Remove collaborator from repo
app.delete('/repos/:repoId/collaborators/:collaboratorId', async function(req, res) {
  // repoId: kode-dev
  // collboratorId: candidate github handle
  const { repoId, collaboratorId } = req.params;

  const owner    = process.env.GITHUB_ORGANIZATION,
        repo     = repoId,
        username = collaboratorId,
        path     = `/repos/${owner}/${repo}/collaborators/${username}`;

  try {
    await client.delAsync(path, {});
  }
  catch(e) {
    console.error(e.message);
    res
      .status(500)
      .send(`An error occurred while removing ${collaboratorId} as a collaborator to ${repoId}.`)
  }

  res.send(`${collaboratorId} was successfully removed as a collaborator to ${repoId}`)
});
