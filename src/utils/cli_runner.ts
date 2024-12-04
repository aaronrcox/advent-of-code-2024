import { cliMenu } from "./cli_menu.ts";

export async function runChallenge(day: string, part: string, inputFile?: string | undefined): Promise<void> {

    const challengePath = `../challenges/${day}/${part}.ts`;
    const inputDir = `./src/challenges/${day}/inputs`;

    // Determine the input file, prompt user if not provided
    if (!inputFile) {
        inputFile = await selectInputFile(part, inputDir);
    }

    const inputFilePath = `${inputDir}/${inputFile}`;

    try {
        const { solver } = await import(challengePath);
        const solverGenerator = solver(inputFilePath);

        for await (const output of solverGenerator) {
            console.log(output);
        }
    } catch (error) {
        handleRunError(day, part, error);
        Deno.exit(1);
    }
}

// Helper function to select input file
async function selectInputFile(part: string, inputDir: string): Promise<string> {
    const files: string[] = [];
    for await (const dirEntry of Deno.readDir(inputDir)) {

		const inputName = dirEntry.name;

		if (
			(part === "part1" && inputName.includes(".part1.txt")) ||
			(part === "part2" && inputName.includes(".part2.txt")) ||
			(!inputName.includes(".part1.txt") && !inputName.includes(".part2.txt"))
		  ) {
			files.push(inputName);
		  }
    }
    return cliMenu(files);
}

// Error handling helper
function handleRunError(day: string, part: string, error: unknown): void {
    if (error instanceof Error) {
        console.error(`Failed to run challenge ${day} ${part}:`, error.message);
    } else {
        console.error(`Failed to run challenge ${day} ${part}:`, error);
    }
}