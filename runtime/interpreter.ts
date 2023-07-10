import {
  BinrayExpr,
  Identifier,
  NumbericLiteral,
  Program,
  Stmt,
  VarDeclaration,
} from "../fronted/ast";
import Environment from "./environment";
import { evalIdentifier, evaluateBinaryExpr } from "./eval/expressions";
import { evalProgram, evalVarDeclaration } from "./eval/statements";
import { MK_NULL, MK_NUMBER, NullVal, NumberVal, RuntimeVal } from "./values";

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
    case "VarDeclaration":
      return evalVarDeclaration(astNode as VarDeclaration, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode
      );
      process.exit(0);
  }
}
