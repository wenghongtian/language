import {
  AssignmentExpr,
  BinrayExpr,
  Identifier,
  ObjectLiteral,
  VarDeclaration,
} from "../../fronted/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import {
  RuntimeVal,
  NumberVal,
  MK_NULL,
  MK_NUMBER,
  MK_OBJECT,
  StringVal,
  MK_STRING,
} from "../values";

export function evaluateBinaryExpr(
  binop: BinrayExpr,
  env: Environment
): RuntimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  if (lhs.type === "number" && rhs.type === "number") {
    return evalNumericBinaryExpr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator
    );
  }
  if (
    lhs.type === "string" &&
    rhs.type === "string" &&
    binop.operator === "+"
  ) {
    return evalStringAddExpr(lhs as StringVal, rhs as StringVal);
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

export function evalStringAddExpr(lhs: StringVal, rhs: StringVal) {
  return MK_STRING(lhs.value + rhs.value);
}

export function evalIdentifier(
  ident: Identifier,
  env: Environment
): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}

export function evalAssignment(
  node: AssignmentExpr,
  env: Environment
): RuntimeVal {
  if (node.assigne.kind !== "Identifier") {
    console.error(
      `Invalid LHS inside assign expr ${JSON.stringify(node.assigne)}.`
    );
    process.exit();
  }
  const varname = (node.assigne as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}

export function evalObjectExpr(
  obj: ObjectLiteral,
  env: Environment
): RuntimeVal {
  const object = MK_OBJECT();
  for (const { key, value } of obj.properties) {
    const runtimeVal =
      value === undefined ? env.lookupVar(key) : evaluate(value, env);

    object.properties.set(key, runtimeVal);
  }

  return object;
}
