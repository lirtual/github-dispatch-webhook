export default {
  async fetch(request, env, ctx) {
    // Base URL and repository path configuration
    const GITHUB_BASE_URL = 'https://api.github.com/repos';
    
    // Check if request method is POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        message: 'Only POST requests are accepted'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Allow': 'POST'
        }
      });
    }
    
    // Get repository path from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    // Check if URL follows the expected format /webhook/{owner}/{repo}/{event_type}
    if (pathParts.length < 5 || pathParts[1] !== 'webhook') {
      return new Response(JSON.stringify({
        error: 'Invalid URL format',
        message: 'URL should be in format: /webhook/{owner}/{repo}/{event_type}'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      });
    }
    
    // Extract owner, repo and event_type from URL path
    const REPO_PATH = `${pathParts[2]}/${pathParts[3]}`;
    const EVENT_TYPE = pathParts[4];
    const GITHUB_API_URL = `${GITHUB_BASE_URL}/${REPO_PATH}/dispatches`;
    const GITHUB_TOKEN = env.GITHUB_TOKEN;

    try {
      // Get original request headers
      const originalHeaders = {};
      request.headers.forEach((value, key) => {
        // 将头部名称转换为小写以避免重复
        originalHeaders[key.toLowerCase()] = value;
      });

      // Parse original request body
      let originalBody = {};
      let hasBody = false;
      try {
        const clonedRequest = request.clone();
        const bodyText = await clonedRequest.text();
        if (bodyText && bodyText.trim() !== '') {
          originalBody = JSON.parse(bodyText);
          hasBody = true;
        }
      } catch (e) {
        console.error("Failed to parse request body:", e);
      }

      // 先初始化头部对象，包含所有原始请求头
      const headers = { ...originalHeaders };
      
      // 然后设置必需的GitHub API头部，覆盖任何可能存在的同名头部
      headers['authorization'] = `token ${GITHUB_TOKEN}`;
      headers['user-agent'] = originalHeaders['user-agent'] || 'CloudflareWorker/1.0';
      headers['accept'] = originalHeaders['accept'] || '*/*';
      headers['content-type'] = 'application/json';

      // 构建GitHub API请求体 - 采用与头部相同的处理方式
      // 先使用原始请求体（如果有）
      let bodyContent = {
        event_type: EVENT_TYPE,
        client_payload: hasBody ? originalBody : {}
      };

      const body = JSON.stringify(bodyContent);

      console.log('Sending request to GitHub API:', {
        url: GITHUB_API_URL,
        headers: headers,
        body: body
      });

      const response = await fetch(GITHUB_API_URL, {
        method: 'POST',
        headers: headers,
        body: body
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      return new Response(`Deployment triggered successfully with event type: ${EVENT_TYPE}`, {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Deployment trigger failed',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      });
    }
  }
};