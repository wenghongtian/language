import {
  Stmt,
  Program,
  Expr,
  BinrayExpr,
  NumbericLiteral,
  Identifier,
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
    return this.parseExpr();
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
