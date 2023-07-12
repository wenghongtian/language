import {
  AssignmentExpr,
  BinrayExpr,
  Identifier,
  NumbericLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  StringLiteral,
  VarDeclaration,
} from "../fronted/ast";
import Environment from "./environment";
import {
  evalAssignment,
  evalIdentifier,
  evalObjectExpr,
  evaluateBinaryExpr,
} from "./eval/expressions";
import { evalProgram, evalVarDeclaration } from "./eval/statements";
import {
  MK_NULL,
  MK_NUMBER,
  MK_STRING,
  NullVal,
  NumberVal,
  RuntimeVal,
} from "./values";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumbericLiteral":
      return MK_NUMBER((astNode as NumbericLiteral).value);
    case "StringLiteral":
      return MK_STRING((astNode as StringLiteral).value);
    case "Identifier":
      return evalIdentifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return evalObjectExpr(astNode as ObjectLiteral, env);
    case "BinrayExpr":
      return evaluateBinaryExpr(astNode as BinrayExpr, env);
    case "Program":
      return evalProgram(astNode as Program, env);
    case "VarDeclaration":
      return evalVarDeclaration(astNode as VarDeclaration, env);
    case "AssignmentExpr":
      return evalAssignment(astNode as AssignmentExpr, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode
      );
      process.exit(0);
  }
}
