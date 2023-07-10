import { Program, VarDeclaration } from "../../fronted/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { RuntimeVal, MK_NULL } from "../values";

export function evalProgram(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}

export function evalVarDeclaration(
  declaration: VarDeclaration,
  env: Environment
): RuntimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : MK_NULL();
  return env.declarevar(declaration.identifier, value, declaration.constant);
}
