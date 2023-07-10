import { BinrayExpr, Identifier, VarDeclaration } from "../../fronted/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { RuntimeVal, NumberVal, MK_NULL, MK_NUMBER } from "../values";

export function evaluateBinaryExpr(binop: BinrayExpr, env: Environment): RuntimeVal {
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

export function evalNumericBinaryExpr(
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

export function evalIdentifier(ident: Identifier, env: Environment): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}

