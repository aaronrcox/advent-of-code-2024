

import { runChallenge } from "./src/utils/cli_runner.ts";

if (import.meta.main) {
  const args = Deno.args;

  if (args.length < 2) {
    console.error("Usage: deno run --allow-read main.ts <day> <part> <input?>");
    console.error("Example: deno run --allow-read main.ts day00 part1");
    Deno.exit(1);
  }

  const [day, part, input] = args;
  await runChallenge(day, part, input);
}

