
/**
 * Prompts the user for input.
 * @param message - The message to display to the user.
 * @returns The user's input as a string.
 */
export const prompt = async (message: string): Promise<string> => {
    await Deno.stdout.write(new TextEncoder().encode(message));
    const buffer = new Uint8Array(1024);
    const n = await Deno.stdin.read(buffer);
    if (n === null) throw new Error("No input received");
    return new TextDecoder().decode(buffer.subarray(0, n)).trim();
};



/**
 * Displays a CLI menu and returns the selected option.
 * @param options - An array of options to display.
 * @returns The selected option.
 */
export const cliMenu = async (options: string[]): Promise<string> => {
    console.log("Please choose an option:\n");
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
  
    const choice = parseInt(
      await prompt("\nEnter the number of your choice: "),
      10
    );
  
    if (isNaN(choice) || choice < 1 || choice > options.length) {
      console.log("\nInvalid choice. Please try again.");
      return cliMenu(options); // Recurse if invalid input
    }
  
    console.log(`\nYou selected: ${options[choice - 1]}`);
    return options[choice - 1];
};