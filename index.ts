import prompt from "prompt";
import Parser from "./fronted/parser";
import { evaluate } from "./runtime/interpreter";
import Environment from "./runtime/environment";
import { MK_BOOL, MK_NULL, MK_NUMBER } from "./runtime/values";

prompt.start();

async function main() {
  const parser = new Parser();
  const env = new Environment();
  {
    env.declarevar("null", MK_NULL(), true);
    env.declarevar("true", MK_BOOL(true), true);
    env.declarevar("false", MK_BOOL(false), true);
  }
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

main();
