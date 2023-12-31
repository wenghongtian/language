import {
  ArrayExpr,
  AssignmentExpr,
  BinrayExpr,
  CallExpr,
  ForStatement,
  FunctionDeclaration,
  Identifier,
  MemberExpr,
  NumbericLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  StringLiteral,
  UpdateExpr,
  VarDeclaration,
} from "../fronted/ast";
import Environment from "./environment";
import {
  evalArrayExpr,
  evalAssignment,
  evalCallExpr,
  evalIdentifier,
  evalMemberExpr,
  evalObjectExpr,
  evalUpdateExpr,
  evaluateBinaryExpr,
} from "./eval/expressions";
import {
  evalForStatement,
  evalFunctionDeclaration,
  evalProgram,
  evalVarDeclaration,
} from "./eval/statements";
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
    case "CallExpr":
      return evalCallExpr(astNode as CallExpr, env);
    case "BinrayExpr":
      return evaluateBinaryExpr(astNode as BinrayExpr, env);
    case "Program":
      return evalProgram(astNode as Program, env);
    case "ForStatement":
      return evalForStatement(astNode as ForStatement, env);
    case "VarDeclaration":
      return evalVarDeclaration(astNode as VarDeclaration, env);
    case "FunctionDeclaration":
      return evalFunctionDeclaration(astNode as FunctionDeclaration, env);
    case "AssignmentExpr":
      return evalAssignment(astNode as AssignmentExpr, env);
    case "MemberExpr":
      return evalMemberExpr(astNode as MemberExpr, env);
    case "ArrayExpr":
      return evalArrayExpr(astNode as ArrayExpr, env);
    case "UpdateExpr":
      return evalUpdateExpr(astNode as UpdateExpr, env);

    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode
      );
      process.exit(0);
  }
}
