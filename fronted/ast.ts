export type NodeType =
  // statments
  | "Program"
  | "VarDeclaration"
  // expressions
  | "FunctionDeclaration"
  | "AssignmentExpr"
  | "MemberExpr"
  | "CallExpr"
  // literals
  | "Property"
  | "ObjectLiteral"
  | "NumbericLiteral"
  | "Identifier"
  | "BinrayExpr";

export interface Stmt {
  kind: NodeType;
}

export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

export interface VarDeclaration extends Stmt {
  kind: "VarDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expr;
}

export interface Expr extends Stmt {}

export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assigne: Expr;
  value: Expr;
}

export interface BinrayExpr extends Expr {
  kind: "BinrayExpr";
  left: Expr;
  right: Expr;
  operator: string;
}
export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[]
  caller: Expr;
}
export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr;
  property: Expr;
  computed: boolean;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

export interface NumbericLiteral extends Expr {
  kind: "NumbericLiteral";
  value: number;
}

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value: Expr;
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}
