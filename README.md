# GitHub Dispatch Webhook

A lightweight Cloudflare Workers implementation for triggering GitHub repository dispatch events. This webhook service provides a simple and secure way to trigger GitHub Actions workflows remotely.

## Features

- Serverless implementation using Cloudflare Workers
- Minimal configuration required
- Secure GitHub token handling
- Dynamic repository targeting via URL path
- Custom event type support via URL path
- Preserves original request headers and body content
- Easy to deploy and maintain

## Prerequisites

- Cloudflare account
- GitHub account with repository access
- GitHub Personal Access Token with `repo` scope

## Quick Start Guide

### 1. Fork and Configure Repository
1. [Fork this repository](https://github.com/lirtual/github-dispatch-webhook/fork) by clicking the 'Fork' button in the top-right corner
2. Go to your forked repository's settings
3. Navigate to 'Secrets and variables' → 'Actions'
4. Add the following repository secret:
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token

### 2. Setup Cloudflare Worker
1. Log in to your Cloudflare dashboard
2. Navigate to Workers & Pages
3. Create a new Worker
4. Copy the content from `_worker.js` to your new Worker
5. Add Environment Variable in your Worker settings:
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token

### 3. Deploy and Test
1. Deploy your Worker using the Cloudflare dashboard
2. Test the webhook by sending a POST request to your Worker URL:
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/webhook/owner/repo/deploy
```

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/github-dispatch-webhook.git
cd github-dispatch-webhook
```

### 2. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 3. Configure environment variables
In your Cloudflare Workers dashboard, set the following environment variable:

- `GITHUB_TOKEN`: Your GitHub Personal Access Token

### 4. Deploy to Cloudflare Workers
```bash
wrangler publish
```

## Usage

Send a POST request to your worker's URL with the repository and event type in the path:

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/webhook/{owner}/{repo}/{event_type}
```

For example:
```bash
# Trigger a 'deploy' event
curl -X POST https://your-worker.your-subdomain.workers.dev/webhook/ray-workspace/cognideep_server/deploy

# Trigger a 'test' event
curl -X POST https://your-worker.your-subdomain.workers.dev/webhook/ray-workspace/cognideep_server/test
```

You can also include a JSON body that will be forwarded to the GitHub API:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"client_payload": {"environment": "production"}}' \
  https://your-worker.your-subdomain.workers.dev/webhook/ray-workspace/cognideep_server/deploy
```

## Configuration

### wrangler.toml
```toml
name = "github-dispatch-webhook"
main = "_worker.js"
compatibility_date = "2023-01-01"

[vars]
# Only GITHUB_TOKEN is required as an environment variable
# REPO_PATH and event_type are now specified in the URL path
```

## Security Considerations

- Never commit your GitHub token to the repository
- Use environment variables for sensitive information
- Consider implementing additional authentication for the webhook endpoint
- Regularly rotate your GitHub token

## Development

To run locally:
```bash
wrangler dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any problems or have suggestions, please open an issue in the GitHub repository.

## Acknowledgments

- Cloudflare Workers
- GitHub API
