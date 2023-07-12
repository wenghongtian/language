import {
  Stmt,
  Program,
  Expr,
  BinrayExpr,
  NumbericLiteral,
  Identifier,
  VarDeclaration,
  AssignmentExpr,
  Property,
  ObjectLiteral,
  CallExpr,
  MemberExpr,
  StringLiteral,
} from "./ast";
import { Token, TokenType, tokenize } from "./lexer";

export default class Parser {
  private tokens: Token[] = [];

  private notEOF(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  public produceAst(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (this.notEOF()) {
      program.body.push(this.parseStmt());
    }

    return program;
  }

  private parseStmt(): Stmt {
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parseVarDeclaration();
      default:
        return this.parseExpr();
    }
  }
  private parseVarDeclaration(): Stmt {
    const isConstant = this.eat().type === TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following let | const keywords."
    ).value;
    if (this.at().type === TokenType.Semicolon) {
      this.eat();
      if (isConstant) {
        console.error(
          "Must assign value to constant expression. No value provided."
        );
        process.exit(0);
      }
      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
        value: undefined,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in var declaration."
    );
    const declaration = {
      kind: "VarDeclaration",
      value: this.parseExpr(),
      constant: isConstant,
      identifier,
    } as VarDeclaration;
    this.expect(
      TokenType.Semicolon,
      "Variable declaration statment must end with semicolon."
    );
    return declaration;
  }

  private parseExpr(): Expr {
    return this.parseAssignmentExpr();
  }

  private parseAssignmentExpr(): Expr {
    const left = this.parseObjectExpr();
    if (this.at().type === TokenType.Equals) {
      this.eat();
      const value = this.parseAssignmentExpr();
      if (value.kind !== "AssignmentExpr") {
        this.expect(
          TokenType.Semicolon,
          "Assignment expression must end with semicolon."
        );
      }
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }
    return left;
  }

  private parseObjectExpr(): Expr {
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parseAdditiveExpr();
    }
    this.eat();
    const properties = new Array<Property>();
    while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
      let key = this.expect(
        TokenType.Identifier,
        "Object literal key expected"
      ).value;
      if (this.at().type == TokenType.Comma) {
        this.eat();
        properties.push({
          key,
          kind: "Property",
        } as Property);
        continue;
      } else if (this.at().type === TokenType.CloseBrace) {
        properties.push({ key, kind: "Property" } as Property);
        continue;
      }
      this.expect(
        TokenType.Colon,
        "MIssing colon following identifier in ObjectExpr."
      );
      const value = this.parseExpr();
      properties.push({ kind: "Property", value, key } as Property);
      if (this.at().type != TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma or closing bracket following property"
        );
      }
    }
    this.expect(TokenType.CloseBrace, "Object literal missing closing brace.");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parseAdditiveExpr(): Expr {
    let left = this.parseMultiplicitaveExpr();
    while (this.at().value === "+" || this.at().value === "-") {
      const operator = this.eat().value;
      const right = this.parseMultiplicitaveExpr();
      left = {
        kind: "BinrayExpr",
        left,
        right,
        operator,
      } as BinrayExpr;
    }
    return left;
  }
  private parseMultiplicitaveExpr(): Expr {
    let left = this.parseCallMemberExpr();
    while (
      this.at().value === "*" ||
      this.at().value === "/" ||
      this.at().value === "%"
    ) {
      const operator = this.eat().value;
      const right = this.parseCallMemberExpr();
      left = {
        kind: "BinrayExpr",
        left,
        right,
        operator,
      } as BinrayExpr;
    }
    return left;
  }

  private parseCallMemberExpr(): Expr {
    const member = this.parseMemberExpr();
    if (this.at().type == TokenType.OpenParen) {
      return this.parseCallExpr(member);
    }
    return member;
  }

  private parseCallExpr(caller: Expr): Expr {
    let callExpr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parseArgs(),
    } as CallExpr;

    if (this.at().type == TokenType.OpenParen) {
      callExpr = this.parseCallExpr(callExpr);
    }

    return callExpr;
  }

  private parseArgs(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis.");
    const args: Expr[] =
      this.at().type == TokenType.CloseParen ? [] : this.parseArgumentsList();
    this.expect(
      TokenType.CloseParen,
      "Missing closing parenthesis inside arguments list."
    );
    return args;
  }

  private parseArgumentsList(): Expr[] {
    const args: Expr[] = [this.parseExpr()];
    while (this.at().type == TokenType.Comma && this.eat()) {
      args.push(this.parseExpr());
    }
    return args;
  }

  private parseMemberExpr(): Expr {
    let object = this.parsePrimaryExpr();
    while (
      this.at().type == TokenType.Dot ||
      this.at().type == TokenType.OpenBracket
    ) {
      const operator = this.eat();
      let property: Expr | undefined = undefined;
      let computed: boolean | undefined = undefined;

      if (operator.type == TokenType.Dot) {
        computed = false;
        property = this.parsePrimaryExpr();

        if (property.kind != "Identifier") {
          console.error(
            "Cannot use dot operator without right handl side being a identifier."
          );
          process.exit(0);
        }
      } else {
        computed = true;
        property = this.parseExpr();
        this.expect(
          TokenType.CloseBracket,
          "Missing closing bracket in computed value."
        );
      }
      object = {
        kind: "MemberExpr",
        object,
        property,
        computed,
      } as MemberExpr;
    }
    return object;
  }

  parseString(): string {
    let str = "";
    while (this.at().type != TokenType.DoubleQuotes) {
      str += this.eat().value;
    }
    this.eat();
    return str;
  }

  /**
   * Orders
   * Assignment
   * Object
   * AdditiveExpr
   * MultiplicitaveExpr
   * Call
   * Member
   * PrimaryExpr
   */

  private parsePrimaryExpr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.Number:
        return {
          kind: "NumbericLiteral",
          value: parseFloat(this.eat().value),
        } as NumbericLiteral;
      case TokenType.DoubleQuotes:
        this.eat();
        return {
          kind: "StringLiteral",
          value: this.parseString(),
        } as StringLiteral;
      case TokenType.OpenParen:
        this.eat();
        const value = this.parseExpr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected found inside parenthesised expression. Exdpected closing parenthesis"
        );
        return value;
      default:
        console.error("Unexpected token found during parsing!", this.at());
        process.exit(0);
    }
  }
  private expect(type: TokenType, err: any) {
    const prev = this.eat();
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, "- Expecting: ", type);
      process.exit(0);
    }
    return prev;
  }
  private eat() {
    return this.tokens.shift()!;
  }
  private at() {
    return this.tokens[0];
  }
}
