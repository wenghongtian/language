import {
  Stmt,
  Program,
  Expr,
  BinrayExpr,
  NumbericLiteral,
  Identifier,
  VarDeclaration,
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
    return this.parseAdditiveExpr();
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
    let left = this.parsePrimaryExpr();
    while (
      this.at().value === "*" ||
      this.at().value === "/" ||
      this.at().value === "%"
    ) {
      const operator = this.eat().value;
      const right = this.parsePrimaryExpr();
      left = {
        kind: "BinrayExpr",
        left,
        right,
        operator,
      } as BinrayExpr;
    }
    return left;
  }
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
