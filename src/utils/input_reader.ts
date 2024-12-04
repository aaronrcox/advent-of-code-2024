

export async function readFileStr(filePath: string): Promise<string> {

    if(typeof Deno !== "undefined") {
        const decoder = new TextDecoder("utf-8");
        const data = await Deno.readFile(filePath);
        return decoder.decode(data);
    }
    

    const response = await fetch(filePath);
    const text = await response.text();
    return text;
}