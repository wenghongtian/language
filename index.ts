import prompt from "prompt";
import Parser from "./fronted/parser";
import { evaluate } from "./runtime/interpreter";
import Environment from "./runtime/environment";
import { readFileSync } from "fs";

async function run() {
  const parser = new Parser();
  const env = new Environment();
  const source = readFileSync("./input.js", { encoding: "utf-8" });
  const program = parser.produceAst(source as string);
  console.dir(program, { depth: null });
  const result = evaluate(program, env);
  console.log(result);
}

async function main() {
  prompt.start();
  const parser = new Parser();
  const env = new Environment();

  while (true) {
    const { source } = await prompt.get([
      {
        name: "source",
        description: "my-lang\n> ",
        type: "string",
      },
    ]);
    if (!source || (source as string).includes("exit")) {
      process.exit(0);
    }
    const program = parser.produceAst(source as string);
    const result = evaluate(program, env);
    console.log(result);
  }
}

// run();
run();
