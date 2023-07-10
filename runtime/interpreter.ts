import {
  BinrayExpr,
  Identifier,
  NumbericLiteral,
  Program,
  Stmt,
} from "../fronted/ast";
import Environment from "./environment";
import { MK_NULL, MK_NUMBER, NullVal, NumberVal, RuntimeVal } from "./values";

function evaluateBinaryExpr(binop: BinrayExpr, env: Environment): RuntimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  if (lhs.type === "number" && rhs.type === "number") {
    return evalNumericBinaryExpr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator
    );
  }
  return MK_NULL();
}

function evalNumericBinaryExpr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string
): NumberVal {
  let result = 0;
  if (operator == "+") result = lhs.value + rhs.value;
  else if (operator == "-") result = lhs.value - rhs.value;
  else if (operator == "*") result = lhs.value * rhs.value;
  else if (operator == "/") result = lhs.value / rhs.value;
  else result = lhs.value % rhs.value;
  return MK_NUMBER(result);
}

function evalProgram(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}

function evalIdentifier(ident: Identifier, env: Environment): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumbericLiteral":
      return MK_NUMBER((astNode as NumbericLiteral).value);
    case "Identifier":
      return evalIdentifier(astNode as Identifier, env);
    case "BinrayExpr":
      return evaluateBinaryExpr(astNode as BinrayExpr, env);
    case "Program":
      return evalProgram(astNode as Program, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode
      );
      process.exit(0);
  }
}
