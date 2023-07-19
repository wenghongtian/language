import {
  ForStatement,
  FunctionDeclaration,
  Program,
  VarDeclaration,
} from "../../fronted/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { RuntimeVal, MK_NULL, FunctionValue, BooleanVal } from "../values";

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
  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function evalFunctionDeclaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeVal {
  const fn = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionValue;
  return env.declareVar(declaration.name, fn, true);
}

export function evalForStatement(stmt: ForStatement, env: Environment) {
  env = new Environment(env);
  const { init, test, update, body } = stmt;
  evaluate(init, env);
  while ((evaluate(test, env) as BooleanVal).value) {
    const forEnv = new Environment(env);
    for (const bodyStmt of body) {
      evaluate(bodyStmt, forEnv);
    }
    evaluate(update, env);
  }

  return MK_NULL();
}
