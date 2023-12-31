import {
  ArrayExpr,
  AssignmentExpr,
  BinrayExpr,
  CallExpr,
  Identifier,
  MemberExpr,
  ObjectLiteral,
  UpdateExpr,
  VarDeclaration,
} from "../../fronted/ast";
import { TokenType } from "../../fronted/lexer";
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
  NativeFnValue,
  FunctionValue as FunctionValue,
  ObjectVal,
  MK_ARRAY,
  ArrayValue as ArrayVal,
  MK_BOOL,
} from "../values";

export function evaluateBinaryExpr(
  binop: BinrayExpr,
  env: Environment
): RuntimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  if (lhs.type === "number" && rhs.type === "number") {
    switch (binop.operator) {
      case "+":
      case "-":
      case "*":
      case "/":
      case "%":
        return evalNumericBinaryExpr(
          lhs as NumberVal,
          rhs as NumberVal,
          binop.operator
        );
      case ">":
      case "<":
      case ">=":
      case "<=":
        return evalCompareBinaryExpr(
          lhs as NumberVal,
          rhs as NumberVal,
          binop.operator
        );
    }
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

export function evalCompareBinaryExpr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string
) {
  let result = false;
  if (operator === ">") result = lhs.value > rhs.value;
  else if (operator === "<") result = lhs.value < rhs.value;
  else if (operator === "<=") result = lhs.value <= rhs.value;
  else if (operator === ">=") result = lhs.value >= rhs.value;
  return MK_BOOL(result);
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
  if (node.assigne.kind === "Identifier") {
    const varname = (node.assigne as Identifier).symbol;
    return env.assignVar(varname, evaluate(node.value, env));
  }
  if (node.assigne.kind === "MemberExpr") {
    const assigne = node.assigne as MemberExpr;
    const obj: ObjectVal =
      assigne.object.kind === "Identifier"
        ? (env.lookupVar((assigne.object as Identifier).symbol) as ObjectVal)
        : (evalMemberExpr(assigne.object as MemberExpr, env) as ObjectVal);
    const property = assigne.property;
    const key =
      property.kind === "Identifier"
        ? (property as Identifier).symbol
        : (evaluate(assigne.property, env) as StringVal).value;
    const val = evaluate(node.value, env);
    obj.properties.set(key, val);
    return val;
  }

  console.error(
    `Invalid LHS inside assign expr ${JSON.stringify(node.assigne)}.`
  );
  process.exit();
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

export function evalCallExpr(expr: CallExpr, env: Environment): RuntimeVal {
  const args = expr.args.map((arg) => evaluate(arg, env));
  const fn = evaluate(expr.caller, env);
  if (fn.type == "native-fn") {
    let result = (fn as NativeFnValue).call(args, env);
    return result;
  } else if (fn.type === "function") {
    const func = fn as FunctionValue;
    const scope = new Environment(func.declarationEnv);

    func.parameters.forEach((varname, index) => {
      scope.declareVar(varname, args[index], false);
    });

    let result: RuntimeVal = MK_NULL();
    for (const stmt of func.body) {
      result = evaluate(stmt, scope);
    }
    return result;
  }
  console.error(
    "Cannot call value that is not a function:",
    JSON.stringify(fn)
  );
  process.exit(0);
}

export function evalMemberExpr(expr: MemberExpr, env: Environment): RuntimeVal {
  if (expr.object.kind === "Identifier") {
    const object = env.lookupVar((expr.object as Identifier).symbol);
    const property = expr.computed
      ? evaluate(expr.property, env)
      : MK_STRING((expr.property as Identifier).symbol);

    if (object.type === "array") {
      if (property.type !== "number") {
        console.error(`Array expected number as key, but got `, property);
        process.exit(0);
      }

      const value =
        (object as ArrayVal).elements[(property as NumberVal).value] ||
        MK_NULL();

      return value;
    }

    if (property.type !== "string") {
      console.error(`Object expected string as key, but got `, property);
      process.exit(0);
    }
    return (
      (object as ObjectVal).properties.get((property as StringVal).value) ||
      MK_NULL()
    );
  }
  const object = evalMemberExpr(expr.object as MemberExpr, env);

  const property = expr.computed
    ? evaluate(expr.property, env)
    : MK_STRING((expr.property as Identifier).symbol);

  if (object.type === "array") {
    if (property.type !== "number") {
      console.error(`Array expected number as key, but got `, property);
      process.exit(0);
    }

    const value =
      (object as ArrayVal).elements[(property as NumberVal).value] || MK_NULL();

    return value;
  }

  if (property.type !== "string") {
    console.error(`Object expected string as key, but got `, property);
    process.exit(0);
  }
  if (object.type !== "object") {
    console.error(`Cannot get ${(property as StringVal).value} from `, object);
    process.exit(0);
  }
  const value =
    (object as ObjectVal).properties.get((property as StringVal).value) ||
    MK_NULL();

  return value;
}

export function evalArrayExpr(expr: ArrayExpr, env: Environment): RuntimeVal {
  const elements: RuntimeVal[] = [];
  for (const element of expr.elements) {
    elements.push(evaluate(element, env));
  }
  return MK_ARRAY(elements);
}

export function evalUpdateExpr(expr: UpdateExpr, env: Environment): RuntimeVal {
  if (expr.arg.kind === "Identifier") {
    const arg = expr.arg as Identifier;
    const val = env.lookupVar(arg.symbol);
    if (val.type == "number") {
      const numVal = val as NumberVal;
      if (expr.operator == "++") {
        numVal.value++;
      } else if (expr.operator == "--") {
        numVal.value--;
      }
      return numVal;
    }

    console.error("UpdateExpr only can update number");
    process.exit(0);
  } else {
    const arg = expr.arg as MemberExpr;
    const objVal =
      arg.object.kind === "Identifier"
        ? (env.lookupVar((arg.object as Identifier).symbol) as ObjectVal)
        : (evaluate(arg.object, env) as ObjectVal);
    const key = arg.computed
      ? (evaluate(arg.property, env) as StringVal).value
      : (arg.property as Identifier).symbol;
    if (!objVal.properties.has(key)) {
      console.error("Cannot update null");
      process.exit(0);
    }

    if (typeof objVal.properties.get(key)!.type === "number") {
      const val = objVal.properties.get(key) as NumberVal;
      if (expr.operator == "++") {
        val.value++;
      } else if (expr.operator == "--") {
        val.value--;
      }
      return val;
    }

    console.error("UpdateExpr only can update number");
    process.exit(0);
  }
}
