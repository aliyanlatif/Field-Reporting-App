const baseUrl = process.env.SERVER_URL ?? 'http://localhost:4000';

const aliases: Record<string, string> = {
  latency: 'latencyMs',
  drop: 'dropRate',
  'lose-response': 'loseResponseRate',
  error: 'errorRate',
  'refuse-uploads': 'refuseUploads',
  hang: 'hang',
  'drop-upload-after': 'dropUploadAfterBytes',
};

const usage = `Usage: npm run chaos -- <command | name=value ...>

Commands:  status | off
Settings:  ${Object.keys(aliases).join(' | ')}
  latency=3000            delay every /reports request by 3000 ms
  drop=0.3                destroy the connection before handling 30% of requests
  lose-response=0.3       handle the request, then drop the response on 30% of requests
  error=0.3               answer 503 on 30% of requests
  refuse-uploads=true     answer 403 to image uploads
  hang=true               never answer /reports requests
  drop-upload-after=500000  cut an image upload after 500000 bytes`;

function parseValue(raw: string): number | boolean {
  if (raw === 'true' || raw === 'false') {
    return raw === 'true';
  }
  return Number(raw);
}

async function call(method: string, body?: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}/chaos`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  console.log(JSON.stringify(await response.json(), null, 2));
  process.exitCode = response.ok ? 0 : 1;
}

async function main(args: string[]) {
  if (args.length === 0) {
    console.log(usage);
  } else if (args[0] === 'status') {
    await call('GET');
  } else if (args[0] === 'off') {
    await call('DELETE');
  } else {
    const patch: Record<string, unknown> = {};
    for (const arg of args) {
      const [name, raw = ''] = arg.split('=');
      patch[aliases[name] ?? name] = parseValue(raw);
    }
    await call('POST', patch);
  }
}

main(process.argv.slice(2)).catch(error => {
  console.error(`Could not reach ${baseUrl}: ${error.message}`);
  process.exitCode = 1;
});
